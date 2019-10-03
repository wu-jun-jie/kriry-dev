# 性能比较 Loop & Iterator

### 关于性能比较

- 对于 `for` 和 iterator ，Rust 做过 ***benchmark*** 测试，测试结果是：iterator 要稍微更快一些
- 本章的重点不是解释 ***benchmark*** 测试，也不是证明 `for` 和 iterator 究竟谁的性能更优，而是要说明 Rust 的机制

### Rust 机制

- Rust 会确保高级抽象的代码例如 iterator 在编译以后，与直接书写低级抽象的代码例如 `for` ，二者尽量保持一致，甚至还会进行额外的优化
- 例如，对于某些在编译期就确认 iterator 大小的代码，Rust 编译后不是进行 `for` 循环，而是直接 ***unroll*** 即展开循环，替换为对应每次遍历的相关代码，避免循环带来的额外性能损耗；甚至将一些相关的变量和数据存储在 ***register*** ，带来更快的执行速率

### Rust 目标

***zero-cost abstraction*** 

- 即零抽象
- 而 iterator 就是 Rust 零抽象实现的特性之一
- 也就是说，我们可以使用这些高级抽象特性，而不用担心会带来额外的运行时性能损耗

这与 C++ 之父 Bjarne Stroustrup 在「Foundations of C++」(2012) 中定义的 ***zero-overhead*** 一致：

> In general, C++ implementations obey the zero-overhead principle: What you don’t use, you don’t pay for. And further: What you do use, you couldn’t hand code any better.

## 总结

1. Closure 和 iterator 是 Rust 从 ***functional programming language*** 即函数式编程语言中找到的灵感
2. 它们使 Rust 具备了这种能力：编写高级别抽象的代码，使代码变得精简而易读，但不会带来额外的运行时性能损耗
3. Rust 的目标，是努力实现 ***zero-cost abstraction*** 即零抽象