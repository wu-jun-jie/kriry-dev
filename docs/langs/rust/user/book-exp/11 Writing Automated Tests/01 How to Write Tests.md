# 编写测试

test 是 rust 中的 function，用来验证其它非 test 的代码是否按照预期执行，因此，test function 内一般做如下几件事：
1. 建立测试所需的 data 或 state
2. 运行要测试的代码
3. 确认结果是否符合预期

### The Anatomy of a Test Function

我们通过新建一个 lib 项目来看 test function 内部的细节：
```text
cargo new teststh --lib
```

然后来剖析 ```src/lib.rs``` ：
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

##### ```#[test]```

- 用来标识这是一个 test function
- 对应的是下面的 ```fn it_works```
- 该 function 可以自己编写并命名，包括使用参数、返回值等
- 目前该代码中使用了 ```assert_eq!``` 这个 macro 来检查两份数据是否相等
- 可以有很多个 test function，只要有 ```#[test]``` 标识即可
- 要运行这些 test function，需要执行命令 ```$ cargo test```

##### ```$ cargo test```

- 通过执行该命令，来运行 test function
- 只要被 ```#[test]``` 标识过的 function，都会被执行

执行 ```$ cargo test``` 以后，下面是执行结果的例子：
```text
running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests ltsth1

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

- ```running 1 test``` ，提示有多少个 test function，就是 ```#[test]``` 标注的 function
- ```test tests::it_works ... ok``` ，这是其中一个 test function 的执行结果，包括了 module 名称，function 名称，以及执行的结果是 ok 还是 fail
- ```test result``` ，对测试结果进行统计，包括 ```passed``` ,  ```failed``` , ```ignored``` , ```measured``` , ```filtered out```
- 其中，```measured``` 是针对 ***benchmark test***，也就是只可用于 ***nightly rust*** 的版本
- ```Doc-tests``` 是针对 ***documentation test*** ，在 Chapter14 介绍

### Check Result with ```assert!```

- ```assert!``` 是一个 macro
- 需要传入一个参数，类型是 Boolean
- 如果传入 true，则测试通过，否则执行 ```panic!```

例如，增加 lib 的一些功能：定义 Rect，并编写 method 来判断能否容纳参数所传入的另一个 Rect ：
```rust
#[derive(Debug)]
struct Rect {
    width: u32,
    height: u32,
}

impl Rect {
    fn can_hold(&self, other: &Rect) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

> 注意，由于例子程序中，test function 在独立的一个 module 中，因此编写 test function 时，如果要使用外部定义的类型和方法，需要在 ```mod tests``` 内使用 ```use super::*;```

然后编写 test function，目的是确认一个大的 Rect 能够容纳小的 Rect ，测试通过：
```rust
#[test]
fn larger_can_hold_smaller() {
    let larger = Rect { width: 8, height: 7 };
    let smaller = Rect { width: 5, height: 1 };

    assert!(larger.can_hold(&smaller));
}
```

再编写一个 test function，目的是确认一个小的 Rect 不能容纳大的 Rect ，测试通过：
```rust
#[test]
fn smaller_cannot_hold_larger() {
    let larger = Rect { width: 8, height: 7 };
    let smaller = Rect { width: 5, height: 1 };

    assert!(!smaller.can_hold(&larger));
}
```

下面尝试将我们的代码改出 bug ，例如改动 ```can_hold``` 的判断逻辑：
```rust
fn can_hold(&self, other: &Rect) -> bool {
    self.width < other.width && self.height > other.height
}
```

则测试失败，可以读一读下面的失败信息：
```text
running 2 tests
test tests::smaller_cannot_hold_larger ... ok
test tests::larger_can_hold_smaller ... FAILED

failures:

---- tests::larger_can_hold_smaller stdout ----
thread 'tests::larger_can_hold_smaller' panicked at 'assertion failed: larger.can_hold(&smaller)', src/lib.rs:23:9
note: Run with `RUST_BACKTRACE=1` environment variable to display a backtrace.


failures:
    tests::larger_can_hold_smaller

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

### Check Equality with ```assert_eq!``` and ```assert_ne!```

- 可以使用 ```assert!``` 并在此 macro 内通过 ```==``` 和 ```!=``` 来确认两份数据相等或不相等，因为 ```assert!``` 只能接受一份 Boolean 数据
- 但 ```assert_eq!``` and ```assert_ne!``` 使用起来更方便一些，接受两份数据，分别叫做 ***left*** 和 ***right***
- ```assert_eq!``` 是 equal
- ```assert_ne!``` 是 not equal
- 需要注意的是，```assert_eq!``` 和 ```assert_ne!``` 内部使用的是 ```==``` 和 ```!=``` ，而且，如果检查失败，会打印出 ***left*** 和 ***right*** 的内容
- 这就决定了 ***left*** 和 ***right*** 需要实现 ```PartialEq``` 和 ```Debug``` 这两个 trait
- 但是 ```PartialEq``` 和 ```Debug``` 都是可以 derive 的，因此简单起见，可以在我们的数据类型上直接使用 ```#[derive(PartialEq, Debug)]```

例如，实现一个 function，功能是将传入的数据加 2 并返回：
```rust
pub fn add_two(a: i32) -> i32 {
    a + 2
}
```

然后编写 test function ，测试通过：
```rust
#[test]
fn really_adds_two() {
    assert_eq!(4, add_two(2));
}
```

然后将代码改出 bug ：
```rust
pub fn add_two(a: i32) -> i32 {
    a + 3
}
```

