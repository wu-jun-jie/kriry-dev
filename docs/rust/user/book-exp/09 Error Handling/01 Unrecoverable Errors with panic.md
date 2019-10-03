# 不可恢复 panic

### 使用 ```panic!```

可以直接使用该宏来退出程序：
```rust
fn main() {
    panic!("crash and burn");
}
```

则运行该程序时，得到如下结果：
```text
$ cargo run

thread 'main' panicked at 'crash and burn', src/main.rs:2:5

note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

该信息告知了错误发生对应的源文件，以及代码的行列位置。但有时候错误不一定是 ```panic!``` 导致的，可能是别人的代码或方法导致的，所以需要 backtrace 。

### Using a ```panic!``` backtrace

举例：
```rust
fn main() {
    let v = vec![1, 2, 3];
    v[100];
}
```

可使用下面的运行方式来查看 backtrace：
```shell
RUST_BACKTRACE=1 cargo run
```

说明：
- 此时程序 panic
- 但错误信息提示的位置就不是我们的代码，而可能是 ```libcore/slice/mod.rs```
- 所以此时通过 backtrace，就可以逐层找到出错的位置，例如 ```src/main.rs:3```
