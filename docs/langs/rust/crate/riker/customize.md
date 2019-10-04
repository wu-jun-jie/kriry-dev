# 模型和定制

Riker需要Model来设置整个系统中使用的消息类型，并指定提供核心服务的模块。 Model是一个可以在Rust类型上实现的特性，然后用于创建ActorSystem。

## Model Trait

让我们来看看Model特征：

```rust
pub trait Model : Sized {
    /// The message type used throughout the system.
    /// `Actor.receive` expects this type
    type Msg: Message;

    /// Dispatcher executes actors and futures
    type Dis: Dispatcher;

    /// Logger provides global logging, e.g. info!("hello");
    type Log: LoggerProps<Msg = Self::Msg>;

    /// Dead letters subscribes to the dead letters channel
    type Ded: DeadLetterProps<Msg = Self::Msg>;

    /// Timer provides message scheduling, e.g. `ctx.schedule_once`
    type Tmr: TimerFactory<Msg = Self::Msg>;

    /// Event store provides the storage system for events/messages
    type Evs: EventStore<Msg=Self::Msg>;

    type Tcp: IoManagerProps<Msg = Self::Msg>;
    type Udp: IoManagerProps<Msg = Self::Msg>;
}
```

模型特征由用于定制Riker系统的各种特征类型组成，包括消息类型。

## 默认模型

riker-default crate提供了一个默认模型，它使用默认的Riker模块，但仍允许您指定消息类型（协议）。

使用默认模型：

```rust
extern crate riker;
extern crate riker_default;

use riker::actors::*;
use riker_default::DefaultModel;

// Get a default model with String as the message type
let model: DefaultModel<String> = DefaultModel::new();
let sys = ActorSystem::new(&model).unwrap();
```

默认模型有助于启动应用程序的初始阶段。 它也是集成测试的不错选择。 当您准备好使用其他模块时，例如特定数据库的事件存储模块，您可以使用自己的模型。

## 自定义模型

由于Model是一个特征，它可以在一个简单的结构上实现。

让我们看看如何创建模型来更改事件存储和日志记录模块：

```rust
extern crate riker;
extern crate riker_default;

use riker::actors::*;
use riker_default::*; // <-- we're still going to use some default modules

struct MyModel;

impl Model for MyModel {
    type Msg = String;
    type Dis = ThreadPoolDispatcher;
    type Ded = DeadLettersActor<Self::Msg>;
    type Tmr = BasicTimer<Self::Msg>;
    type Evs = Redis<Self::Msg>; // <-- a module to provide Redis storage 
    type Tcp = TcpManager<Self::Msg>;
    type Udp = TcpManager<Self::Msg>;
    type Log = MyLogger<Self::Msg>; // <-- our own Log module
}

let sys = ActorSystem::new(&MyModel).unwrap();
```