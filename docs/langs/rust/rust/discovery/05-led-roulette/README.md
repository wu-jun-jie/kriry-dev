# 概叙

好吧，让我们从构建以下应用程序开始：

![LED](https://i.imgur.com/0k1r2Lc.gif)

我将给你一个高级 API 来实现这个应用程序，但不要担心我们以后会做低级别的东西。本章的主要目标是熟悉 *flashing* 和调试过程。

在本文中，我们将使用 [discovery](https://github.com/rust-embedded/discovery) 仓库中的入门代码。确保您始终拥有最新版本的主分支，因为该网站会跟踪该分支。

入门代码位于该仓库的 `src` 目录中。在该目录中，有更多目录以本书的每一章命名。这些目录中的大多数都是入门 Cargo 项目。

现在，跳转到 `src/05-led-roulette` 目录。检查 `src/main.rs` 文件：

```rust
#![deny(unsafe_code)]
#![no_main]
#![no_std]

use aux5::entry;

#[entry]
fn main() -> ! {
    let _y;
    let x = 42;
    _y = x;

    // infinite loop; just so we don't leave this stack frame
    loop {}
}
```

微控制器程序在两个方面与标准程序不同: `#![no_std]` 和 `#![no_main]`。

`no_std` 属性表示该程序不会使用 `std` crate(它假定底层有操作系统);该程序将改为使用 `core` crate，这是可以在裸机系统上运行的 `std` 的子集（即没有如文件和sockets这样的OS抽象的系统）。

`no_main` 属性表示该程序不使用标准 `main` 接口，该接口是为接收参数的命令行应用程序定制的。我们将使用 `cortex-m-rt` crate 中的 `entry` 属性来定义自定义入口点，而不是标准的 `main`。在这个程序中，我们将入口点命名为“main”，但是可以使用任何其他名称。入口点函数必须有签名 `fn() -> !`;此类型表示函数无法返回 -- 这意味着程序永远不会终止。

如果您是一位细心的观察者，您还会注意到 Cargo 项目中还有一个`.cargo`目录。此目录包含一个Cargo配置文件 (`.cargo/config`)，它调整链接过程以根据目标设备的要求定制程序的内存布局。这种修改的链接过程是 `cortex-m-rt` crate 的要求。

好吧，让我们从构建这个程序开始吧。
