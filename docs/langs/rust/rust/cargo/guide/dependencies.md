## 依赖

[crates.io]是Rust社区主要的项目注册的地方，也是查找和下载项目的地方。`cargo`被配置为默认使用它来查找需要的项目。

要依赖一个寄放在[crates.io]的库，只需要将它添加到你的`Cargo.toml`文件。

[crates.io]: https://crates.io/

### 添加一个依赖

如果你的`Cargo.toml`没有`[dependencies]`区域，将其添加进去，然后在该区域列出你想使用的依赖的项目的名称和版本。这个例子中，添加了一个`time`程序包依赖：

```toml
[dependencies]
time = "0.1.12"
```

版本字符串符合[semver]版本命名要求。[指明依赖](reference/specifying-dependencies.html) 一节有更多可用信息。

[semver]: https://github.com/steveklabnik/semver#requirements

如果我们同样想添加`regex`项目依赖，我们不需要为每个列出项目添加`[dependencies]`，以下是依赖`time`和 `regex`两个项目的`Cargo.toml`文件的内容：

```toml
[package]
name = "hello_world"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]

[dependencies]
time = "0.1.12"
regex = "0.1.41"
```

再次运行`cargo build`，Cargo会获取新的依赖以及依赖的依赖，一并编译它们，并且更新 `Cargo.lock`文件：

```console
$ cargo build
      Updating crates.io index
   Downloading memchr v0.1.5
   Downloading libc v0.1.10
   Downloading regex-syntax v0.2.1
   Downloading memchr v0.1.5
   Downloading aho-corasick v0.3.0
   Downloading regex v0.1.41
     Compiling memchr v0.1.5
     Compiling libc v0.1.10
     Compiling regex-syntax v0.2.1
     Compiling memchr v0.1.5
     Compiling aho-corasick v0.3.0
     Compiling regex v0.1.41
     Compiling hello_world v0.1.0 (file:///path/to/package/hello_world)
```

我们的`Cargo.lock`包含我们所用到的所有依赖的具体信息。

现在，如果`regex`更新了，我们依然会使用旧版本构建程序，直到使用`cargo update`更新依赖版本。

你现在可以在`main.rs`中通过`extern crate`使用`regex`库。

```rust
extern crate regex;

use regex::Regex;

fn main() {
    let re = Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap();
    println!("Did our date match? {}", re.is_match("2014-01-01"));
}
```

运行它将会输出:

```console
$ cargo run
   Running `target/hello_world`
Did our date match? true
```
