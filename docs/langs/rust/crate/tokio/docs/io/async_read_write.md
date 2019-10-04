# 直接使用 AsyncRead 和 AsyncWrite

到目前为止，我们主要在Tokio提供的`I/O`组合器的上下文中讨论了`AsyncRead`和`AsyncWrite`。 虽然这些通常已经足够，但有时您需要实现自己的组合器，这些组合器希望直接执行异步读取和写入。

## 使用AsyncRead读取数据

`AsyncRead`的核心是`poll_read`方法。它映射了`WouldBlock`错误，指示`I/O`读取操作将阻塞到`NotReady`，这反过来让我们可以与`future`世界互操作。当你编写一个内部包含`AsyncRead`的`Future`（或类似的东西，比如`Stream`）时，`poll_read`可能就是你要与之交互的方法。

要记住`poll_read`的重要一点是它遵循与`Future :: poll`相同的合同。具体来说，它不能返回`NotReady`，除非它已安排当前任务在可以再次进行时得到通知。这个事实让我们在我们自己的`future`中调查`poll_read`;我们知道当我们从`poll_read`转发`NotReady`时，我们正在维护`poll`合同，因为`poll_read`遵循相同的合同！

Tokio用于确保`poll_read`后来通知当前任务的确切机制超出了本节的范围，但如果您感兴趣，可以在Tokio内部的非阻塞I/O部分中阅读更多相关内容。

