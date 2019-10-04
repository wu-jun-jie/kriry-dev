# 持久化状态

Riker支持持久性，以便actor可以在重新启动时恢复其状态。 Riker采用事件采购方法来持久化数据，因此只保留对状态而不是整个当前状态的更改。对actor的状态的这些更改被视为事件，并附加到基础事件存储。持久保持其状态的行动者通常被称为持久行动者。

活动采购
当持久性actor重新启动时，可以通过重放事件存储中特定于actor的所有事件来恢复其状态，这是我们最初持久化的顺序。与传统的数据持久性方法相比，事件源具有多个优势。

由于持久性actor在内存中保持其状态，因此不必持续从存储中读取数据。只有当actor启动时才会从底层存储中读取事件。这允许极高的交易率。

事件源简化了数据存储，因为事件通常是序列化对象，可以持久保存到数据库中的单个列或字段。还可以利用其他非数据库存储方法，例如持久队列或事务日志。数据查询的复杂性（例如数据库模式设计和索引）与事件源不相关。此外，由于数据结构简化，数据存储解决方案之间的迁移变得更加容易。

另外一个附加价值是，您通过事件采购的不可变性来获得固有的审计 - 每个事件都被记录下来并保持相应的状态。

## 启用持久性

可以将actor配置为持久化状态，即通过在Actor特征的persistence_conf方法上返回PersistenceConf来成为持久化actor：

```rust
struct MyActor {
    id: String,
    val: u32,
}

fn persistence_conf(&self) -> Option<PersistenceConf> {
    let conf = PersistenceConf {
        id: self.id.clone(),
        keyspace: "my-actor".to_string()
    };

    Some(conf)
}
```

id和keypace的组合允许底层事件存储分离事件，以便当actor重新启动时，仅查询该actor的事件。 如何使用这些字段完全取决于使用的事件存储模块。

> 警告 : 事件必须特定于实际的actor实例。 对表示同一逻辑实体的两个actor（例如特定用户）进行负载平衡将发生冲突，因为只有处理该事件的actor才会更新其状态。

## 持久化事件

持久化`actor`使用`ctx.persist_event`方法实际持久化状态。 与Riker中的所有其他Actor操作一样，这是一个非阻塞操作：

```rust
fn receive(&mut self,
            ctx: &Context<Self::Msg>,
            msg: Self::Msg,
            _sender: Option<ActorRef<Self::Msg>>) {

    ctx.persist_event(msg); // <-- schedule event to be persisted
}
```

在这里，我们看到ctx.persist_event用于请求存储事件。在这种情况下，我们使用收到的消息作为事件，但这可能是您配置的协议的任何生锈类型。此时要强调两个重要概念：

* persist_event是一个非阻塞操作，执行将继续
* 无法保证事件将成功存储

由于这两个因素很重要，因此在知道事件已成功写入事件存储之前，不要进行任何状态更改。当事件成功提交到存储时，事件存储负责向actor发送信号。

当调用ctx.persist_event时，持久性actor进入“持久”状态。在此状态期间，actor不会处理其他消息，直到事件存储发回信号表明事件已成功存储为止。发生这种情况是为了保证当接收actor要处理的下一条消息具有最新状态时。

成功存储事件时调用actor的apply_event方法：

```rust
fn apply_event(&mut self, _ctx: &Context<Self::Msg>, evt: Self::Msg) {
    self.val = evt; // <-- safe to update the state

    // Its also safe to create side effects here
    // e.g.
    // `some_actor.tell("your support request was received", None);`
}
```

在apply_event中可以安全地改变状态，因为在这个阶段的任何失败意味着当actor重新启动时将重放该事件。

> 警告 : 永远不要在接收持久性演员时进行状态更改。

## 重播事件

当持久性actor启动时，将根据配置的id和键空间查询其事件。 保证在持久性actor完成重放所有事件之前，接收不会处理任何消息。 加载事件的查询是非阻塞操作。

查询完所有事件后，将为每个事件调用replay_event方法：

```rust
fn replay_event(&mut self, _ctx: &Context<Self::Msg>, evt: Self::Msg) {
    self.val += evt; // <-- safe to update the state

    // It is *not* safe to create side effects in replay_event
}
```

replay_event类似于apply_event，该状态应该在此方法中进行变异。 但是，在重放期间可能存在初始持久性期间必需的不良副作用，例如发送其他消息。 例如，如果您的演员每次发出请求时都会向客户发送电子邮件，则每次演员重新启动时都不希望发送这些消息。

让我们看一个持久化actor的完整示例：

```rust
struct MyActor {
    id: String,
    val: u32,
}

impl Actor for MyActor {
    type Msg = u32;

    fn receive(&mut self,
                ctx: &Context<Self::Msg>,
                msg: Self::Msg,
                _sender: Option<ActorRef<Self::Msg>>) {

        ctx.persist_event(msg);
    }

    fn persistence_conf(&self) -> Option<PersistenceConf> {
        let conf = PersistenceConf {
            id: self.id.clone(),
            keyspace: "my-actor".to_string()
        };

        Some(conf)
    }

    fn apply_event(&mut self, _ctx: &Context<Self::Msg>, evt: Self::Msg) {
        self.val += evt;
    }

    fn replay_event(&mut self, _ctx: &Context<Self::Msg>, evt: Self::Msg) {
        self.val += evt;
    }

}
```

