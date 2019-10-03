# 注释

行注释的语法：
- 使用 //
- 如果有多行注释，则每行都需要 // 开头
- 可以在一句代码的末尾使用 // 注释
- 但Rust建议将注释放在对应代码上面
- Rust还有其它注释，例如文档注释，在Chapter14详细讨论

举例：
```rust
// Hello, world.
// Multilines of comments.
fn main() {
    // I’m feeling lucky today.
    let lucky_number = 7;
}
```

不推荐的注释方式：
```rust
fn main() {
    let lucky_number = 7; // I’m feeling lucky today.
}
```