有了这一切，让我们看看我们如何自己实现[read_exact](https://docs.rs/tokio/0.1/tokio/io/fn.read_exact.html)方法！

```rust
#[macro_use]
extern crate futures;
use std::io;
use tokio::prelude::*;

// This is going to be our Future.
// In the common case, this is set to Some(Reading),
// but we'll set it to None when we return Async::Ready
// so that we can return the reader and the buffer.
struct ReadExact<R, T>(Option<Reading<R, T>>);

struct Reading<R, T> {
    // This is the stream we're reading from.
    reader: R,
    // This is the buffer we're reading into.
    buffer: T,
    // And this is how far into the buffer we've written.
    pos: usize,
}

// We want to be able to construct a ReadExact over anything
// that implements AsyncRead, and any buffer that can be
// thought of as a &mut [u8].
fn read_exact<R, T>(reader: R, buffer: T) -> ReadExact<R, T>
where
    R: AsyncRead,
    T: AsMut<[u8]>,
{
    ReadExact(Some(Reading {
        reader,
        buffer,
        // Initially, we've read no bytes into buffer.
        pos: 0,
    }))
}

impl<R, T> Future for ReadExact<R, T>
where
    R: AsyncRead,
    T: AsMut<[u8]>,
{
    // When we've filled up the buffer, we want to return both the buffer
    // with the data that we read and the reader itself.
    type Item = (R, T);
    type Error = io::Error;

    fn poll(&mut self) -> Poll<Self::Item, Self::Error> {
        match self.0 {
            Some(Reading {
                ref mut reader,
                ref mut buffer,
                ref mut pos,
            }) => {
                let buffer = buffer.as_mut();
                // Check that we haven't finished
                while *pos < buffer.len() {
                    // Try to read data into the remainder of the buffer.
                    // Just like read in std::io::Read, poll_read *can* read
                    // fewer bytes than the length of the buffer it is given,
                    // and we need to handle that by looking at its return
                    // value, which is the number of bytes actually read.
                    //
                    // Notice that we are using try_ready! here, so if poll_read
                    // returns NotReady (or an error), we will do the same!
                    // We uphold the contract that we have arranged to be
                    // notified later because poll_read follows that same
                    // contract, and _it_ returned NotReady.
                    let n = try_ready!(reader.poll_read(&mut buffer[*pos..]));
                    *pos += n;

                    // If no bytes were read, but there was no error, this
                    // generally implies that the reader will provide no more
                    // data (for example, because the TCP connection was closed
                    // by the other side).
                    if n == 0 {
                        return Err(io::Error::new(io::ErrorKind::UnexpectedEof, "early eof"));
                    }
                }
            }
            None => panic!("poll a ReadExact after it's done"),
        }

        // We need to return the reader and the buffer, which we can only
        // do by moving them out of self. We do this by taking our state
        // and leaving `None`. This _should_ be fine, because poll()
        // requires callers to not call poll() again after Ready has been
        // returned, so we should only ever see Some(Reading) when poll()
        // is called.
        let reading = self.0.take().expect("must have seen Some above");
        Ok(Async::Ready((reading.reader, reading.buffer)))
    }
}
```

## 使用AsyncWrite写入数据

就像`poll_read`是`AsyncRead`的核心部分一样，`poll_write`是`AsyncWrite`的核心。与`poll_read`一样，它映射了`WouldBlock`错误，该错误指示`I / O`写入操作将阻塞到`NotReady`，这再次允许我们与未来世界互操作。 `AsyncWrite`还有一个`poll_flush`，它为`Write的flush`方法提供异步模拟。 `poll_flush`的作用是确保先前由`poll_write`写入的任何字节都被刷新到基础`I/O`资源上（例如，在网络数据包中写出）。与`poll_write`类似，它包装`Write::flush`，并将一个`WouldBlock`错误映射到`NotReady`，以指示刷新仍在进行中。

`AsyncWrite`的`poll_write`和`poll_flush`遵循与`Future :: poll`和`AsyncRead :: poll_read`相同的合同，即如果它们返回`NotReady`，它们已经安排当前任务在他们可以再次进展时得到通知。与`poll_read`一样，这意味着我们可以在我们自己的`future`中安全地调用这些方法，并且知道我们也在遵守合同。

Tokio使用相同的机制来管理`poll_write`和`poll_flush`的通知，就像它对`poll_read`一样，你可以在Tokio内部的非阻塞`I/O`部分中阅读更多相关内容。

### 关闭

`AsyncWrite`还添加了一个不属于`Write：shutdown`的方法。从其文件：

启动或尝试关闭此编写器，在`I/O`连接完全关闭时返回成功。

此方法旨在用于`I/O`连接的异步关闭。例如，这适用于在代理连接上实现TLS连接的关闭或调用`TcpStream :: shutdown`。协议有时需要清除最终的数据或以其他方式执行正常的关闭握手，适当地读取/写入更多数据。此方法是实现正常关闭逻辑的此类协议的钩子。

这总结很好地关闭：它是一种告诉作者不再有数据的方法，并且它应该以底层`I/O`协议所需的任何方式指示。例如，对于TCP连接，这通常需要关闭TCP通道的写入端，以便另一端以读取形式接收和返回0字节的文件结束。您通常可以将关闭视为在`Drop`的实现中同步完成的操作;只是在异步世界中，你不能轻易地在`Drop`中做一些事情，因为你需要有一个继续轮询你的作家的执行者！

请注意，在实现`AsyncWrite`和`AsyncRead`的类型的写入"half"上调用`shutdown`不会关闭读取"half"。您通常可以继续随意读取数据，直到另一方关闭相应的写入"一半"。

### 使用AsyncWrite的示例

不用多说，让我们来看看我们如何实现

```rust
#[macro_use]
extern crate futures;
use std::io;
use tokio::prelude::*;

// This is going to be our Future.
// It'll seem awfully familiar to ReadExact above!
// In the common case, this is set to Some(Writing),
// but we'll set it to None when we return Async::Ready
// so that we can return the writer and the buffer.
struct WriteAll<W, T>(Option<Writing<W, T>>);

struct Writing<W, T> {
    // This is the stream we're writing into.
    writer: W,
    // This is the buffer we're writing from.
    buffer: T,
    // And this is much of the buffer we've written.
    pos: usize,
}

// We want to be able to construct a WriteAll over anything
// that implements AsyncWrite, and any buffer that can be
// thought of as a &[u8].
fn write_all<W, T>(writer: W, buffer: T) -> WriteAll<W, T>
where
    W: AsyncWrite,
    T: AsRef<[u8]>,
{
    WriteAll(Some(Writing {
        writer,
        buffer,
        // Initially, we've written none of the bytes from buffer.
        pos: 0,
    }))
}

impl<W, T> Future for WriteAll<W, T>
where
    W: AsyncWrite,
    T: AsRef<[u8]>,
{
    // When we've written out the entire buffer, we want to return
    // both the buffer and the writer so that the user can re-use them.
    type Item = (W, T);
    type Error = io::Error;

    fn poll(&mut self) -> Poll<Self::Item, Self::Error> {
        match self.0 {
            Some(Writing {
                ref mut writer,
                ref buffer,
                ref mut pos,
            }) => {
                let buffer = buffer.as_ref();
                // Check that we haven't finished
                while *pos < buffer.len() {
                    // Try to write the remainder of the buffer into the writer.
                    // Just like write in std::io::Write, poll_write *can* write
                    // fewer bytes than the length of the buffer it is given,
                    // and we need to handle that by looking at its return
                    // value, which is the number of bytes actually written.
                    //
                    // We are using try_ready! here, just like in poll_read in
                    // ReadExact, so that if poll_write returns NotReady (or an
                    // error), we will do the same! We uphold the contract that
                    // we have arranged to be notified later because poll_write
                    // follows that same contract, and _it_ returned NotReady.
                    let n = try_ready!(writer.poll_write(&buffer[*pos..]));
                    *pos += n;

                    // If no bytes were written, but there was no error, this
                    // generally implies that something weird happened under us.
                    // We make sure to turn this into an error for the caller to
                    // deal with.
                    if n == 0 {
                        return Err(io::Error::new(
                            io::ErrorKind::WriteZero,
                            "zero-length write",
                        ));
                    }
                }
            }
            None => panic!("poll a WriteAll after it's done"),
        }

        // We use the same trick as in ReadExact to ensure that we can return
        // the buffer and the writer once the entire buffer has been written out.
        let writing = self.0.take().expect("must have seen Some above");
        Ok(Async::Ready((writing.writer, writing.buffer)))
    }
}
```