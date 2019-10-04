# 迭代和并发

与同步`Iterators`类似，有许多不同的方法可以迭代和处理`Stream`中的值。有组合子式的方法，如`map`，`filter`和`fold`，
和他们提早退出的错误处理`try_map`，`try_filter`和`try_fold`。

不幸的是，`for`循环中是不能使用`Stream`，但对于命令式的代码，`while let`和`next`/`try_next`能够使用：

```rust
async fn sum_with_next(mut stream: Pin<&mut dyn Stream<Item = i32>>) -> i32 {
    use futures::stream::StreamExt; // for `next`
    let mut sum = 0;
    while let Some(item) = stream.next().await {
        sum += item;
    }
    sum
}

async fn sum_with_try_next(
    mut stream: Pin<&mut dyn Stream<Item = Result<i32, io::Error>>>,
) -> Result<i32, io::Error> {
    use futures::stream::TryStreamExt; // for `try_next`
    let mut sum = 0;
    while let Some(item) = stream.try_next().await? {
        sum += item;
    }
    Ok(sum)
}
```

但是，如果我们一次只处理一个元素，那么我们可能会错过并发机会，毕竟，这就是我们为什么要编写异步代码的原因。
要同时处理流中的多个项，请使用`for_each_concurrent`和`try_for_each_concurrent`方法：

```rust
async fn jump_around(
    mut stream: Pin<&mut dyn Stream<Item = Result<u8, io::Error>>>,
) -> Result<(), io::Error> {
    use futures::stream::TryStreamExt; // for `try_for_each_concurrent`
    const MAX_CONCURRENT_JUMPERS: usize = 100;

    stream.try_for_each_concurrent(MAX_CONCURRENT_JUMPERS, |num| async move {
        jump_n_times(num).await?;
        report_n_jumps(num).await?;
        Ok(())
    }).await?;

    Ok(())
}
```

