# 数据读写

## 非阻塞I / O

在概述中我们简要提到Tokio的`I / O`类型实现了`std :: io :: Read`和`std :: io :: Write`的非阻塞变体，称为`AsyncRead`和`AsyncWrite`。 这些是Tokio的`I / O`故事中不可或缺的一部分，在使用`I / O`代码时很重要。

> 注意：在本节中，我们将主要讨论[AsyncRead](https://docs.rs/tokio-io/0.1/tokio_io/trait.AsyncRead.html)，但[AsyncWrite](https://docs.rs/tokio-io/0.1/tokio_io/trait.AsyncWrite.html)几乎完全相同，仅用于将数据写入`I / O`资源（如`TCP`套接字）而不是从中读取。

那么，让我们来看看`AsyncRead`，看看所有的大惊小怪：

```rust
use std::io::Read;
pub trait AsyncRead: Read {
    // ...
    // various provided methods
    // ...
}
```

呵呵。 这里发生了什么？ 好吧，`AsyncRead`实际上只是从`std :: io`中的[Read](https://doc.rust-lang.org/std/io/trait.Read.html)，还有一个额外的合同。 `AsyncRead`的文档如下：

此特征继承自`std :: io :: Read`，表示`I / O`对象是非阻塞的。 **当字节不可用而不是阻塞当前线程时，所有非阻塞`I / O`对象都必须返回错误**。

最后一部分是至关重要的。 如果为类型实现`AsyncRead`，则承诺对其进行调用将永远不会阻塞。 相反，如果它不是非阻塞的，则应该返回一个`io :: ErrorKind :: WouldBlock`错误以指示操作将被阻止（例如因为没有可用的数据）。 提供的`poll_read`方法：

```rust
fn poll_read(&mut self, buf: &mut [u8]) -> Poll<usize, std::io::Error> {
    match self.read(buf) {
        Ok(t) => Ok(Async::Ready(t)),
        Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
            Ok(Async::NotReady)
        }
        Err(e) => Err(e),
    }
}
```

这段代码应该很熟悉。 如果你稍微眯一下，`poll_read`看起来很像`Future :: poll`。 那是因为这几乎就是它的本质！ 实现`AsyncRead`的类型本质上就像您可以尝试从中读取数据的`Future`，并且它将通知您它是否已准备好（并且某些数据已被读取）或`NotReady`（并且您将不得不稍后再次轮询）。

## 使用`Future` `I/O`

由于`AsyncRead`（和`AsyncWrite`）几乎都是`Future`，因此您可以轻松地将它们嵌入到您自己的`Future`中，并像轮询任何其他嵌入式`Future`一样轮询它们。你甚至可以使用`try_ready！`根据需要传播错误和`NotReady`。我们将在下一节中详细讨论直接使用这些特质。但是，为了在许多情况下简化生活，Tokio在[tokio :: io](https://docs.rs/tokio/0.1/tokio/io/index.html)中提供了许多有用的组合器，用于在`AsyncRead`和`AsyncWrite`之上执行常见的`I / O`操作。通常，它们提供围绕实现F`uture`的`AsyncRead`或`AsyncWrite`类型的包装器，并在给定的读取或写入操作完成时完成。

第一个方便的`I / O`组合器是[read_exact](https://docs.rs/tokio/0.1/tokio/io/fn.read_exact.html)。它需要一个可变缓冲区（`＆mut [u8]）`和`AsyncRead`的实现者作为参数，并返回一个`Future`，它读取足够的字节来填充缓冲区。在内部，返回的`Future`只跟踪它到目前为止读取了多少字节，并继续在`AsyncRead`上发出`poll_ready`（如果需要，返回`NotReady`），直到它完全填满缓冲区。此时，它将使用填充的缓冲区返回`Ready（buf`）。让我们来看看：

```rust
use tokio::net::tcp::TcpStream;
use tokio::prelude::*;

let addr = "127.0.0.1:12345".parse().unwrap();
let read_8_fut = TcpStream::connect(&addr)
    .and_then(|stream| {
        // We need to create a buffer for read_exact to write into.
        // A Vec<u8> is a good starting point.
        // read_exact will read buffer.len() bytes, so we need
        // to make sure the Vec isn't empty!
        let mut buf = vec![0; 8];

        // read_exact returns a Future that resolves when
        // buffer.len() bytes have been read from stream.
        tokio::io::read_exact(stream, buf)
    })
    .inspect(|(_stream, buf)| {
        // Notice that we get both the buffer and the stream back
        // here, so that we can now continue using the stream to
        // send a reply for example.
        println!("got eight bytes: {:x?}", buf);
    });

// We can now either chain more futures onto read_8_fut,
// or if all we wanted to do was read and print those 8
// bytes, we can just use tokio::run to run it (taking
// care to map Future::Item and Future::Error to ()).
```

通常有用的第二个`I / O`组合器是[write_all](https://docs.rs/tokio/0.1/tokio/io/fn.write_all.html)。 它需要一个缓冲区（`＆[u8]）`和`AsyncWrite`的实现者作为参数，并返回一个`Future`，它使用`poll_write`将缓冲区的所有字节写入`AsyncWrite`。 当`Future`解析时，整个缓冲区已被写出并刷新。 我们可以将它与[read_exact](https://docs.rs/tokio/0.1/tokio/io/fn.read_exact.html)结合起来，以回应服务器回复的内容：

```rust
use tokio::net::tcp::TcpStream;
use tokio::prelude::*;

let echo_fut = TcpStream::connect(&addr)
    .and_then(|stream| {
        // We're going to read the first 32 bytes the server sends us
        // and then just echo them back:
        let mut buf = vec![0; 32];
        // First, we need to read the server's message
        tokio::io::read_exact(stream, buf)
    })
    .and_then(|(stream, buf)| {
        // Then, we use write_all to write the entire buffer back:
        tokio::io::write_all(stream, buf)
    })
    .inspect(|(_stream, buf)| {
        println!("echoed back {} bytes: {:x?}", buf.len(), buf);
    });

// As before, we can chain more futures onto echo_fut,
// or declare ourselves finished and run it with tokio::run.
```

Tokio还带有一个`I / O`组合器来实现这种复制。 它（也许不出所料）称为副本。 [copy](https://docs.rs/tokio/0.1/tokio/io/fn.copy.html)采用`AsyncRead`和`AsyncWrite`，并连续将从`AsyncRead`读出的所有字节写入`AsyncWrite`，直到`poll_read`指示输入已关闭并且所有字节都已写出并刷新到输出。 这是我们在`echo`服务器中使用的组合器！ 它大大简化了我们上面的示例，并使其适用于任何数量的服务器数据！

```rust
use tokio::net::tcp::TcpStream;
use tokio::prelude::*;

let echo_fut = TcpStream::connect(&addr)
    .and_then(|stream| {
        // First, we need to get a separate read and write handle for
        // the connection so that we can forward one to the other.
        // See "Split I/O resources" below for more details.
        let (reader, writer) = stream.split();
        // Then, we can use copy to send all the read bytes to the
        // writer, and return how many bytes it read/wrote.
        tokio::io::copy(reader, writer)
    })
    .inspect(|(bytes_copied, r, w)| {
        println!("echoed back {} bytes", bytes_copied);
    });
```

很简约！

到目前为止我们谈到的组合器都是针对相当低级别的操作：读取这些字节，写入这些字节，复制这些字节。 但是，通常情况下，您希望在更高级别的表示上操作，例如`行`。 Tokio也在那里覆盖！ [lines](https://docs.rs/tokio/0.1/tokio/io/fn.lines.html)接受`AsyncRead`，并返回一个`Stream`，它从输入中产生每一行，直到没有更多行要读取：

```rust
use tokio::net::tcp::TcpStream;
use tokio::prelude::*;

let lines_fut = TcpStream::connect(&addr).and_then(|stream| {
    // We want to parse out each line we receive on stream.
    // To do that, we may need to buffer input for a little while
    // (if the server sends two lines in one packet for example).
    // Because of that, lines requires that the AsyncRead it is
    // given *also* implements BufRead. This may be familiar if
    // you've ever used the lines() method from std::io::BufRead.
    // Luckily, BufReader from the standard library gives us that!
    let stream = std::io::BufReader::new(stream);
    tokio::io::lines(stream).for_each(|line| {
        println!("server sent us the line: {}", line);
        // This closure is called for each line we receive,
        // and returns a Future that represents the work we
        // want to do before accepting the next line.
        // In this case, we just wanted to print, so we
        // don't need to do anything more.
        Ok(())
    })
});
```

[tokio :: io](https://docs.rs/tokio/0.1/tokio/io/index.html)中还有更多`I / O`组合器，您可能需要在决定编写自己的之前先查看一下！

## 拆分`I/O`资源

上面的复制示例和echo服务器都包含这个神秘的片段：

```rust
let (reader, writer) = socket.split();
let bytes_copied = tokio::io::copy(reader, writer);
```

正如上面的评论所解释的那样，我们将`TcpStream`（套接字）拆分为读`half`和写`half`，并使用我们上面讨论的[copy](https://docs.rs/tokio/0.1/tokio/io/fn.copy.html)组合器生成一个`Future`，它将读取的一半中的所有数据异步复制到写半。但为什么首先需要这种“分裂”呢？毕竟，`AsyncRead :: poll_ready`和`AsyncWrite :: poll_write`只需要使用`＆mut self`。

要回答这个问题，我们需要回顾一下Rust的所有权制度。回想一下，Rust只允许您一次对给定变量进行单个可变引用。但是我们必须传递两个参数来复制，一个用于从哪里读取，一个用于写入。但是，一旦我们将一个可变引用传递给`TcpStream`作为参数之一，我们就不能构造第二个可变引用作为第二个参数传递给它！我们知道副本不会同时读取和写入，但这不会在副本的类型中表达。

当类型也实现`AsyncWrite`时，在`AsyncRead` trait上提供了[split](https://docs.rs/tokio-io/0.1/tokio_io/trait.AsyncRead.html##method.split)方法，如果我们看一下签名，我们就会看到

```rust
fn split(self) -> (ReadHalf<Self>, WriteHalf<Self>)
  where Self: AsyncWrite { ... }
```

返回的`ReadHalf`实现了`AsyncRead`，而`WriteHalf`实现了`AsyncWrite`。 至关重要的是，我们现在有两个单独的指针指向我们的类型，我们可以单独传递。 这对于复制([copy](https://docs.rs/tokio/0.1/tokio/io/fn.copy.html))来说非常方便，但它也意味着我们可以将每一半传递给不同的`future`，并完全独立地处理读写操作！ 在幕后，分割确保如果我们同时尝试读取和写入，则一次只发生其中一个。

## 传输

在需要执行`I / O`的应用程序中，将`AsyncRead`转换为`Stream`（就像行一样）或`AsyncWrite`转换为`Sink`是很常见的。他们经常想要抽象出从线上检索或放置字节的方式，并让他们的大多数应用程序代码处理更方便的"请求"和"响应"类型。这通常称为"构造"：您可以将它们视为接收和发送的应用程序数据的"框架"，而不是将您的连接仅视为字节输入/字节输出。字节构造流通常被称为"传输"。

传输通常使用编解码器实现。例如，[lines](https://docs.rs/tokio/0.1/tokio/io/fn.lines.html)表示一个非常简单的编解码器，它将字节字符串与换行符`\n`分隔开来，并在将每个帧作为字符串分析之后再传递给应用程序。 Tokio提供帮助程序，用于在`tokio :: codec`中实现新的编解码器;为传输实现编码器和解码器特性，并使用`Framed :: new`从字节流中创建一个`Sink + Stream`（如`TcpStream`）。这几乎就像魔术一样！还有一些版本只用于编解码器的读或写端（如线）。让我们看一下编写基于行的编解码器的简单实现（即使存在`LinesCodec`）：

```rust
extern crate bytes;
use bytes::{BufMut, BytesMut};
use tokio::codec::{Decoder, Encoder};
use tokio::prelude::*;

// This is where we'd keep track of any extra book-keeping information
// our transport needs to operate.
struct LinesCodec;

// Turns string errors into std::io::Error
fn bad_utf8<E>(_: E) -> std::io::Error {
    std::io::Error::new(std::io::ErrorKind::InvalidData, "Unable to decode input as UTF8")
}

// First, we implement encoding, because it's so straightforward.
// Just write out the bytes of the string followed by a newline!
// Easy-peasy.
impl Encoder for LinesCodec {
    type Item = String;
    type Error = std::io::Error;

    fn encode(&mut self, line: Self::Item, buf: &mut BytesMut) -> Result<(), Self::Error> {
        // Note that we're given a BytesMut here to write into.
        // BytesMut comes from the bytes crate, and aims to give
        // efficient read/write access to a buffer. To use it,
        // we have to reserve memory before we try to write to it.
        buf.reserve(line.len() + 1);
        // And now, we write out our stuff!
        buf.put(line);
        buf.put_u8(b'\n');
        Ok(())
    }
}

// The decoding is a little trickier, because we need to look for
// newline characters. We also need to handle *two* cases: the "normal"
// case where we're just asked to find the next string in a bunch of
// bytes, and the "end" case where the input has ended, and we need
// to find any remaining strings (the last of which may not end with a
// newline!
impl Decoder for LinesCodec {
    type Item = String;
    type Error = std::io::Error;

    // Find the next line in buf!
    fn decode(&mut self, buf: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        Ok(if let Some(offset) = buf.iter().position(|b| *b == b'\n') {
            // We found a newline character in this buffer!
            // Cut out the line from the buffer so we don't return it again.
            let mut line = buf.split_to(offset + 1);
            // And then parse it as UTF-8
            Some(
                std::str::from_utf8(&line[..line.len() - 1])
                    .map_err(bad_utf8)?
                    .to_string(),
            )
        } else {
            // There are no newlines in this buffer, so no lines to speak of.
            // Tokio will make sure to call this again when we have more bytes.
            None
        })
    }

    // Find the next line in buf when there will be no more data coming.
    fn decode_eof(&mut self, buf: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        Ok(match self.decode(buf)? {
            Some(frame) => {
                // There's a regular line here, so we may as well just return that.
                Some(frame)
            },
            None => {
                // There are no more lines in buf!
                // We know there are no more bytes coming though,
                // so we just return the remainder, if any.
                if buf.is_empty() {
                    None
                } else {
                    Some(
                        std::str::from_utf8(&buf.take()[..])
                            .map_err(bad_utf8)?
                            .to_string(),
                    )
                }
            }
        })
    }
}
```