# 单元测试 & 集成测试

概述：
- 测试是一门复杂的学科，不同的语言及不同的人对于测试会使用不同的术语和组织方式
- rust 将测试分为两大类：***unit test*** 和 ***integration test***
- ***unit test*** 可以测试 private 接口
- ***integration test*** 只能测试 public 接口

### Unit Test

##### 规则说明

1. unit test 关注的是独立的代码单元，通常是 module
2. 因此 unit test 针对的是具体某个代码单元的测试，测试时与其它代码单元也是隔离的
3. 代码单元一般遵循的规则是：每个 module 在 src 中单独使用一个代码文件，因此，unit test 也是在对应的每个代码单元文件中书写 test function
4. 因此，unit test 的一般书写规则是：在对应的代码单元文件中，创建一个 module，名称是 ```tests``` ，并将该 module 配置为 ```#[cfg(test)]```

##### ```#[cfg(test)]```

- ```#[cfg]``` 表示一些特定的配置选项
- 而 ```#[cfg(test)]``` 的意思是，这些代码仅用于测试
- 因此，只有 ```cargo test``` 的时候，rust 才会编译和运行 ```#[cfg(test)]``` 所标注的这些代码
- 同时，```cargo build``` 的时候，rust 不会编译和包含 ```#[cfg(test)]``` 所标注的代码，从而提高编译效率并缩小目标文件的大小
- 另一方面，正是由于 unit test 的代码位于各个代码单元文件中，从而为了让 rust 编译器能够区分开 unit test 代码，才需要 ```#[cfg(test)]``` 标注
- 最后，对于 integration test 来说，由于测试代码是独立位于不同的文件夹中，从而也就不需要 ```#[cfg(test)]``` 标注

回顾一下 unit test 代码：
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

##### Testing Private Functions

- 业界一直在争论是否应该允许直接测试 private function
- 但不管大家的测试理念如何，对 rust 来说，允许直接测试 private function

> 质疑

- 在 Chapter7 ，我用比较民间的语言对 pub 和 private 的进行了清晰的阐述
- 而在官方文档中，举了一个测试 private function 的例子，但是这个例子本身是符合 Chapter7 中的可见性规则的
- 而且，即使对于 unit test，同样也完全遵循 Chapter7 中的可见性规则
- 下面对拓展官方文档的例子进行扩展，来说明即使对于 test module，也没有打破 rust 本身的可见性规则
- 当然，也许官方文档想表达的并不是可见性规则，而是究竟是否应该直接测试 private function
- 可我的疑问是，既然遵循可见性规则，为什么要争论 private function 是否可以被测试

下面是官方文档的例子，本身是遵循 Chapter7 的可见性规则的：
```rust
fn funcg() {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        //OK
        //可以测试funcg
        //虽然funcg是private
        funcg();
    }
}
```

同样的，根据 Chapter7 总结的可见性规则，下面的例子是不能被编译的：
```rust
mod sth {
    fn func() {}
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        //ERROR
        //只能访问到sth
        //不能访问到sth中的func
        sth::func();
    }
}
```

### Integration Test

> 注：为了描述方便，我自己将 integration test 缩写为 ```IT``` ，不属于官方称呼

##### ```IT``` 组织规则

- IT 代码是完全位于 lib 之外的
- rust 将 lib 当做一个 crate ，然后将 IT 当做其它的 crate
- 也就是说，IT 需要访问 lib 中的功能时，需要使用 ```use libxxx```
- 由于 IT 与 lib 属于独立的两个 crate ，按照 Chapter7 的访问规则，IT 当然是访问不到 lib 中 private 的 item
- IT 的代码统一放在与 ```src``` 并列的 ```tests``` 目录下

##### ```tests``` 组织结构

- 在 ```tests``` 目录下，一个 ```rs``` 文件又是一个 crate ，这些独立的 crate 都通过 ```use libxxx``` 来访问 lib 中的功能
- 也就是说，各个 IT 是相互独立的，即使各个 IT 中的 function 和 module 同名
- 一个 ```rs``` 文件表示一个 IT ，在运行 ```cargo test``` 时，针对一个 IT ，会独立的描述该 IT 的测试清单，并为该 IT 统计测试结果

##### ```#[test]``` 标注

- 在一个 IT 中，test function 可以是独立的，也可以位于 module 之中
- 只要该 IT 中的任意位置的 function 被标注了 ```#[test]``` ，就会当做 test function
- 也就是说，对于 IT 来说，rust 关注的是对 test function 的 ```#[test]``` 标注，而不再需要对 module 标注 ```#[cfg(test)]```

##### ```IT``` 功能共享

- 首先要明确的是，在 ```tests``` 目录下，各个 IT 之间是相互独立的 crate ，因此，各个 ```rs``` 文件之间不会存在命名冲突，也无法共享功能
- 其次需要重复上面讲过的内容：在 ```tests``` 目录下，一个 ```rs``` 就是一个独立的 IT ，运行 ```cargo test``` 时会独立描述该 IT 的测试清单并统计测试结果，即使该 IT 中没有任何被标注为 ```#[test]``` 的 function
- 因此，如果针对各个 IT 之间需要共享一些功能代码，例如，将一些辅助功能进行整合，叫做 util ，则需要如下步骤：
    1. 在 ```tests``` 下建立 ```util``` 子目录
    2. 在 ```util``` 子目录下创建 ```mod.rs``` 文件里承载 util 的代码
    3. 在某个 IT 中需要使用 util 代码时，在对应该 IT 的 ```rs``` 文件中使用 ```mod util``` 语法
    4. 如果还有其它的共享功能需要整合，例如 help 系列，则重复上述步骤；
    5. 也就是说，子文件夹的名称决定了所共享的功能系列名称，也决定了在 IT 中 ```mod xxxx``` 的名称，同时，代码文件只能是 ```mod.rs``` 
    5. 如果需要将某个共享功能系列中的 ```mod.rs``` 代码继续拆分，则参考 Chapter7 对 module 的讲解
- 其实可以看到，上述全部步骤与 Chapter7 的 module 组织规则是一致的，也就是说，一个 IT 是一个 crate ，而一个 IT 又对应一个 ```rs``` ，从而，需要共享的功能代码对该 IT 来说是一种 sub module ，对应的，该 IT 中 需要使用 ```mod util``` ，而不是 ```use util```
- 另外，放在子目录中的共享功能不会被 ```cargo test``` 识别为 IT ，从而也就不会为该子目录的功能产生测试清单输出

##### IT/LIB 的逻辑关系

```
graph TD

A[libx] --> |use libx| B[IT1]
A --> |use libx| C[IT2]
B --> |mod util| D(util)
C --> |mod util| D
```

##### IT/LIB 的目录结构

```
graph TD

PJ{/libx} --> SRC{/src}
SRC --> LIB[lib.rs]
PJ --> TESTS{/tests}
TESTS --> IT1[it1.rs]
TESTS --> IT2[it2.rs]
TESTS --> UTIL{/util}
UTIL --> UTLSRC[mod.rs]
```

##### 关于 binary crate

- 对于 binary crate，如果只有 src/main.rs 而没有 src/lib.rs ，则不能进行 integration test
- 因为在 src/main.rs 中已经可以直接调用和测试代码
