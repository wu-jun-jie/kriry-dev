# 集成测试示例

前面的内容对 integration test 的规则进行了总结，下面通过例子，来逐步展示这些规则。

*源码：[lib_integ_test](https://gitee.com/A1G2G1/Rust_The_Book/tree/master/lib_integ_test)*

> 创建 lib crate，名称是 lib_integ_test ，与 unit test 类似，lib.rs 代码如下：

```rust
//需要pub，否则IT访问不到
pub fn func_g() {}

//需要pub，否则IT访问不到
pub mod mod_g {
    pub fn func1() {}
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unit_test1() {
        mod_g::func1();
    }
}
```

> tests/iteg_test1.rs 代码如下，注意不管 function 是否在 module 中，只要是 test function ，就需要标注 #[test]：

```rust
//注意这句代码
use lib_integ_test;

#[test]
fn itg1_test1() {
    //访问lib中的function
    lib_integ_test::func_g();
}

mod itg1 {

    #[test]
    fn test1() {
        //访问lib中某个mod里的function
        lib_integ_test::mod_g::func1();
    }
}
```

> 创建 util/mod.rs

```rust
/*
参考 Chapter7 ，
该文件所在的子文件夹名称是 util ，
因此 module 名称自动就是 util ，
所以，在该代码文件中，
所有的 mod 都是 util 的 submodule
*/

pub fn util_func1() {}

pub mod mod_u {
    pub fn func1() {}
}
```

> tests/iteg_test2.rs 代码如下，使用了 util 中的功能

```rust
//注意这句代码
mod util;

#[test]
fn itg2_test1() {
    //访问util中的function
    util::util_func1();
}

mod itg2 {

    #[test]
    fn test1() {
        //itg2是一个sub module
        //因此需要super::才能访问到util
        super::util::mod_u::func1();
    }
}
```

> 下面是节选的部分测试结果，可以分别看到 unit test 、itg1/itg2 两个 integration test 的结果，同时，util 不会被测试。为了结果展示的清晰，我在每个 "Running ..." 之前，加了 ">>>" 标注。注意看每个 "Running ..." 的内容，其中展示了 IT 的名称。

```text
>>> Running target/debug/deps/lib_integ_test-801523445e71dcaa

running 1 test
test tests::unit_test1 ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

>>> Running target/debug/deps/iteg_test1-07f5cf4a39a0f065

running 2 tests
test itg1::test1 ... ok
test itg1_test1 ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

>>> Running target/debug/deps/iteg_test2-a8df2154fd340010

running 2 tests
test itg2::test1 ... ok
test itg2_test1 ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

> 可以直接复制 tests/iteg_test1.rs 的内容来创建 tests/iteg_test3.rs ，且从运行结果可以看到各个 IT 之间不会产生命名冲突。

