## 创建新工程

要使用Cargo开始一个新项目，使用`cargo new`命令：

```console
$ cargo new hello_world --bin
```

我们传递`--bin`参数是因为我们要开发一个二进制程序，如果我们想开发库，则要传递`--lib`参数。这同样会默认初始化一个新的`git`仓库，如果你不需要版本控制，传递`--vcs none`参数。

让我们看一下Cargo为我们生成了哪些文件：

```console
$ cd hello_world
$ tree .
.
├── Cargo.toml
└── src
    └── main.rs

1 directory, 2 files
```

让我们仔细看看`Cargo.toml`文件的内容：

```toml
[package]
name = "hello_world"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]
edition = "2018"

[dependencies]

```

这个文件被称为**依赖清单**，它包括了Cargo编译项目所需要的所有元数据。

下面是 `src/main.rs`文件的内容:

```rust
fn main() {
    println!("Hello, world!");
}
```


Cargo为我们生成了一个“hello world”项目，让我们编译它：

```console
$ cargo build
   Compiling hello_world v0.1.0 (file:///path/to/package/hello_world)
```

然后运行它:

```console
$ ./target/debug/hello_world
Hello, world!
```

我们也可以使用`cargo run`这一条命令来编译并运行项目（如果上次编译后你没有改变任何文件，你不会看到`Compiling`这行）:

```console
$ cargo run
   Compiling hello_world v0.1.0 (file:///path/to/package/hello_world)
     Running `target/debug/hello_world`
Hello, world!
```

你现在注意到多了一个新文件`Cargo.lock`。它包含了依赖信息，由于我们的项目还没有任何依赖，这个文件的内容一点也没有趣。

一旦你准备好发布程序，你可以使用`cargo build --release`来开启优化选项编译你的程序：

```console
$ cargo build --release
   Compiling hello_world v0.1.0 (file:///path/to/package/hello_world)
```

`cargo build --release` 把生成的二进制程序放在 `target/release`目录下而不是
`target/debug`目录下。

在调试模式下编译是默认的开发选项，因为编译器不会对程序进行优化，所以编译时间短，但是代码运行会慢。发布模式需要更长的时间编译，但是代码运行会更快。