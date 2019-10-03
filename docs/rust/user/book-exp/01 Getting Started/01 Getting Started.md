# 开始

## 安装RUST

命令行安装：
```shell
curl https://sh.rustup.rs -sSf | sh
```

更新：
```shell
rustup update
```

卸载：
```shell
rustup self uninstall
```

查看版本：
```shell
rustup --version
```

查看本地文档：
```shell
rustup doc
```

编译：
```shell
rustc xxx.rs
```
rustc是rust自带的编译器，编译以后，会得到二进制的可执行文件，即可直接运行，例如：
```shell
./test
```

## 使用Cargo

Cargo是rust自带的一个工具，用来构建代码，编译程序，管理依赖库（即crates）。

检查cargo是否安装：
```shell
cargo --version
```

#### 创建项目

```shell
cargo new hello_cargo --bin
```

作用：
- 创建一个项目
- 项目名是 hello_cargo
- 该项目的文件在 hello_cargo 目录中
- "--bin"表示该项目是一个可执行程序

目录结构：
- |src：源代码目录
- |target
    - |debug：debug编译成果
    - |release：release编译成果
- Cargo.toml：cargo配置文件
- Cargo.lock：记录项目依赖的实际版本，cargo会自行管理该文件

#### 配置文件 [cargo.toml]

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
authors = ["YourName <you@example.com>"]
edition = "2018"

[dependencies]
```

- [package]信息是cargo编译程序时需要的配置信息，包括项目名称，版本，作者等
- [dependencies]是项目的依赖(crates)信息

#### 构建并运行项目

构建项目：
```shell
cargo build
```
> 构建结果在 target/debug 目录下

构建项目为realese版本：
```shell
cargo build --release
```
> 构建结果在 target/release 目录下

快速检查代码确保可编译：
``` shell
cargo check
```
> 该操作只是检查代码是否可编译，并不进行项目构建，所以比 build 速度快。正确的操作方式是：经常使用 check 来检查代码的正确性，最后需要构建整个程序时，再使用 build

运行项目：
```shell
cargo run
```