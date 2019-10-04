# 消息调度

Riker的计时器模块提供调度功能，允许在给定的持续时间或特定时间后发送消息。 定时器方法在ActorSystem和Context上都公开。

## 一次性调度

有两种方法可以提供一次性调度：

* schedule_once调度在给定延迟之后要发送的消息。
* schedule_at_time计划在给定的特定时间发送的消息。

```rust
let delay = Duration::from_secs(1);
let actor = ctx.actor_of(MyActor::props(), "my-actor").unwrap();

ctx.schedule_once(delay,
                actor,
                None,
                "that's one small step for man".into());
```

这里的消息计划在20秒后发送给 `Actor`。

```rust
let time = SystemTime::now();
let actor = ctx.actor_of(MyActor::props(), "my-actor").unwrap();

ctx.schedule_at_time(time,
                    actor,
                    None,
                    "one giant leap for mankind".into());
```

这里计划在特定时间发送消息。

## 重复调度

可以安排消息以特定间隔重复发送：

schedule方法安排以给定间隔重复发送的消息。

```rust
let delay = Duration::from_millis(100);
let iterv = Duration::from_millis(500);
let actor = ctx.actor_of(MyActor::props(), "my-actor").unwrap();

ctx.schedule(delay,
            interv,
            actor,
            None,
            "a scheduled msg".into());
```

这里消息被安排为每500毫秒重复一次。 还有100毫秒的初始延迟，即重复消息开始之前的持续时间。

> 注意 : Riker的默认计时器模块不是持久性的，这意味着当应用程序停止时任何调度都会丢失。 它针对从几毫秒到48小时的短期持续时间或部署之间的平均时间进行了优化。

## 取消

在调度消息时，返回调度ID，该调度ID可以在以后用于取消调度。

```rust
let id = ctx.schedule(delay,
            interv,
            actor,
            None,
            "a scheduled msg".into());

ctx.cancel_schedule(id);
```

取消计划会将其从计时器中删除，并且将不再发送该消息。

消息调度的一些示例用例包括：

* 等待特定时间让其他参与者提供输入，例如出价系统
* 作为在超时间隔后提供默认消息的工作流程的一部分
* 定期唤醒actor以检查资源，例如队列，IO或传感器
* 定期向其他参与者发布或广播消息

消息调度是并发系统的核心功能，可以驱动应用程序完成其目标。

接下来我们将看看持久化的actor状态，这是构建可扩展的数据驱动应用程序的关键。