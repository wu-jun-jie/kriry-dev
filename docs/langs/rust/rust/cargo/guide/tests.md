## 测试

Cargo可以使用命令`cargo test`运行你的测试。Cargo在两个地方查找可以运行的测试：在你的`src`目录下的每个文件中和`tests/`目录中。在你的`src`目录中的应当是单元测试，在`tests/`目录下的应当是集成风格的测试。严格来说，你需要在`tests`目录下的文件中导入你的要测试的程序。

这里有个在我们的项目中运行`cargo test`的例子，当前，程序中不含任何测试：

```console
$ cargo test
   Compiling rand v0.1.0 (https://github.com/rust-lang-nursery/rand.git#9f35b8e)
   Compiling hello_world v0.1.0 (file:///path/to/package/hello_world)
     Running target/test/hello_world-9c2b65bbb79eabce

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

如果我们的项目中有测试，我们应当看到更多的输出，输出中含有测试的数量。

你可以通过传递一个过滤参数来运行特定的测试：

```console
$ cargo test foo
```

这将会运行名称中含有`foo`的所有测试。

`cargo test`会运行额外的检查。例如，它会编译你所包含的任何示例程序，并且也会在你的文档中测试示例程序。请参考Rust文档中的[测试指南][testing]获取更多详细信息。

[testing]: https://doc.rust-lang.org/book/testing.html
