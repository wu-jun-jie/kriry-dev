# 定义测试行为

##### ```cargo test``` 默认行为

1. 运行所有 test function （ignore 的除外）
2. 使用并行方式同时运行所有 test function，因此要注意 test function 不能相互依赖，或依赖于共享的 data,state,environment 等
3. 对于成功的 test function，所有的标准输出都会被屏蔽，只显示测试结果为成功
4. 对于失败的 test function，标准输出不会被阻止

##### 关于 ```cargo test``` 的控制

- 类似于 ```cargo run``` 会编译并运行 binary 文件， ```cargo test``` 也是将测试代码编译为 binary 文件并运行，因此可以为 ```cargo test``` 指定命令行参数
- 参数分为两类，一类是针对 ```cargo test``` ，叫做 ```[OPTIONS]``` ，一类是针对测试的 binary 文件，叫做 ```[ARGS]```
- 参数都是用 ```--para``` 来指定，顺序是：```cargo test [OPTIONS] [TESTNAME] -- [ARGS]``` ，也就是说，通过 ```--``` 分隔，来表示后续的参数是 ```[ARGS]```
- 本章内容暂时不涉及到 ```[OPTIONS]``` ，主要针对 ```[TESTNAME]``` 和 ```[ARGS]```

### 使用 ```[ARGS]```

##### 显示标准输出 ```--nocapture```

下面的例子有两个 test function ，都会产生标准输出，但是一个成功，一个失败，可以看到只有失败的 test function 会打印标准输出：
```rust
fn ptsth(s: &str) {
    println!("{}", s);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_func1() {
        ptsth("func1");
        assert_eq!(2 + 2, 4);
    }

    #[test]
    fn test_func2() {
        ptsth("func2");
        assert_eq!(2 + 3, 6);
    }
}
```

因此，如果针对成功的 test function 也要打印标准输出，则使用 ```--nocapture``` ，因此针对上面的例子，看到执行结果可能如下（节选了部分）：
```text
$ cargo test -- --nocapture

running 2 tests
func1
func2
thread 'tests::test_func2' panicked ...
test tests::test_func1 ... ok
test tests::test_func2 ... FAILED

failures:
    tests::test_func2

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

从上面的输出可以看到：
1. 成功和失败的 test function ，标准输出都被打印出来了
2. 但是，多个 test function 的输出显示是交错的，这是因为默认多个 test function 是并行执行的

##### 控制执行顺序 ```--test-threads```

说明：
- 从上面的例子看到，```cargo test``` 默认对于多个 test function 是并发执行的
- ==也可以理解为，如果有 N 个 test function，则有 N 个线程同时执行==
- 因此，通过 ```--test-threads``` ，可以控制测试执行时的线程数量
- 语法：```--test-threads=X```
- ```X``` 就是要设置的线程数量，如果为 1 ，就是串行执行各个 test function
- 如果 ```X``` 大于 1 ，则可以理解为设置了线程池，各个 test function 的执行工作自动分派到线程池调度执行
- 甚至允许 ```X``` 大于 test function 的数量，但 ```cargo test``` ==可能会自动将线程池的线程个数优化为不超过 test function 的数量==

例如，针对上面的例子，要求标准输出，同时串行执行，则得到的执行结果如下（节选了部分），可以看到，执行顺序是串行的：
```text
$ cargo test -- --nocapture --test-threads=1

running 2 tests
test tests::test_func1 ... func1
ok
test tests::test_func2 ... func2
thread 'main' panicked...
FAILED

failures:
    tests::test_func2

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

### 使用 ```[TESTNAME]```

##### 黑名单 - 使用 ```ignore```

说明：
- 可以配置 test function 为 ```ignore``` ，从而 ```cargo test``` 就不执行这些 test function
- 语法：将 ```#[ignore]``` 配置在 ```#[test]``` 下面
- ***可以理解为针对 test function 的黑名单功能***

举例：
```rust
#[cfg(test)]
mod testm1 {

    #[test]
    #[ignore]
    fn test_1() {}

    #[test]
    fn test_2() {}
}
```

则执行结果节选如下，可以看到哪些 test function 被 ignore ，且在最后的结果统计中，看到被 ignore 的数量：
```text
running 2 tests
test testm1::test_1 ... ignored
test testm1::test_2 ... ok

test result: ok. 1 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out
```

##### 白名单 - 使用 ```filter```

规则说明：
- 可以指定 ```[TESTNAME]``` ，来实现哪些 test function 需要被 ```filter```
- 指定的 ```[TESTNAME]``` 是 test function 的 substring ，具有该 substring 的test function 会被执行，反之则被 ```filter```
- 需要注意的是：```[TESTNAME]``` 包括了 module 名称 和 function 名称，即 ```module1::module2::function1```
- ***可以理解为针对 test function 的白名单功能***

因此，通过指定 ```[TESTNAME]``` ，可以实现几种 ```filter``` ：
1. 指定为空，即不指定，则执行全部 test function
2. 指定为全称，或者唯一的名称，则只执行一个 test function
3. 指定部分名称，则执行具有该 substring 的系列 test function

下面通过一系列例子来展示 ```filter``` 的使用，首先是 test function 的代码如下；
```rust
#[cfg(test)]
mod testm1 {

    #[test]
    fn test_1() {}

    #[test]
    fn test_2() {}

    #[test]
    fn test_3() {}

    #[test]
    fn test_sth() {}
}

#[cfg(test)]
mod testm2 {

    #[test]
    fn test_1() {}

    #[test]
    fn test_2() {}

    #[test]
    fn test_3() {}

    #[test]
    fn test_sth() {}
}
```

> cargo test

```text
running 8 tests
test testm1::test_1 ... ok
test testm1::test_2 ... ok
test testm1::test_3 ... ok
test testm1::test_sth ... ok
test testm2::test_1 ... ok
test testm2::test_2 ... ok
test testm2::test_3 ... ok
test testm2::test_sth ... ok

test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

> cargo test test_sth

```text
running 2 tests
test testm1::test_sth ... ok
test testm2::test_sth ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 6 filtered out
```

> cargo test testm2

```text
running 4 tests
test testm2::test_1 ... ok
test testm2::test_2 ... ok
test testm2::test_3 ... ok
test testm2::test_sth ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 4 filtered out
```

> cargo test testm1::test_1

```text
running 1 test
test testm1::test_1 ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 7 filtered out
```
