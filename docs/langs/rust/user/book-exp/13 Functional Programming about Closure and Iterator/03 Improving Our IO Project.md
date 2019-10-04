# 改进 minigrep

*源码：[minigrep_iter](https://gitee.com/A1G2G1/Rust_The_Book/tree/master/minigrep_iter)*

## 概述

根据本章所讲解的 iterator ，可以改进我们的命令行程序 `minigrep` ，改进点主要是几方面：

- 获取命令行参数时，`env::args()` 本身得到的就是 iterator ，我们可以直接处理这个 iterator ；优点是：第一，不需要 `collect` 之后再通过 `&` 方式传递参数；第二，避免了对每个 `&String` 参数的 `Clone`
- 分析文件中每一行文本内容时，`lines()` 方法得到的是 iterator ，可以直接使用 `filter` 来筛选符合要求的行；而之前使用 `for` 会有几个问题：第一，需要 `mut` 修饰的 `Vec` 来存储结果，这在程序并发时可能会有问题；第二，使用 `filter` 可以使程序更精简，更能清晰的表达出代码的意图

## 改进 `Config::new`

这是之前的代码：

```rust
pub fn new(args: &[String]) -> Result<Config, &'static str> {
    if args.len() < 3 {
        return Err("not enough args");
    }
    Ok(Config {
        query: args[1].clone(),
        filename: args[2].clone(),
        case_insens: env::var("CASE_INS").is_ok(),
    })
}
```

缺点：

1. 需要判断参数的个数
2. 使用 `&` 方式，因此创建 `Config` 实例时，需要进行 `Clone`

改进：

首先是 `main` 中改进参数的传递方式：

```rust
Config::new(env::args())
```

然后改进 `Config::new` 方法：

```rust
pub fn new(mut args: env::Args) -> Result<Config, &'static str> {
    // 第1个参数是程序名称
    args.next();

    // 参数query
    let query = match args.next() {
        Some(q) => q,
        None => return Err("no query para"),
    };
    // 参数filename
    let filename = match args.next() {
        Some(f) => f,
        None => return Err("no filename para"),
    };

    Ok(Config {
        query,
        filename,
        case_insens: env::var("CASE_INS").is_ok(),
    })
}
```

剖析：

- `env::args()` 得到的是 iterator ，因此通过 move 方式传递给 `Config::new`
- 在 `Config::new` 中，需要使用该 iterator 的 `next` 方法，因此需要对该 iterator 使用 `mut` 修饰
- 由于 iterator 是通过 move 方式传入，因此我们可以直接将 `Config::new` 方法的形参加上 `mut` 修饰，即 `mut args`
- 因此，在 `Config::new` 的方法体中，不需要再判断参数个数，因为 `next` 方法得到的是 `Option<String>` ，如果参数个数不足，会得到 `None`
- 对于 `next` 得到的结果，需要使用 `match` 匹配，因为我们需要在错误发生时返回 `Err` 类型

## 改进 `search`

这是之前的代码：

```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
	let mut results = Vec::new();

	for line in contents.lines() {
		if line.contains(query) {
			results.push(line);
		}
	}

	results
}
```

缺点：

1. 需要增加新的 `result` 局部变量，而且需要 `mut` 修饰
2. `for` 循环导致代码意图不清晰，且需要在 `for` 中对 `result` 进行 `push` 操作 

改进：

直接使用 iterator 的 `filter` 来完成筛选：

```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
	contents.lines()
		.filter(|line| line.contains(query))
		.collect()
}
```

剖析：

- 代码很精简，已经不需要额外剖析
- 但要说的是解引用问题：`lines()` 得到的 item 是 `&str` ，因此 `filter` 传给 Closure 的参数是 `&&str`
- 而使用 `contains` 方法时，编译器会自动进行解引用
- 也就是说，也可以显式进行解引用，写为 `(**line).contains(query)`
- 对应的，不区分大小写的 `search_ins` 方法也进行类似的改进

## 关于编程风格

对于上述改进，尤其是 `for` 和 iterator 两种风格，应该如何选择：

- 不存在好与坏之分
- 但是，***functional programming*** 即 函数式编程的追求是：
	1. 使 `mut` 尽量少，从而更适合程序并发
	2. 使函数尽量精简，从而代码的意图更清晰
- 因此，还是推荐 iterator 的风格，向 ***functional programming*** 靠拢

关于性能：

- 对于 `for` 循环和 iterator 的性能，从直觉上看，循环越少，程序运行越快
- 实际情况在下一章讲解

