## Cargo的第一步

使用Cargo创建一个新的项目，使用`cargo new`：

```console
$ cargo new hello_world
```

Cargo默认使用`--bin`参数创建二进制程序。要创建库，我们应该传入`--lib`参数

我们来看一下Cargo为我们生成了哪些文件：

```console
$ cd hello_world
$ tree .
.
├── Cargo.toml
└── src
    └── main.rs

1 directory, 2 files
```

这是我们开始一个项目所必须的文件。首先，我们看一下`Cargo.toml`:

```toml
[package]
name = "hello_world"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]
edition = "2018"

[dependencies]
```

这个文件称之为**依赖清单**，它包括了Cargo编译项目所需要的所有元数据。


下面是`src/main.rs`文件的内容:

```rust
fn main() {
    println!("Hello, world!");
}
```

Cargo为我们创建了一个“hello world”项目。让我们编译它：

```console
$ cargo build
   Compiling hello_world v0.1.0 (file:///path/to/package/hello_world)
```

然后运行它：

```console
$ ./target/debug/hello_world
Hello, world!
```

我们也可以使用`cargo run`这一条命令来编译并运行项目：

```console
$ cargo run
     Fresh hello_world v0.1.0 (file:///path/to/package/hello_world)
   Running `target/hello_world`
Hello, world!
```

### 更进一步

更多的Cargo使用细节，请查阅[Cargo指南](guide/index.html)