则测试失败，下面是部分失败信息，可以看到 ***left*** 和 ***right*** 的值被打印出来了：
```text
thread 'tests::really_adds_two' panicked at 'assertion failed: `(left == right)`
left: `4`,
right: `5`', src/lib.rs:12:9
```

### Adding Custom Failure Messages

- 前面内容介绍的 ```assert!``` , ```assert_eq!``` , ```assert_ne!``` 内部都使用了 ```panic!```
- 而实际上，```panic!``` 是可以自定义的错误信息的
- 因此，```assert!``` , ```assert_eq!``` , ```assert_ne!``` 也可以自定义错误信息，且该错误信息会传递给 ```panic!```
- 从而，当测试失败时，自定义的错误信息就会通过 ```panic!``` 被显示出来，便于我们查找错误发生的位置
- 自定义错误信息的用法与 ```format!``` 类似

下面是语法举例：
```rust
let i = 5;
let j = 6;
assert!(i == j, "i({}) != j({})", i, j);
assert_eq!(i, j, "i({}) != j({})", i, j);
assert_ne!(i, j, "i({}) == j({})", i, j);
```

### Use ```panic!``` in Test Functions

- 前面内容介绍的 ```assert!``` , ```assert_eq!``` , ```assert_ne!``` 内部都使用了 ```panic!```
- 我们自己也可以在 test function 中使用 ```panic!```

例如下面最简单的例子：
```rust
#[test]
fn test_panic() {
    panic!("just panic");
}
```

则测试失败，下面是部分失败信息，可以看到 ```panic!``` 信息也打印出来了：
```text
running 1 test
test tests::test_panic ... FAILED

failures:

---- tests::test_panic stdout ----
thread 'tests::test_panic' panicked at 'just panic', src/lib.rs:7:9
```

### Checking for Panics with ```should_panic```

- 从前面的内容来看，如果测试过程中（不管是 test 代码还是非 test 代码）出现 panic ，则认为测试失败
- 但对于某些需求来说，程序 panic 是预期的行为
- 因此，```should_panic``` 的作用是用来说明 "此时程序 panic 是正确的"，从而出现 panic 时，也认为测试通过
- 但是，panic 可能是非预期的代码 bug 导致，也可能是预期的失败情况导致，而测试的目的，是要找出非预期的代码 bug
- 因此，可以为 ```should_panic``` 增加 ```expected``` 属性，格式为：```#[should_panic(expected = "sth")]```
- 而 ```"sth"``` 文本的内容，就是 ```panic!``` 中所附带的信息的 substring
- 因此，```should_panic``` 能否真正过滤掉预期错误的 panic ，取决于 ```expected``` 内容的精确性，且该内容只能截取 ```panic!``` 中固定不变的部分

例如，编写一个 function，判断传入的 int 值是否在 1-100 范围内，如果不满足条件，则 ```panic!``` 并输出错误信息：
```rust
pub fn range_1_to_100(a: i32) {
    if a >= 1 && a <= 100 {
        return;
    }

    panic!("{} is not between 1-100", a);
}
```

然后在 test function 中，传入大于 100 的值，并在 ```should_panic``` 的 ```expected``` 属性里截取了错误信息中的固定内容，因此该 test function 的结果是 ```passed```：
```rust
#[test]
#[should_panic(expected = "is not between 1-100")]
fn greater100() {
    range_1_to_100(200);
}
```

尝试更改该 test function 的 ```expected``` 内容，发现测试结果是 ```failed``` （当然，这是 test function 本身导致的失败，并不是被测试代码的 bug）：
```rust
#[test]
#[should_panic(expected = "is is not not between 1-100")]
fn greater100() {
    range_1_to_100(200);
}
```

### Using ```Result<T, E>``` in Tests

- 可以设置 test function 的返回值类型为 ```Result<T, E>```
- 从而在执行测试时，会自动检查 test function 的返回值，如果返回 ```Ok<T>``` ，则测试通过，如果返回 ```Err<E>``` ，则测试失败，并打印出 ```E``` 的内容

例如，test function 返回成功，因此测试通过：
```rust
#[test]
fn use_result() -> Result<(), String> {
    Ok(())
}
```

又如，test function 返回错误，则测试失败，并打印出了失败信息：
```rust
#[test]
fn use_result() -> Result<(), String> {
    Err(String::from("result is Err"))
}
```

##### 进一步思考

- 需要注意的是，对于返回值为 ```Result<T, E>``` 的 test function，是不能通过 ```#[should_panic]``` 来标注的，当然，我们也不需要，因为只要 test function 返回 ```Err<E>``` ，测试结果就会失败，并自动打印出 ```E``` 的内容
- 但是，如果被测试的代码返回值类型是 ```Result<T, E>``` ，在 test function 中就可以很方便的使用 ```?``` , ```unwrap()``` 等，从而只关注成功结果，因为失败结果 ```E``` 会被自动传给 ```panic!```
- 同时，针对 ```Err<E>``` ，可以通过 ```#[should_panic]``` 来筛选是否属于预期错误

下面举个例子，如果传入的 int 数据在 1-100 范围内，则返回 ```Ok<T>``` ，否则返回 ```Err<E>``` ：
```rust
pub fn range_1_to_100(a: i32) -> Result<(), String> {
    if a >= 1 && a <= 100 {
        return Ok(());
    }

    Err(String::from(format!("{} is not between 1-100", a)))
}
```

然后编写 test function，传入大于 100 的值，并使用 ```unwrap()``` ，同时配置 ```#[should_panic]``` 的 ```expected``` 属性，因此测试通过：
```rust
#[test]
#[should_panic(expected = "is not between 1-100")]
fn greater100() {
    range_1_to_100(200).unwrap();
}
```
