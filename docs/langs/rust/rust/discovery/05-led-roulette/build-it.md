# 构建

第一步是建立我们的 "binary" 箱子。由于微控制器的架构与你的笔记本电脑不同，我们必须交叉编译。在 Rust 上进行交叉编译就像将一个额外的 `--target` flag 传递给 `rustc` or Cargo 一样简单。复杂的部分是弄清楚该 flag 的参数：target 的名称。

F3 中的微控制器内置了 Cortex-M4F 处理器。 `rustc` 知道如何交叉编译到Cortex-M架构，并提供4个不同的 targets，涵盖该架构中的不同处理器系列：

- `thumbv6m-none-eabi`，适用于 Cortex-M0 和 Cortex-M1 处理器
- `thumbv7m-none-eabi`，适用于 Cortex-M3 处理器
- `thumbv7em-none-eabi`，适用于 Cortex-M4 和 Cortex-M7 处理器
- `thumbv7em-none-eabihf`，适用于 Cortex-M4**F** 和 Cortex-M7**F** 处理器

对于 F3，我们将使用 `thumbv7em-none-eabihf` target。在交叉编译之前，您必须为您的 target 下载标准库的预编译版本（实际上是它的简化版本）。这是使用rustup完成的：

```bash
$ rustup target add thumbv7em-none-eabihf
```

你只需要做一次上面的步骤;每次更新工具链时，rustup 都会重新安装新的标准库（rust-std组件）。

使用 rust-std 组件，您现在可以使用 Cargo 交叉编译程序：


```bash
$ # make sure you are in the `src/05-led-roulette` directory

$ cargo build --target thumbv7em-none-eabihf
   Compiling semver-parser v0.7.0
   Compiling aligned v0.1.1
   Compiling libc v0.2.35
   Compiling bare-metal v0.1.1
   Compiling cast v0.2.2
   Compiling cortex-m v0.4.3
   (..)
   Compiling stm32f30x v0.6.0
   Compiling stm32f30x-hal v0.1.2
   Compiling aux5 v0.1.0 (file://$PWD/aux)
   Compiling led-roulette v0.1.0 (file://$PWD)
    Finished dev [unoptimized + debuginfo] target(s) in 35.84 secs
```

> **注意** 请确保在没有优化的情况下编译此包。上面提供的Cargo.toml文件和构建命令将确保关闭优化。

好的，现在我们已经生成了可执行文件。这个可执行文件不会使任何 LED 闪烁，它只是我们将在本章后面构建的简化版本。作为一个完整性检查，让我们验证生成的可执行文件实际上是一个 ARM 二进制文件：

```bash
$ # equivalent to `readelf -h target/thumbv7em-none-eabihf/debug/led-roulette`
$ cargo readobj --target thumbv7em-none-eabihf --bin led-roulette -- -file-headers
ELF Header:
  Magic:   7f 45 4c 46 01 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF32
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0x0
  Type:                              EXEC (Executable file)
  Machine:                           ARM
  Version:                           0x1
  Entry point address:               0x8000197
  Start of program headers:          52 (bytes into file)
  Start of section headers:          740788 (bytes into file)
  Flags:                             0x5000400
  Size of this header:               52 (bytes)
  Size of program headers:           32 (bytes)
  Number of program headers:         2
  Size of section headers:           40 (bytes)
  Number of section headers:         20
  Section header string table index: 18
```

接下来，我们将程序刷到我们的微控制器中。
