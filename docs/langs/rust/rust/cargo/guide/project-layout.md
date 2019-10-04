## 工程布局

对于文件的存放位置，Cargo有自己的惯例，这能够更加容易的了解新的项目:

```
.
├── Cargo.lock
├── Cargo.toml
├── benches
│   └── large-input.rs
├── examples
│   └── simple.rs
├── src
│   ├── bin
│   │   └── another_executable.rs
│   ├── lib.rs
│   └── main.rs
└── tests
    └── some-integration-tests.rs
```

* `Cargo.toml` 和 `Cargo.lock` 存放在根目录 (*package
  root*)。
* 源代码存放在 `src` 目录。
* 默认的库文件源代码为`src/lib.rs`。
* 默认可执行文件源代码为`src/main.rs`。
* 其他可执行文件源代码可以存放在 `src/bin/*.rs`。
* 集成测试代码放在 `tests` 目录(单元测试代码在所测试的代码文件中)。
* 示例放在`examples` 目录。
* 性能评估代码放在 `benches` 目录.

这些内容在[清单描述](reference/manifest.html#the-project-layout)中有更多解释。
