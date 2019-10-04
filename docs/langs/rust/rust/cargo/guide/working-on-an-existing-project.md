## 基于已存在的程序包工作

如果你下载了已有的使用了Cargo的项目，使其运行将非常简单。

首先，从某处获取项目程序，在这个例子中，我们使用从Github仓库抓取下来的`rand`项目：

```console
$ git clone https://github.com/rust-lang-nursery/rand.git
$ cd rand
```

要编译该程序，使用`cargo build`:

```console
$ cargo build
   Compiling rand v0.1.0 (file:///path/to/package/rand)
```

这将会抓取所有的依赖，然后编译依赖和`rand`项目。
