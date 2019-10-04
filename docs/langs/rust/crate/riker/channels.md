# 通道

Riker频道允许将消息发布给感兴趣的订阅者。 频道是 `Actor`，因此开始和传递频道的方式与任何其他 `Actor`的工作方式相同。

## 开始一个通道

`Channel :: props（）`方法返回一个Props，可用于使用actor_of创建一个通道：

```rust
let chan = sys.actor_of(Channel::props(), "my-channel").unwrap();
```

其他开始的 `Actor`可以被赋予频道的ActorRef，以便他们可以订阅。

## 订阅

`ChannelMsg :: Subscribe`消息用于订阅频道：

```rust
chan.tell(Subscribe("my-topic".into(), sub1), None);
```

如果我们有一个actor `sub1`，我们可以订阅我们之前开始的chan频道。 由于要在消息中提供要订阅的actor，这意味着任何actor都可以将另一个actor订阅到一个频道。 您还会注意到订阅需要一个主题。

频道由一个或多个主题组成，通常具有共同主题。 发布消息时，它将发布到通道上的特定主题。

> 注意 : 订阅某个主题时，如果该主题尚未存在，则会创建该主题，并将发布给该主题的任何未来消息发送给该订阅者。

## 发布

`ChannelMsg :: Publish`消息用于发布到频道：

```rust
let msg = Publish("my-topic".into(), "Building better worlds".into());
chan.tell(msg, None);
```

此消息将被克隆并发送到频道chan上我的主题的每个订阅者。

## 示例

我们来看一个例子：

```rust
// start two instances of MyActor
let props = Props::new(Box::new(MyActor::actor));
let sub1 = sys.actor_of(props.clone(), "sub1").unwrap();
let sub2 = sys.actor_of(props, "sub2").unwrap();

// start a channel
let chan = sys.actor_of(Channel::props(), "my-channel").unwrap();

// subscribe actors to channel
chan.tell(Subscribe("my-topic".into(), sub1), None);
chan.tell(Subscribe("my-topic".into(), sub2), None);

// publish a message
let msg = Publish("my-topic".into(), "Remember the cant!".into());
chan.tell(msg, None);
```

在这里，我们开始两个将成为订阅者的角色。 启动了一个频道my-channel，我们为每个订阅者发送一个ChannelMsg :: Subscribe进行订阅。 然后我们使用chan.tell发布消息，这将导致sub1和sub2都接收消息的副本。

## 普通通道

当actor系统启动时，会创建几个通道。 这些通道可帮助开发人员接收有关系统事件和失败消息的消

### 事件流

事件流提供系统事件，包括ActorCreated，ActorRestarted和ActorTerminated事件。 每个都被分别作为主题actor.created，actor.restarted和actor.terminated主题。

```rust
sys.event_stream().tell(Subscribe("actor.created".into(), sub1), None);
```

### 默认流

默认流是用户可以使用的通用通道。 它节省了创建专用频道的需要。

```rust
sys.default_stream().tell(Subscribe("my-topic".into(), sub1), None);
```

渠道构成了Riker系统不可或缺的一部分，并为创建动态应用程序提供必要的服务，其中 `Actor`协作以实现共同目标。

接下来，我们将查看将来一次发送的调度消息。