# Arbiter

仲裁者(Arbiters)为`actor`提供异步执行上下文。 如果Actor包含定义其Actor特定执行状态的`Context`，则`Arbiters`将托管`actor`运行的环境。

因此`Arbiters`执行许多功能。 最值得注意的是，它们能够生成新的OS线程，运行事件循环，在该事件循环上异步生成任务，并充当异步任务的帮助程序。

## 系统和仲裁者

在我们之前的所有代码示例中，函数`System :: new`为您的`actor`创建了一个`Arbiter`。 当你在`actor`上调用`start（）`时，它会在`System Arbiter`的线程内部运行。 在许多情况下，这是使用`Actix`的程序所需的全部内容。

## 使用Arbiter解析异步事件

如果您不是生锈`futures`的专家，`Arbiter`可以是一个有用且简单的包装器，可以按顺序解析异步事件。 考虑我们有两个`actor`，A和B，我们想在A的完成后取得结果时就立即在B上运行一个事件。 我们可以使用`Arbiter :: spawn`来协助完成这项任务。

```rust
extern crate actix;
extern crate futures;
use futures::Future;
use actix::prelude::*;

struct SumActor {}

impl Actor for SumActor {
    type Context = Context<Self>;
}

struct Value(usize, usize);

impl Message for Value {
   type Result = usize;
}

impl Handler<Value> for SumActor {
    type Result = usize;

    fn handle(&mut self, msg: Value, ctx: &mut Context<Self>) -> Self::Result {
        msg.0 + msg.1
    }
}

struct DisplayActor {}

impl Actor for DisplayActor {
    type Context = Context<Self>;
}

struct Display(usize);

impl Message for Display {
   type Result = ();
}

impl Handler<Display> for DisplayActor {
    type Result = ();

    fn handle(&mut self, msg: Display, ctx: &mut Context<Self>) -> Self::Result {
        println!("Got {:?}", msg.0);
    }
}


fn main() {
    let system = System::new("test");

    // start new actor
    let sum_addr = SumActor{}.start();
    let dis_addr = DisplayActor{}.start();

    let res = sum_addr.send(Value(6, 7));

    Arbiter::spawn(
        res.map(move |res| {

            let dis_res = dis_addr.send(Display(res));

            Arbiter::spawn(
                dis_res.map(move |_| {
                    // Shutdown gracefully now.
                    System::current().stop();
                })
                .map_err(|_| ())
            );

        }) // end res.map
        .map_err(|_| ())
    );

    system.run();
}

```