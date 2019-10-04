# 消息协议

在Riker中，单个actor系统具有定义的消息类型，即协议。 协议可以是简单类型，例如String。 简单的String协议在大多数现实世界的应用程序中都没有用，在这些应用程序中可能有多个actor，每个actor都有自己专门的消息类型要求

任何Rust类型都可以用作消息协议，只要它是`Clone`和`Send`即可。 此外，必须实现`Into` trait，特别是`Into <ActorMsg>`.

```rust
enum Protocol {
    CreateUser(String, String), // username, password
    UpdateUser(String), // password
    DeleteUser(String), // username
}

impl Into<ActorMsg<Protocol>> for Protocol {
    fn into(self) -> ActorMsg<Protocol> {
        ActorMsg::User(self)
    }
}
```

这里将协议转换为所需的`ActorMsg :: User`变体。

要配置Riker应用程序以使用您的消息类型，只需在模型中进行设置即可。 如果您使用`riker-default` crate中的默认Riker模型，则可以使用以下命令：

```rust
let model: DefaultModel<Protocol> = DefaultModel::new();
```

这提供了一个配置为使用Protocol enum的默认模型实例。

如果您使用自定义模型，则可以在模型和自定义中查看如何设置消息协议。

接下来，您将看到actor如何形成层次结构。
