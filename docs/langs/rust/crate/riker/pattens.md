# 模式

## Ask

Ask模式允许`actor`将`actor`发送到actor系统之外。 该值作为`Future`传递。

让我们来看看它是如何工作的：

```rust
extern crate riker_patterns;

use riker_patterns::ask;

struct MyActor;

impl Actor for MyActor {
    type Msg = u32;

    fn receive(&mut self,
                ctx: &Context<Self::Msg>,
                msg: Self::Msg,
                sender: ActorRef<Self::Msg>) {

        // sender is the Ask, waiting to a message to be sent back to it
        sender.try_tell(msg * 2, Some(ctx.myself()));
    }
}

fn main() {
    let model: DefaultModel<u32> = DefaultModel::new();
    let sys = ActorSystem::new(&model).unwrap();

    let props = MyActor::props();
    let my_actor = sys.actor_of(props, "my-actor");

    // ask returns a future that automatically is driven
    // to completion by the system.
    let res = ask(&sys, &my_actor, 100);

    // the result future can be passed to a library or fuction that
    // expects a future, or it can be extracted locally using `block_on`.

    let res = block_on(res).unwrap();
    println!("The result value is: {}", res);
}
```

在背后，Ask设置了一个临时的中级 `Actor`，该 `Actor`在问的一生中生活。其他 `Actor`将此临时 `Actor`视为发件人，并可以向其发送消息。当临时询问者收到一条消息时，它会完成未完成的 `Future`，并自行停止清理。

当您拥有在actor系统之外运行的应用程序的一部分时，或者在另一个actor系统中，例如服务于API请求的Web服务器（例如Hyper）时，Ask特别有用。然后可以将生成的 `Future`链接为 `Future`堆栈的一部分。

## Transform

变换使得基于其当前状态的 `Actor`行为更容易被推理。由于参与者维持状态，并且确实是主要关注点，因此能够基于该状态以不同方式处理消息非常重要。 Transform模式通过为每个状态专用接收函数来分离消息处理。这节省了过多的匹配以处理几种可能的状态，即处理行为在状态改变时而不是在每个消息接收时被抢占。

> 信息 : 如果你熟悉JVM上的Akka，变换就像变成了。

```rust
#[macro_use]
extern crate riker_patterns;

use riker_patterns::ask;

#[derive(Clone, Debug)]
enum MyMsg {
    SetPassword(String), // password
    Authenticate(String), // password
}

impl Into<ActorMsg<MyMsg>> for MyMsg {
    fn into(self) -> ActorMsg<MyMsg> {
        ActorMsg::User(self)
    }
}

struct UserActor {
    username: String,
    password: Option<String>,

    // rec field is required to store current method to be used
    rec: Receive<UserActor, MyMsg>,
}

impl UserActor {
    fn actor(username: String) -> BoxActor<MyMsg> {
        let actor = UserActor {
            username,
            password: None,
            rec: Self::created, // <-- set initial method to `created` stated
        };

        Box::new(actor)
    }

    fn props(username: String) -> BoxActorProd<MyMsg> {
        Props::new_args(Box::new(UserActor::actor), username)
    }

    /// Receive method for this actor when it is in a created state
    /// i.e. password has not yet been set.
    fn created(&mut self,
                ctx: &Context<MyMsg>,
                msg: MyMsg,
                sender: Option<ActorRef<MyMsg>>) {

        match msg {
            MyMsg::SetPassword(passwd) => {
                self.password = Some(passwd);

                // send back a result to sender
                // e.g. `sender.try_tell(Ok, None);`

                // transform behavior to active state
                transform!(self, UserActor::active);
            }
            MyMsg::Authenticate(passwd) => {
                // `MyMsg::Authenticate` is invalid since no user password
                // has been set.
                // Signal that this is an error for the current state
                self.probe.as_ref().unwrap().0.event(ProbeMsg::Err);
            }
        }
    }

    /// Receive method for this actor when a password has been set
    /// and the user account is now active.
    fn active(&mut self,
                ctx: &Context<MyMsg>,
                msg: MyMsg,
                sender: Option<ActorRef<MyMsg>>) {

        match msg {
            MyMsg::Authenticate(passwd) => {
                // send back an authentication result to sender
                // e.g. `sender.try_tell(Ok, None);`

                // signal that this is correct
                self.probe.as_ref().unwrap().0.event(ProbeMsg::Ok);
            }
            MyMsg::SetPassword(passwd) => {
                // set a new password
                self.password = Some(passwd);
            }
        }
    }
}

impl Actor for UserActor {
    type Msg = MyMsg;

    fn receive(&mut self,
                ctx: &Context<Self::Msg>,
                msg: Self::Msg,
                sender: Option<ActorRef<Self::Msg>>) {

        // just call the currently set transform function
        (self.rec)(self, ctx, msg, sender)
    }
}
```

> 注意 : 改造！ 宏期望将self上当前接收函数的字段名称命名为rec。 使用不同的名称很容易，也可以使用自己的宏，或者只使用标准代码设置功能。 变换的优势！ 因为它与标准代码不同，所以在转换发生时很容易阅读和识别。