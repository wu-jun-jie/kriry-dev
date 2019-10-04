# I/O 概述

Rust标准库提供对网络和`I/O`的支持，例如`TCP`连接，`UDP`套接字，读取和写入文件等。但是，这些操作都是同步或阻塞，这意味着当您调用它们时，当前线程可能会停止执行并进入睡眠状态，直到它被解除阻塞。例如，[std :: io :: Read](https://doc.rust-lang.org/std/io/trait.Read.html)中的`read`方法将阻塞，直到有数据要读取。在`future`的世界中，这种行为是不幸的，因为我们希望在等待`I / O`完成时继续执行我们可能拥有的其他`future`。

为了实现这一点，`Tokio`提供了许多标准库`I / O`资源的非阻塞版本，例如文件操作和`TCP`，`UDP`和`Unix`套接字。它们返回长期运行的`future`（如接受新的TCP连接），并实现`std :: io :: Read`和`std :: io :: Write`的非阻塞变体，称为`AsyncRead`和`AsyncWrite`。

例如，如果没有可用的数据，则不会阻止非阻塞读取和写入。相反，它们会立即返回一个`WouldBlock`错误，以及一个保证（如`Future :: poll`），它们已安排当前任务在以后可以取得进展时被唤醒，例如当网络数据包到达时。

通过使用非阻塞的Tokio`I / O`类型，如果不能立即执行他们希望执行的`I / O`，则执行`I / O`的`future`不再阻止执行其他`future`。相反，它只返回`NotReady`，并依赖于任务通知，以便再次调用`poll`，以及它的`I / O`应该成功而不会阻塞。

在幕后，Tokio使用[mio](https://docs.rs/mio/*/mio)和[tokio-fs](https://docs.rs/tokio/0.1/tokio/fs/index.html)来跟踪不同`future`等待的各种`I / O`资源的状态，并在操作系统的任何状态发生变化时通知操作系统。

## 一个示例服务器

为了了解这是如何组合在一起的，请考虑这个[echo server](https://tools.ietf.org/html/rfc862)实现：

```rust
use tokio::prelude::*;
use tokio::net::TcpListener;

// Set up a listening socket, just like in std::net
let addr = "127.0.0.1:12345".parse().unwrap();
let listener = TcpListener::bind(&addr)
    .expect("unable to bind TCP listener");

// Listen for incoming connections.
// This is similar to the iterator of incoming connections that
// .incoming() from std::net::TcpListener, produces, except that
// it is an asynchronous Stream of tokio::net::TcpStream instead
// of an Iterator of std::net::TcpStream.
let incoming = listener.incoming();

// Since this is a Stream, not an Iterator, we use the for_each
// combinator to specify what should happen each time a new
// connection becomes available.
let server = incoming
    .map_err(|e| eprintln!("accept failed = {:?}", e))
    .for_each(|socket| {
        // Each time we get a connection, this closure gets called.
        // We want to construct a Future that will read all the bytes
        // from the socket, and write them back on that same socket.
        //
        // If this were a TcpStream from the standard library, a read or
        // write here would block the current thread, and prevent new
        // connections from being accepted or handled. However, this
        // socket is a Tokio TcpStream, which implements non-blocking
        // I/O! So, if we read or write from this socket, and the
        // operation would block, the Future will just return NotReady
        // and then be polled again in the future.
        //
        // While we *could* write our own Future combinator that does an
        // (async) read followed by an (async) write, we'll instead use
        // tokio::io::copy, which already implements that. We split the
        // TcpStream into a read "half" and a write "half", and use the
        // copy combinator to produce a Future that asynchronously
        // copies all the data from the read half to the write half.
        let (reader, writer) = socket.split();
        let bytes_copied = tokio::io::copy(reader, writer);
        let handle_conn = bytes_copied.map(|amt| {
            println!("wrote {:?} bytes", amt)
        }).map_err(|err| {
            eprintln!("I/O error {:?}", err)
        });

        // handle_conn here is still a Future, so it hasn't actually
        // done any work yet. We *could* return it here; then for_each
        // would wait for it to complete before it accepts the next
        // connection. However, we want to be able to handle multiple
        // connections in parallel, so we instead spawn the future and
        // return an "empty" future that immediately resolves so that
        // Tokio will _simultaneously_ accept new connections and
        // service this one.
        tokio::spawn(handle_conn)
    });

// The `server` variable above is itself a Future, and hasn't actually
// done any work yet to set up the server. We need to run it on a Tokio
// runtime for the server to really get up and running:
tokio::run(server);
```

更多例子可以在[这里](https://github.com/tokio-rs/tokio/tree/master/examples)找到。