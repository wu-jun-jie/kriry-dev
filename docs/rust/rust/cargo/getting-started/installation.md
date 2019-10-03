## 安装

> 源[installation](https://github.com/rust-lang/cargo/blob/master/src/doc/src/getting-started/installation.md)&emsp; Commit: 41b943a302c497d160f47c76ad559fa887fac4b4

### 安装Rust和Cargo

获取Cargo最简单的方法是使用`rustup`安装当前稳定版本的[Rust], 使用`rustup`安装`Rust`也将安装`cargo`。

在Linux和macOS系统上，这可以通过以下方式完成：

```bash
curl https://sh.rustup.rs -sSf | sh
```

它将下载一个脚本，然后开始安装。 如果一切顺利，你会看到以下输出：

```bash
Rust is installed now. Great!
```

在Windows上，下载并运行[rustup-init.exe]。 它将在控制台中开始安装，并在成功时显示以上信息。

在此之后，您也可以使用`rustup`命令为`Rust`和`Cargo`安装`beta`或`nightly`版本。

有关其他安装选项和信息，请访问Rust的[install-rust]网站的安装页面。

### 从源代码构建和安装`Cargo`

或者，您可以从[源代码]构建`Cargo`。

[rust]: https://www.rust-lang.org/
[rustup-init.exe]: https://win.rustup.rs/
[install-rust]: https://www.rust-lang.org/tools/install
[源代码]: https://github.com/rust-lang/cargo#compiling-from-source
