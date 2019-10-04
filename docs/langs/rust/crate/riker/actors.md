# Actor

Actor模型是处理并发计算的概念模型。 Riker框架的核心是四个主要组件：

* **ActorSystem**  -  每个Riker应用程序有一个管理actor生命周期的ActorSystem
* **Actor**  - 实现Actor特征的Rust类型，以便它们可以接收消息
* **Props** - 每个Actor都需要一个`Props`来描述如何创建一个Actor
* **ActorRef**  - 一种克隆成本低廉的轻量级类型，可用于与其底层Actor交互，例如向其发送消息

让我们看看每一个，看看如何创建一个简单的应用程序。

## 定义Actor

Actor是计算的基本单位。 Actor只能以异步方式通过消息进行通信。 Actor可以根据收到的消息执行三个不同的操作：

* 将有限数量的消息发送给其他Actor参与者
* 创造有限数量的新Actor
* 更改其状态或指定用于接收的下一条消息的行为

`Actor`参与者通过传递消息来相互交互。 对上述行为没有假设的顺序，它们可以同时进行。 并发发送的两条消息可以按任意顺序到达。

要定义一个`actor`，系统需要理解一个`actor`应该如何处理它收到的消息。 要做到这一点，只需在数据类型上实现`Actor`特征，并至少提供一个接收方法。

Rust代码：

```rust
struct MyActor;

impl Actor for MyActor {
    type Msg = String;

    fn receive(&mut self,
                ctx: &Context<Self::Msg>,
                msg: Self::Msg,
                sender: Option<ActorRef<Self::Msg>>) {

        println!("received {}", msg);
    }
}
```

在此示例中，一个简单的`struct MyActor`实现了`Actor`特征。 当消息发送到`MyActor`时，系统会将其调度为立即执行。 调用`receive`函数并将消息打印到`stdout`。

## 创建Actor

每个应用程序都有一个`ActorSystem`。 `actor`系统提供actor管理和运行时在发送消息时执行`actor`。 它还提供基本服务，如启动`actor`和暴露系统服务。

启动`actor`系统：

```rust
let model: DefaultModel<String> = DefaultModel::new();
let sys = ActorSystem::new(&model).unwrap();
```

在这里，我们看到`actor`是使用`ActorSystem :: new`启动的。 但是这个型号是什么？ 该模型允许我们配置应用程序中使用的消息类型，并配置用于核心服务的模块。 我们将在本文档后面详细介绍该模型。

一旦我们启动了`Actor`系统，我们就准备启动一些`Actor`了。

启动一个`Actor`：

```rust
let props = Props::new(Box::new(MyActor::new));
let my_actor = sys.actor_of(props, "my-actor");
```

每个`actor`都需要一个包含`actor`的工厂方法的`Props`，在本例中是`MyActor :: new`，以及该方法所需的任何参数。 然后将`Props`与`actor_of`一起使用以创建`actor`的实例。 还需要一个名称，以便我们可以在以后查找，如果需要的话。

虽然这只是两行代码，但很多事情都在幕后发生。 `Actor`生命周期和状态由系统管理。 当一个`actor`开始时它会保留这些属性，以防它再次需要它来重启`actor`，如果它失败了。 当创建一个`actor`时，它会获得自己的邮箱来接收消息，并且其他感兴趣的`actor`会被告知有关加入系统的新`actor`。

## Actor References

当使用`actor_of`启动`actor`时，系统返回对`actor`的引用，即`ActorRef`。 实际的actor实例仍然无法访问，其生命周期由系统管理和保护。 在Rust术语中，系统具有并始终维护actor实例的“所有权”。 当你与`Actor`互动时，你实际上是与`Actor`的ActorRef进行互动！ 这是`Actor`模型的核心概念。

ActorRef始终引用actor的特定实例。 当同一个Actor的两个实例启动时，它们仍然被认为是单独的actor，每个actor都有不同的ActorRef。

> 注意 : ActorRef很轻量，可以克隆（它们实现Clone）而不必过多关注资源。 引用也可以在`Props`中用作另一个actor的工厂方法中的一个字段，一种称为天赋的模式。 ActorRef也是Send，因此它可以作为消息发送给另一个actor。

## 发送消息

`Actor`只能通过消息进行通信。 他们是孤立的。 他们永远不会暴露他们的状态或行为。

如果我们想向actor发送消息，我们在actor的ActorRef上使用tell方法：

```rust
let my_actor = sys.actor_of(props, "my-actor");
my_actor.tell("Hello my actor!".into(), None);
```

这里我们向MyActor actor发送了一个String类型的消息。 第二个参数让我们将发件人指定为`Option <ActorRef>`。 由于我们从主节点发送消息而不是从`Actor`的接收节点发送消息，因此我们将发送方设置为无。

Riker在处理消息时提供某些保证：

* 消息传递是“最多一次”： 消息将传递失败或传递一次， 没有重复传递相同的消息。
* `Actor`随时处理一条消息
* 消息存储在actor的邮箱中，以便接收它们


## 示例

让我们回到我们的MyActor，并将我们目前所见的内容与一个完整的例子结合起来：

Cargo.toml依赖项：

```rust
[dependencies]
riker = "0.2.0"
riker-default = "0.2.0"
```

```rust
extern crate riker;
extern crate riker_default;
#[macro_use]
extern crate log;

use std::time::Duration;
use riker::actors::*;
use riker_default::DefaultModel;

struct MyActor;

// implement the Actor trait
impl Actor for MyActor {
    type Msg = String;

    fn receive(&mut self,
                _ctx: &Context<Self::Msg>,
                msg: Self::Msg,
                _sender: Option<ActorRef<Self::Msg>>) {

        debug!("Received: {}", msg);
    }
}

// provide factory and props functions
impl MyActor {
    fn actor() -> BoxActor<String> {
        Box::new(MyActor)
    }

    fn props() -> BoxActorProd<String> {
        Props::new(Box::new(MyActor::actor))
    }
}

// start the system and create an actor
fn main() {
    let model: DefaultModel<String> = DefaultModel::new();
    let sys = ActorSystem::new(&model).unwrap();

    let props = MyActor::props();
    let my_actor = sys.actor_of(props, "my-actor").unwrap();

    my_actor.tell("Hello my actor!".to_string(), None);

    std::thread::sleep(Duration::from_millis(500));
}
```

在这里，我们启动了actor系统和MyActor的一个实例。 最后，我们向`Actor`发送了一条消息。 你还会注意到我们还提供了一个工厂函数actor（）和`Props`函数props（）作为MyActor实现的一部分。

要查看此示例项目，请单击[此处](https://github.com/riker-rs/examples/tree/master/basic)。

> 注意：如果actor的工厂方法需要参数，则可以使用Props :: new_args。 有关示例，请参阅Rustdocs。

在此页面上，您学习了使用actor创建Riker应用程序的基础知识。 让我们继续下一节，看看如何使用自己的消息类型：
