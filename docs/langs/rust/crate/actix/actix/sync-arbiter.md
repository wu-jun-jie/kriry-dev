# SyncArbiter

当您正常运行`Actors`时，系统的`Arbiter`线程上会运行多个`Actors`，使用它的事件循环。 但是，对于CPU绑定工作负载或高度并发工作负载，您可能希望让一个`Actor`并行运行多个实例。

这就是`SyncArbiter`提供的功能 - 能够在OS线程池上启动`Actor`的多个实例。

重要的是要注意`SyncArbiter`只能托管单一类型的`Actor`。 这意味着您需要为要以此方式运行的每种类型的Actor创建`SyncArbiter`。

## 创建同步Actor

当实现要在`SyncArbiter`上运行的`Actor`时，它需要将`Actor`的`Context`从`Context`更改为`SyncContext`。

```rust
extern crate actix;
use actix::prelude::*;

struct MySyncActor;

impl Actor for MySyncActor {
    type Context = SyncContext<Self>;
}

fn main() {
System::new("test");
}
```

## 启动同步仲裁器

现在我们已经定义了一个`Sync Actor`，我们可以在一个由我们的`SyncArbiter`创建的线程池上运行它。 我们只能在`SyncArbiter`创建时控制线程数 - 我们以后不能添加/删除线程。

```rust
extern crate actix;
use actix::prelude::*;

struct MySyncActor;

impl Actor for MySyncActor {
    type Context = SyncContext<Self>;
}

fn main() {
System::new("test");
let addr = SyncArbiter::start(2, || MySyncActor);
}
```

我们可以使用与我们之前开始的`Actors`相同的方式与`addr`进行通信。 我们可以发送消息，接收`futures`和结果等。

## 同步Actor邮箱

`Sync Actors`没有邮箱限制，但您仍应使用`do_send`，`try_send`、`send` 正常发送以解决其他可能的错误或同步与异步行为。