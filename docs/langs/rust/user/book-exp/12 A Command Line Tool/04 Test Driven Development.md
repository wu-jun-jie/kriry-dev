# tdd 开发模式

##### 前言

- 前面的章节里，我们实现了将代码分离为 ```lib.rs``` 和 ```main.rs```
- ```lib.rs``` 中包含了代码逻辑
- ```main.rs``` 包含了参数收集、错误处理等
- 因此我们可以为 ```lib.rs``` 编写测试函数来验证功能，而不需要在命令行直接运行来测试
- 例如，可以直接测试 ```Config::new``` 以及 ```run``` 的逻辑

##### 后语

- 在本章，我们需要实现搜索的逻辑代码
- 但我们会使用 ***TDD*** 即 test driven development 的方式来完成开发
- ***TDD*** 的好处是，可以驱动代码的设计，而且比起先开发后测试来说，***TDD*** 可以确保测试的高覆盖

##### TDD 流程

1. 编写失败的测试函数，并确保属于预期的失败
2. 改进测试代码，让测试能够成功
3. 对成功的测试代码进行重构，并重新测试确保通过
4. 重复上述步骤

### Writing a Failing Test

首先需要做一些准备工作：
- 我们要实现的功能是，在给定的文本中（可能来源于文件）查找指定的字符串，并打印出包含该字符串的文本行
- 因此先定义一个 ```search``` 函数，接受两个参数：query 和 contents
- 同时，对 ```seach``` 函数进行测试
- 另外，可以删除原代码中的 ```println!``` 

然后在 ````lib.rs`` 中增加 ```search``` 函数原型：
```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    vec![]
}
```

代码剖析：
- 先返回一个空的 ```Vec``` ，也就是说先不做任何功能实现
- 由于 ```Vec``` 中存储的是文本的某些行，因此需要使用 ```'a``` 进行 lifetime 标注

最后在 ````lib.rs`` 中增加测试函数:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search() {
        let query = "second";
        let contents = "\
line : one.
line : second.
line : three.";

        assert_eq!(
            vec!["line : second."],
            search(query, contents)
        );
    }
}
```

代码剖析：
- 要查找的字符串是 ```second```
- 给定的文本中有某些行包含这个字符串
- 因此使用 ```assert_eq!``` 来校验，查找结果是否符合预期

此时测试失败：
```text
$ cargo test

running 1 test
test tests::test_search ... FAILED

failures:

---- tests::test_search stdout ----
thread 'tests::test_search' panicked at 'assertion failed: `(left == right)`

left: `["first line : second."]`,
right: `[]`
```

### Writing Code to Pass the Test

现在需要实现 ```search``` 的功能，实现方式如下：
1. string 提供了 ```lines``` 方法，可以枚举出文本中包含的行
2. 因此，可以通过 ```for``` 来循环文本中的每一行
3. 针对每一行 string ，提供了 ```contains``` 方法来判断是否存在某个字符串
4. 对于包含指定字符串的行，通过 ```Vec``` 的 ```push``` 方法来进行存储
5. 返回最后的 ```Vec```

因此，对 ```search``` 函数完善实现如下：
```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    // 先声明 mut 的 Vec
    let mut results = Vec::new();

    // lines 产生 iterator
    for line in contents.lines() {
        // contains 判断 query 是否存在
        if line.contains(query) {
            // push 存储到 Vec 中
            results.push(line);
        }
    }

    // 返回 Vec
    results
}
```

然后运行测试，看到测试通过：
```text
$ cargo test

running 1 test
test tests::test_search ... ok
```

### Refactoring the Code

说明：
- 现在 ```search``` 函数已经能正常工作
- 而 ```run``` 函数完成了从文件中读取文本的工作
- 因此目前需要做的工作是，在 ```run``` 中完成对 ```search``` 的调用，传递的参数是：命令行参数中的 query ，以及从文件中读取到的文本
- 最后，```run``` 可以打印出 ```search``` 得到的 ```Vec```

因此，```run``` 函数代码完善如下：
```rust
pub fn run(cfg: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(cfg.filename)?;

    // 使用 for 来循环 Vec
    for line in search(&cfg.query, &contents) {
        println!("{}", line);
    }

    Ok(())
}
```

假设有文件 ```test.txt``` ，内容如下：
```text
first line
第二行 not end line.
<end>
```

运行程序：
```text
$ cargo run end test.txt

第二行 not end line.
<end>
```

### 总结

1. ***TDD*** 的好处是，针对我们开发过程中涉及到的各个函数，都可以首先进行测试，确保功能可行，再集成到其它函数或模块中
2. 例如本例子中涉及到的 ```search``` 函数，如果直接开发并集成到 ```run``` 函数中，那么直接运行程序时，如果发现存在问题，则很难查找是 ```search``` 还是 ```run``` 甚至 ```main``` 的问题
3. 一个庞大的程序总是由各种 module 和 function 组成的，遵循 ***TDD*** 的开发模式，可以确保测试与开发的同步进行，也就是说，达到了测试的高覆盖
