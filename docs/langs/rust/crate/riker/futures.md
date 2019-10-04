# 运行`Future`

Riker可以执行并推动`Future`完成。 实际上，内部参与者由调度员作为`Future`执行。 这意味着Riker可以与演员一起在同一个调度员上运行任何 `Future`。

`ActorSystem`和`Context`都有一个接受 `Future`运行的`execute`方法：

```rust
let handle = system.execute(async move {
    format!("some_val_{}", i)
});

assert_eq!(block_on(handle).unwrap(), format!("some_val_{}", i));
```

`sys.execute`计划将来执行，调度程序将使用调度程序的线程池将其驱动完成。 `execute`返回`future :: future :: RemoteHandle` future，可用于提取结果。

> 注意 : 默认的Riker调度程序使用`Futures` crate的`ThreadPool`来运行 `Future`。

在下一节中，我们将了解如何测试`Riker`应用程序。