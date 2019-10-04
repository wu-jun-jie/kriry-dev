## Cargo.toml及Cargo.lock文件

`Cargo.toml` 和 `Cargo.lock`服务于两个不同的目的。在讨论它们之前，这里是一个总结：

* `Cargo.toml` 是广义上描述你的依赖的文件，由你编写。
* `Cargo.lock`文件包含具体的依赖信息，它是由Cargo维护的，不应当手动修改。

如果你在构建其他项目依赖的库，把`Cargo.lock`放在你的`.gitignore`文件中。如果你在构建像命令行工具或者应用等的可执行程序，确保`Cargo.lock` 在 `git`中。如果你对那是什么好奇，参考FAQ中的["为什么 `Cargo.lock` 在可执行程序包的版本控制中, 却不再库的版本控制中?" ](faq.html#why-do-binaries-have-cargolock-in-version-control-but-not-libraries)

让我们深入挖掘一下。

`Cargo.toml`是一个**清单文件**，我们可以在其中指明一堆不同的关于我们的项目的元数据。例如我们可以表明我们依赖于其他项目：

```toml
[package]
name = "hello_world"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]

[dependencies]
rand = { git = "https://github.com/rust-lang-nursery/rand.git" }
```

这个项目有一个单独的依赖，即`rand`库。我们从依赖一个特定的位于Github上的Git仓库的情况开始，由于我们并没有指定任何其他信息，Cargo假设我们想要使用最新提交的`master`分支来构建我们的程序。

听起来不错？可是，却又一个问题：如果你今天构建的项目，并且发给我一份副本，而我明天构建这个程序，一些糟糕的事情就会发生。其间，`rand`库可能又很多次提交，而我的构建将会包含新提交的内容，而你的却不会。因此，我们会得到不通过的构建结果，这是不好的结果，因为我们想要重现构建。

我们可以通过在`Cargo.toml`文件中加入`rev`行解决这个问题：

```toml
[dependencies]
rand = { git = "https://github.com/rust-lang-nursery/rand.git", rev = "9f35b8e" }
```

此时，我们的构建将会一致。但是，却有一个坏处：在库升级时，我们需要自己考虑库的SHA-1值，这既冗余又容易出错。

进入`Cargo.lock`文件，由于它的存在，我们不需要手动跟踪依赖库的具体修订版本，Cargo会帮我们做这个工作。当我们有个如下的清单文件时：

```toml
[package]
name = "hello_world"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]

[dependencies]
rand = { git = "https://github.com/rust-lang-nursery/rand.git" }
```

Cargo会获得最新得提交，并在首次构建程序时将信息写入`Cargo.lock`文件中，那个文件得内容如下：

```toml
[[package]]
name = "hello_world"
version = "0.1.0"
dependencies = [
 "rand 0.1.0 (git+https://github.com/rust-lang-nursery/rand.git#9f35b8e439eeedd60b9414c58f389bdc6a3284f9)",
]

[[package]]
name = "rand"
version = "0.1.0"
source = "git+https://github.com/rust-lang-nursery/rand.git#9f35b8e439eeedd60b9414c58f389bdc6a3284f9"
```

你可以看到这里又很多信息，包含我们构建用到得具体修订版本信息，现在当你把你的项目给别人得时候，它们会使用完全相同得SHA，尽管我们并未在`Cargo.toml`中指明。

当我们准备好升级到库的新版本时，Cargo可以重新计算依赖，并且为我们更新文件：

```console
$ cargo update           # updates all dependencies
$ cargo update -p rand   # updates just “rand”
```

这将会把新版本的信息写入一个新的`Cargo.lock`文件。注意，传递给`cargo update`的参数实际上是一个[项目ID明细](reference/pkgid-spec.html)，而`rand`只是一个缩写。