## 事件Store

在Riker中，事件将持久保存到创建actor系统时在模型中配置的“事件存储”。 事件存储负责存储和加载事件。 为了支持您的特定存储或数据库，可以实现EventStore特征：

```rust
pub trait EventStore : Clone + Send + Sync + 'static {
    type Msg: Message;

    fn new(config: &Config) -> Self;

    fn insert(&mut self, id: &String, keyspace: &String, evt: Evt<Self::Msg>);

    fn load(&self, id: &String, keyspace: &String) -> Vec<Self::Msg>;
}
```

EventStore的一个实现只需要在新函数中提供一个Self实例，该实例将在actor系统启动时调用。 insert和load方法执行必要的任何序列化和反序列化。 当使用persist_event和actor分别启动时，将调用这些方法。

> 注意 : 由于事件存储仅包含事件，因此不能将整个状态数据序列化并存储在数据库表的单个列中。 可以使用CBOR，JSON，MessagePack或任何其他序列化格式。

> 默认模型使用简单的内存事件存储，这在测试和简单应用程序中很有用。 当actor系统停止时，所有事件都将丢失。

## CQRS

命令查询责任分离（CQRS）构建了事件源的顶层，以提供更加结构化的持久性方法。 事件采购单独适用于在具有固定数量的演员的演员系统中恢复个体演员状态。 这可以进一步采取，以便可以将数据实体建模为参与者。 例如，实体可以是用户，帐户，发布，交易，订单等，其中每个实例由其自己的actor实例表示。

要对实体进行更改，命令将发送到表示该实体的actor。 例如，要更改用户实体的密码，可以发送UpdatePasswordCmd，或者为了禁用用户，可以发送DisableUserCmd。 当一个actor接收到一个命令时，它会验证它，然后发出一个将被持久化并应用的事件：

```rust
UpdatePasswordCmd => PasswordUpdatedEvt
DisableUserCmd => UserDisabledEvt
```

为了帮助设置实体和命令管理，Riker CQRS是一个单独的包（riker-cqrs），它引入了：

* 实体管理
* 基于命令的消息

由于每个实体都有自己的actor，因此需要一个协调器，在需要时创建actor并将命令路由到正确的actor。 基本簿记也是必需的，这样演员可以在一段时间不活动后睡觉并从内存中移除，然后在需要处理命令时恢复。

让我们看看如何设置代表银行账户的实体经理BankAccount：

```rust
use riker_cqrs::*;

let model: DefaultModel<TestMsg> = DefaultModel::new();
let sys = ActorSystem::new(&model).unwrap();

let em = Entity::new(&sys,
                    BankAccountProps,
                    "BankAccont",
                    None).unwrap();
```

此处创建了一个实体，用于管理银行账户的所有实例。 如有必要，它将创建新的actor并路由命令。

让我们创建一个新的银行账户并进行首次存款：

```rust
let number = "12345678";
let name = "Dolores Abernathy";

// create bank account
let cmd = CQMsg::Cmd(number.into(), Protocol::CreateAccountCmd(name.into()));
em.tell(cmd, None);

// deposit $1000
let cmd = CQMsg::Cmd(number.into(), Protocol::DepositCmd(1000));
em.tell(cmd, None);
```

命令需要一个ID，并且基于该ID，实体管理器将命令路由到该ID的actor。 如果内存中没有该ID的当前实时actor，则管理器将启动一个actor。 在处理命令之前，将加载与该ID关联的任何事件并恢复actor状态。

而不是使用actor_of直接管理actor创建，而不是实体管理器。 您将注意到示例中的Entity :: new已通过BankAccountProps。 这是一个实现EntityActorProps特征的结构。

由于每个实体actor都需要自己的唯一ID，因此在actor_of中使用的标准Props是不够的。 而是实现了EntityActorProps：

```rust
struct BankAccountProps;

impl EntityActorProps for BankAccountProps {
    type Msg = Protocol;

    fn props(&self, id: String) -> BoxActorProd<Self::Msg> {
        Props::new_args(Box::new(BankAccountActor::new), id)
    }
}
```

> 注意 : 如果actor系统之外的其他系统需要查看当前状态（通常是这种情况），则每次持久化事件时，可以生成物化视图并将其存储在单独的数据存储中。 这提供了状态管理的命令端和查询端之间的明确分离。

默认情况下，如果实体actor实例在120秒内没有活动，则管理器将使actor处于睡眠状态。 在这种状态下，演员及其状态不再在记忆中。 当命令被发送到处于睡眠状态的actor时，它被管理器唤醒，其状态恢复，并且命令被处理。

可以在riker.toml中更改睡眠的不活动时间：

```toml
[cqrs]
# number of seconds of inactivity after which a cqrs actor will sleep
sleep_after_secs = 120
```