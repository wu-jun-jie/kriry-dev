# 环境变量

目标：
1. 实现不区分大小写的字符串查找
2. 通过环境变量来切换是否区分大小写

实现：
- 使用 ***TDD*** 方式
- 先编写不区分大小写的查找函数
- 测试通过后，再将该函数放到 ```run``` 中
- 完善 ```run``` 的功能，根据环境变量来决定调用哪一个函数（区分/不区分 大小写的两个函数）

### 建立测试代码

首先增加 ```search_ins``` 函数，实现为空：
```rust
pub fn search_ins<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    vec![]
}
```

然后增加对应的测试函数 ```test_search_ins``` ，可以看到测试是失败的：
```rust
#[test]
fn test_search_ins() {
    let query = "seCond";
    let contents = "\
line : one.
line : sEcond.
line : secONd2.
line : three.";

    assert_eq!(
        vec!["line : sEcond.", "line : secONd2."],
        search_ins(query, contents)
    );
}
```

### 完善测试代码

现在需要实现 ```search_ins``` 的功能，实现方式如下：
1. string 提供了 ```to_lowercase``` 方法，可以转换为小写
2. 但需要注意的是，这会得到一个新的 ```String```
3. 因此，对文本的每一行，以及对查找字符串 query ，都转换为小写来进行查找
4. 也可以使用正则表达式来完成该功能，但需要其它 crate ，本章内容不作演示

因此，对 ```search_ins``` 函数完善实现如下：
```rust
pub fn search_ins<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    // 得到全部小写的 query
    // 但要注意此时是 String 类型
    let query = query.to_lowercase();
    for line in contents.lines() {
        // 因此需要 &query
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}
```

然后运行测试，看到测试通过：
```text
$ cargo test

running 1 test
test tests::test_search ... ok
```

### 使用环境变量

说明：
- 环境变量类似于运行程序时可以设置的 ```RUST_BACKTRACE``` 等参数
- 例如针对该程序有环境变量 "A" ，则可以 ```A=1 cargo run``` 或者 ```A=1 cargo test```
- 最终是要在 ```run``` 中根据环境变量来决定函数的功能，但我们可以先编写测试函数来确认对环境变量的使用是否正确

实现：
- 需要 ```use std::env```
- 通过 ```env::var("XXX")``` 来获取指定的环境变量，得到的是 ```Result``` ，变量值放在 ```Ok``` 中
- 而对于本程序来说，我们不关心变量的值，而是关心变量是否设置过，例如 ```CASE_INS``` ，如果没有设置过，则默认区分大小写，如果设置过，则不区分大小写
- 因此，对于 ```Result``` ，可以使用 ```is_ok()``` 方法来判断是否得到了 ```Ok``` ，即设置过；对应的，使用 ```is_err()``` 来判断是否得到了 ```Err``` ，即没有设置过

因此可以先编写测试：
```rust
#[test]
fn test_env_set() {
    assert_eq!(
        // 环境变量名是 CASE_INS
        // 如果设置过，则 is_ok 返回 true
        env::var("CASE_INS").is_ok(),
        // 测试该环境变量是否设置过
        // 因此判断结果是否为 true
        true
    );
}
```

不设置时，测试失败：
```text
$ cargo test test_env_set

running 1 test
test tests::test_env_set ... FAILED

failures:

---- tests::test_env_set stdout ----
thread 'tests::test_env_set' panicked at 'assertion failed: `(left == right)`

left: `true`,
right: `false`
```

如果设置，则测试成功：
```text
$ CASE_INS=xxx cargo test test_env_set

running 1 test
test tests::test_env_set ... ok
```

### 代码重构

首先，环境变量也是配置信息的一部分，放到 Config 中，因此为该 struct 增加一个 field ：
```rust
pub struct Config {
    pub query: String,
    pub filename: String,
    pub case_insens: bool,
}
```

对应的，在 ```Config::new``` 函数中为该 field 赋值： ```is_err()``` ：
```rust
impl Config {
    pub fn new(args: &[String]) -> Result<Config, &'static str> {
        // --snip--
        Ok(Config {
            // --snip--
            case_insens: env::var("CASE_INS").is_ok(),
        })
    }
}
```

最后，为 ```run``` 函数增加判断条件：
```rust
pub fn run(cfg: Config) -> Result<(), Box<dyn Error>> {
    // --snip--

    let results = if cfg.case_insens {
        search_ins(&cfg.query, &contents)
    } else {
        search(&cfg.query, &contents)
    };

    // --snip--
}
```

现在，将 ```test.txt``` 内容更改如下：
```text
first line
send Line.
third lINe.
<end>
```

执行程序，默认区分大小写：
```text
$ cargo run line test.txt

first line
```

设置环境变量，不区分大小写：
```text
$ CASE_INS=xxx cargo run line test.txt

first line
send Line.
third lINe.
```
