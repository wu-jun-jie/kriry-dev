# Actor层次结构

Riker中的Actor形成一个层次结构，每个actor都可以通过路径寻址。  `actor`在层次结构中的位置由其父级的位置决定。 让我们看一下actor`system`启动后的actor层次结构：

```rust
my-app
└─ user
└─ system
   └─ logger
   └─ event_stream
   └─ dead_letters
   └─ event_store
   └─ default_stream
   └─ io_manager
      └─ tcp
   └─ dl_logger
└─ temp
```

我们可以看到，如果没有开始任何 `actor`，我们已经有很多 `actor`在跑。 在层次结构的基础上是我们的应用程序根，它具有在`system`启动时提供的名称：ActorSystem :: new（“my-app”）。

然后是三个根 `actor`，`user`，`system`和`temp` `actor`。 也许最重要的是`user`，因为作为应用程序的一部分创建的大多数 `actor`都是在这个分支中创建的。

如果我们使用`system.actor_of（props，“my-actor”）`启动一个`actor`，我们可以在`user`下看到它添加：

```rust
my-app
└─ user
   └─ my-actor      <-- our new actor is added
└─ system
   └─ logger
   └─ event_stream
   └─ dead_letters
   └─ event_store
   └─ default_stream
   └─ io_manager
      └─ tcp
   └─ dl_logger
└─ temp
```

在这种情况下，新创建的`my-actor`有一个`/ user / my-actor`路径。 由于它是在`ActorSystem`上使用`actor_of`启动的，因此它被认为是顶级`actor`。

让我们看看当另一个actor启动时层次结构如何变化，这次是使用`Context.actor_of`从`/ user / my-actor`的`receive`方法中。

```rust
impl Actor for MyActor {
    type Msg = String;

    fn receive(&mut self,
                ctx: &Context<Self::Msg>,
                msg: Self::Msg,
                sender: ActorRef<Self::Msg>) {

        ctx.actor_of(MyActor::props(), "my-child").unwrap();
    }
}
```

这里MyActor将启动另一个actor，它也是MyActor的一个实例。

```rust
my-app
└─ user
   └─ my-actor      
      └─ my-child   <-- our new actor is added
└─ system
   └─ logger
   └─ event_stream
   └─ dead_letters
   └─ event_store
   └─ default_stream
   └─ io_manager
      └─ tcp
   └─ dl_logger
└─ temp
```

由于新 `actor`是使用`my-actor`的上下文开始的，因此它会作为`my-actor`的子节点添加到层次结构中。 我子`Actor`的路径变为`/ user / my-actor / my-child`。

让我们继续下一节，在构建弹性应用程序时，明确了 `actor`层次结构实现监督的重要性。