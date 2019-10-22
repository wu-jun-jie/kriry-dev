# Context

Actors都维护内部执行上下文或状态。 这允许actor确定它自己的地址，更改邮箱限制或停止执行。

## 邮箱(Mailbox)

所有消息首先进入actor的邮箱，然后actor的执行上下文调用特定的消息处理程序。邮箱通常是有界的。容量特定于上下文实现。对于`Context` 类型，默认情况下容量设置为16条消息，可以使用`Context :: set_mailbox_capacity（）`增加 容量。

```rust
extern crate actix;
use actix::prelude::*;
struct MyActor;
impl Actor for MyActor {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        ctx.set_mailbox_capacity(1);
    }
}

fn main() {
System::new("test");
let addr = MyActor.start();
}
```

请记住，这不适用于绕过邮箱队列限制的`Addr :: do_send（M）`，或者完全绕过邮箱的`AsyncContext :: notify（M）`和`AsyncContext :: notify_later（M，Duration）`。

## 获取`Actor`地址

Actor可以从它的上下文中查看它自己的地址。 也许您想要稍后重新排队事件，或者您想要转换消息类型。 也许你想用你的地址回复一条消息。 如果您希望让`actor`向他自己发送消息，请查看`AsyncContext :: notify（M）`。

要从上下文中获取地址，请调用`Context :: address（）`。 一个例子是：

```rust
struct MyActor;

struct WhoAmI;

impl Message for WhoAmI {
    type Result = Result<actix::Addr<MyActor>, ()>;
}

impl Actor for MyActor {
    type Context = Context<Self>;
}

impl Handler<WhoAmI> for MyActor {
    type Result = Result<actix::Addr<MyActor>, ()>;

    fn handle(&mut self, msg: WhoAmI, ctx: &mut Context<Self>) -> Self::Result {
        Ok(ctx.address())
    }
}

let who_addr = addr.do_send(WhoAmI {} );
```

## 停止`Actor`

从actor执行上下文中，您可以选择阻止actor处理任何未来的邮箱消息。 这可能是对错误情况的响应，也可能是程序关闭的一部分。 为此，您可以调用`Context :: stop（）`.

这是一个调整后的`Ping`示例，在收到4个ping后停止。

```rust
extern crate actix;
extern crate futures;
use futures::Future;
use actix::prelude::*;
struct MyActor {
   count: usize,
}
impl Actor for MyActor {
    type Context = Context<Self>;
}

struct Ping(usize);

impl Message for Ping {
   type Result = usize;
}
impl Handler<Ping> for MyActor {
    type Result = usize;

    fn handle(&mut self, msg: Ping, ctx: &mut Context<Self>) -> Self::Result {
        self.count += msg.0;

        if self.count > 5 {
            println!("Shutting down ping receiver.");
            ctx.stop()
        }

        self.count
    }
}

fn main() {
    let system = System::new("test");

    // start new actor
    let addr = MyActor{count: 10}.start();

    // send message and get future for result
    let addr_2 = addr.clone();
    let res = addr.send(Ping(6));

    Arbiter::spawn(
        res.map(move |res| {
            // Now, the ping actor should have stopped, so a second message will fail
            // With a SendError::Closed
            assert!(addr_2.try_send(Ping(6)).is_err());

            // Shutdown gracefully now.
            System::current().stop();
        })
        .map_err(|_| ()));

    system.run();
}
```