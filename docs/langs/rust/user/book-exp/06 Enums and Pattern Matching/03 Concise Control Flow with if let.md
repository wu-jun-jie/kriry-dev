# 使用 if let

说明：
- 根据前面的内容，我们知道在 match 时，Rust 编译器会强行要求我们覆盖到所有可能的情况
- 例如，针对 enum ，需要覆盖该 enum 的所有值
- 又如，针对 Option，需要覆盖到 None 等各种可能的情况
- 但有的情况下，我们只关心 if / else 的情况，甚至只关心到 if
- 也就是说，有时候针对所有可能的情况，我们只关心其中一种情况
- 因此可以使用 ```if let```
- 对应的，可以匹配 ```else```

举例：使用 match，只关心一种情况
```rust
let some_u8_value = Some(0u8);
match some_u8_value {
    Some(3) => println!("three"),
    _ => (),
}
```

上例更换为 if let ：
```rust
if let Some(3) = some_u8_value {
    println!("three");
}
```

对应，匹配 else ：
```rust
if let Some(3) = some_u8_value {
    println!("three");
} else {
    println!("not three");
}
```