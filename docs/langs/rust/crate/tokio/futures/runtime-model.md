# 运行时模型

流类似于`future`，但它们不是产生单个值，而是异步地产生一个或多个值。它们可以被认为是异步迭代器。

就像`future`一样，流可以代表各种各样的东西，只要这些东西在未来的某个时间点在不同的点产生离散的价值。例如：

- 由用户以不同方式与GUI交互而导致的UI事件。当事件发生时，流会随着时间的推移向您的应用生成不同的消息。
- 从服务器推送通知。有时请求/响应模型不是您需要的。客户端可以与服务器建立通知流，以便能够从服务器接收消息而无需特别请求。
- 传入套接字连接。当不同的客户端连接到服务器时，连接流将产生套接字连接。

## `Stream`特质

就像`Future`,使用Tokio时实现`Stream`很正常。Streams产生许多值，所以让我们从生成fibonacci序列的流开始。

`Stream`特质如下：

```rust
trait Stream {
    /// The type of the value yielded by the stream.
    type Item;

    /// The type representing errors that occurred while processing the computation.
    type Error;

    /// The function that will be repeatedly called to see if the stream has
    /// another value it can yield
    fn poll(&mut self) -> Poll<Option<Self::Item>, Self::Error>;
}
```

`Item`关联类型是流生成的类型。 `Error`关联类型是发生意外情况时产生的错误类型。 `poll`函数与`Future`的`poll`函数非常相似。 唯一的区别是，这次返回`Option <Self :: Item>`。

流实现具有多次调用的`poll`函数。 当下一个值准备就绪时，返回`Ok（Async :: Ready（Some（value）））`。 当流未准备好生成值时，将返回`Ok（Async :: NotReady）`。 当流耗尽并且不再产生其他值时，返回`Ok（Async :: Ready（None））`。
