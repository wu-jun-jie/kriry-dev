# 自定义 Build

## Profile

- 位于 `cargo.toml` 配置文件中
- Cargo 有两个只要的 Profile ，分别是 `dev` 和 `release`
- `dev` 配置为 `[profile.dev]` ，`release` 配置为 `[profile.release]`
- 各个 Profile 之间是相互独立的，用来控制编译时的行为
- `dev` 用于 `cargo build` ，`release` 用于 `cargo build --release`

## 默认配置

Cargo 编译时的默认行为等同于下面的配置：

> Cargo.toml

```toml
[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3
```

关于 `opt-level` ：

- 设置 Rust 编译时的代码优化级别
- 范围是 0 - 3 ，数字越大，优化级别越高
- 优化级别越高，编译时耗时越长，编译成果运行效率越高
- 因此，默认在 `dev` 即开发阶段时，配置为 0 ，因为开发阶段编译代码比较频繁；而在 `release` 即发布阶段时，配置为 3 ，因为发布时追求的是运行效率

对应的，默认配置时编译提示如下：

```text
$ cargo build
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
$ cargo build --release
    Finished release [optimized] target(s) in 0.0 secs
```

## 修改配置

例如，修改配置如下：

```toml
[profile.dev]
opt-level = 1
```

则对 Carogo 的影响是：

- 在 `cargo build` 时，使用 `opt-level = 1` ，而不是默认的 `0`
- 在 `cargo build --release` 时，仍然使用默认的 `3` ，因为并没有对 `profile.release` 进行过配置

## 其它配置

参考 [Cargo's documentation](https://doc.rust-lang.org/cargo/)

