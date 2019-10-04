# Testing

测试并发系统比单线程应用程序更困难，因为测试本身和应用程序在不同的线程上运行。 此外，由于Riker的弹性自我修复方法，恐慌被隔离，处理和故障组件重新启动，检测测试失败证明是具有挑战性的。

为了帮助简化测试，`riker-testkit`引入了一个“探测器”，可以通过消息传递或作为 `Actor`道具的一部分发送给 `Actor`。 然后，探针可以将值发送回测试线程。

以下是测试actor重启的示例：

```rust
#[macro_use]
extern crate riker_testkit;

type TestProbe = ChannelProbe<(), ()>;

#[derive(Clone, Debug)]
enum TestMsg {
    Probe(TestProbe),
    Panic,
}

impl Into<ActorMsg<TestMsg>> for TestMsg {
    fn into(self) -> ActorMsg<TestMsg> {
        ActorMsg::User(self)
    }
}

struct MyActor;

impl MyActor {
    fn new() -> BoxActor<TestMsg> {
        Box::new(MyActor)
    }
}

impl Actor for MyActor {
    type Msg = TestMsg;

    fn receive(&mut self,
                _ctx: &Context<Self::Msg>,
                msg: Self::Msg,
                _sender: Option<ActorRef<Self::Msg>>)
    {
        match msg {
            TestMsg::Panic => {
                // panic the actor to simulate failure
                panic!("// TEST PANIC // TEST PANIC // TEST PANIC //");
            }
            TestMsg::Probe(probe) => {
                // received probe
                // let's emit () empty tuple back to listener
                probe.event(());
            }
        };
    }
}

#[test]
fn panic_actor() {
    let model: DefaultModel<TestMsg> = DefaultModel::new();
    let sys = ActorSystem::new(&model).unwrap();

    let props = Props::new(Box::new(MyActor::new));
    let actor = sys.actor_of(props, "my-actor").unwrap();

    // Make the test actor panic
    actor.tell(TestMsg::Panic, None);

    // Prepare a probe
    let (probe, listen) = probe::<()>();

    // Send the probe to the panicked actor
    // which would have been restarted
    actor.tell(TestMsg::Probe(probe), None);

    // Testkit provides a macro to assert the result
    // that gets emmitted from the probe to the listener.
    // Here we're expecting () empty tuple.
    p_assert_eq!(listen, ());
}
```

此测试显示我们的`actor`在失败后成功重启。 它能够继续接收消息，在这种情况下是探测。 宏`p_assert_eq！` 等待（块）侦听器，直到从探测器接收到值。