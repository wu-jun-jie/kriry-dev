## 构建缓存

Cargo在同一工作区的所有项目之间共享构建信息。今天，Cargo在不同工作区间不共享构建结果，但是可以使用第三方工具[sccache]达到相似的目的。

要设置`sccache`，使用`cargo install sccache`安装它，并且在使用Cargo前设置环境变量`RUSTC_WRAPPER`指向`sccache`。如果你使用`bash`,在`.bashrc`文件中添加`export RUSTC_WRAPPER=sccache`就可以了。参考sccache文档了解更详细的信息。

[sccache]: https://github.com/mozilla/sccache


