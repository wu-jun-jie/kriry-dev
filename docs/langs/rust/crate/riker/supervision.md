# 容错

Riker应用程序通过自我修复展现出容错行为。 这是通过监督实现的 - 每个`Actor`都有一个主管，负责确定如果`Actor`恐慌该怎么办。 在Riker中，`Actor`的父母是其主管。 这种“父母监督”是一种自然的契合，因为`Actor`系统是一个等级制度。

当`Actor`失败时，我们无法保证其状态未被破坏。 其父母有三种选择（策略）：

* 重启`Actor`
* 升级到下一位主管
* 停止`Actor`

监督隔离故障和错误不会泄漏或级联。 相反，系统可以决定恢复到干净，工作状态或优雅停止的最佳方式。

可以使用`supervisor_strategy`方法设置`Actor`应该用来监督其子女的监督策略：

```rust
fn supervisor_strategy(&self) -> Strategy {
    Strategy::Stop
}
```

在这种情况下，如果子`Actor`失败，它会选择停止它。

> 注意 : 如果未设置`supervisor_strategy`，则默认实现为`Strategy :: Restart`。

## 邮箱

一个actor有自己的邮箱，邮件在邮件传递过程中排队。 当消息发送给actor时，它会被添加到actor的邮箱中，然后调度actor进行运行。 如果在处理消息期间，`Actor`失败（恐慌）消息仍然可以继续发送给`Actor`，因为邮箱是分开的。 这允许主管在不丢失消息的情况下处理故障 - 重新启动的actor将在重新启动后继续处理排队的消息。

actor的邮箱继续存在，直到其actor停止或系统停止。

## 重启策略

```rust
fn supervisor_strategy(&self) -> Strategy {
    Strategy::Restart
}
```

重启策略尝试重新启动处于初始状态的actor，该状态被认为是未损坏的。

接下来的顺序是：

1. `Actor`的邮箱被暂停。 可以接收消息，但不会处理它们
2. 失败的`Actor`的所有子`Actor`都被发送终止请求
3. 等待所有子`Actor`终止 - 非阻塞操作
4. 重启失败的actor
5. 恢复actor的邮箱和消息处理

## 升级策略

```rust
fn supervisor_strategy(&self) -> Strategy {
    Strategy::Escalate
}
```

升级策略将如何处理故障的决定移至主管的父母。 这可以通过使当前主管失败来实现，其父主将确定如何处理失败。

接下来的顺序是：

1. `Actor`的邮箱被暂停。 可以接收消息，但不会处理它们
2. 主管升级并且其邮箱被挂起
3. 新主管决定采用哪种监督策略

## 停止策略

```rust
fn supervisor_strategy(&self) -> Strategy {
    Strategy::Stop
}
```

停止策略会停止失败的actor，从系统中删除它及其邮箱。

## Dead letters

当一个actor被终止时，所有现有的ActorRef都会失效。 发送的消息（使用tell）会被重新路由到死信，这是一个专门的通道，向任何感兴趣的`Actor`发布无法传递的消息。 Riker有一个默认订阅者dl_logger，它只使用info！记录死信消息。

## 主管设计

良好的主管设计是设计弹性，容错系统的关键。 其核心是创建一个匹配消息流和依赖关系的actor层次结构。

TODO提供良好的主管设计示例。

接下来，我们将看到如何使用actor路径来消息actor，而无需actor参考并广播到actor层次结构的整个片段。
