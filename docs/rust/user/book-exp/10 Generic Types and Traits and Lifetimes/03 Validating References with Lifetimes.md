# 标注 lifetime

#### 前言
- 在rust中，reference 都存在 ***lifetime***
- 大多数情况下，***lifetime*** 是编译器内部自行推断的，就像数据类型的自动推断一样
- 但有的时候需要我们显式的进行标注，这种标注叫做 ***generic lifetime parameter***
- ***lifetime*** 是rust与其它编程语言最与众不同的一个特性
- 因此，***lifetime*** 专门针对 reference
- 同时，***lifetime*** 的目的是避免 dangling reference

### Preventing Dangling References with Lifetimes

看一个例子：
```rust
let r;
{
    let x = 5;
    r = &x;
}
println!("r: {}", r);
```

错误剖析：
- 变量 r 引用了 x
- 但是 r 的生存周期比 x 要长
- 因此在 x 被销毁后，r 仍然保留着 x 的引用
- 所以此时 r 就变成了 dangling reference
- 因此编译器报错

注意:
> 声明变量 r 时没有赋初值，但 r 并不会是 null 变量，而且rust中也没有 null 的概念，但编译器允许这样做，是因为rust编译器会确保在 r 被使用之前一定被赋过值

### The Borrow Checker

说明：
- 可以这样总结：rust要求 reference 的生存周期不能大于被引用的数据的生存周期
- 而对于编译器来说，使用的机制就是 ***borrow checker***
- 下面通过代码注释来形象的展示 ***borrow checker*** 是如何检查生存周期

下面是一个错误的例子，可以看到 r 这个 reference 的生存周期大于变量 x ：
```rust
{
    let r;                // ---------+-- 'a
                          //          |
    {                     //          |
        let x = 5;        // -+-- 'b  |
        r = &x;           //  |       |
    }                     // -+       |
                          //          |
    println!("r: {}", r); //          |
}                         // ---------+
```

而下面这个正确的例子可以看到，r 的生存周期不大于变量 x ：
```rust
{
    let x = 5;            // ----------+-- 'b
                          //           |
    let r = &x;           // --+-- 'a  |
                          //   |       |
    println!("r: {}", r); //   |       |
                          // --+       |
}                         // ----------+
```

### Lifetime Annotation Syntax

说明：
- 首先要讲解 lifetime 标注的语法
- 其次才在后续讲解需要 lifetime 标注的场景
- 而 lifetime 的标注就叫做 ***generic lifetime parameter***

语法：
- ```&'a type``` 或 ```&'a mut type```
- 其中，```&``` 是必须的，标识引用
- 然后，通过 ```'``` 表示 ***generic lifetime parameter*** 开始
- 接着，在 ```'``` 之后是 ***generic lifetime parameter*** 的名称，该名称一般尽量简短，最好是一个字符，且使用小写
- 例如，```&i32``` 表示引用，没有 ***generic lifetime parameter***
- 例如，```&'a i32``` 表示引用，对应的 ***generic lifetime parameter*** 是 ```a```
- 又如，```&'a mut i32``` ，```&'a T```

使用方式：
- 可以使用在 function , struct , method 中，语法都与 generic type 类似，如下：
- ```fn func<'a>(para1: &'a type) -> &'a type```
- ```struct Sth<'a> { f1: &'a type, }```
- ```impl<'a> Sth<'a> {}```
- 也就是说，通过在 ```<>``` 中来声明 generic lifetime parameter ，然后在参数、返回值、成员变量中使用这些 parameter

##### *generic lifetime parameter*
1. 并不会影响 reference 的生存周期
2. 只是标注各个 references 的 lifetimes 之间的关系
3. 类似于 trait 可以用来限定 generic type 的类型：generic lifetime 可以用来限定 reference 所需要满足的生存周期，而不是去改变 reference 的生存周期
4. 而各个 references 的 lifetimes 其实就是通过诸如 ```'a``` 的形式来表示
5. 或者，可以将 ```'a``` 、```'b``` 等理解为不同的生存周期的占位描述符

### Generic Lifetimes in Functions

下面开始正式讲解如何标注 lifetime ，先看下面的例子，编译器会报错：
```rust
fn longest(x: &String, y: &String) -> &String {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let s1 = String::from("abcd");
    let s2 = String::from("abcdefghijk");

    let result = longest(&s1, &s2);
    println!("{}", result);
}
```

错误剖析：
- 编译器错误提示 “该函数需要 lifetie parameter”
- 因为该函数会返回引用，而根据程序实际运行的情况，可能返回参数 x 的引用，也可能返回参数 y 的引用
- 因此，编译器需要 ***generic lifetime parameter*** 来帮助 borrow cheker 进行更多的分析

因此，对代码进行如下更改：
```rust
fn longest<'a>(x: &'a String, y: &'a String) -> &'a String {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

更改说明：
- 使用了 ```'a```
- 且输入参数和返回值都被 ```'a``` 约束
- 也就是说，输入参数和返回值的生存周期必须一致
- 后续通过代码例子来验证编译器对输入参数和返回值的生存周期的检查

例子一：
- 两个输入参数 x 和 y 的生存周期大小不一致
- 但是返回值的生存周期不大于任何一个输入参数
- 因此编译和运行正确

```rust
fn main() {
    let s1 = String::from("abcd");
    {
        let s2 = String::from("abcdefghijk");
        let result = longest(&s1, &s2);
        println!("{}", result);
    }
}
```

例子二：
- 两个输入参数数 x 和 y 的生存周期大小不一致
- 但是返回值的生存周期大于输入参数 y ，即使实际运行时返回值所引用的 x
- 但是对于编译器来说，无法知道实际返回值所引用的是哪一个输入参数
- 因此编译器只遵循一个原则：返回值的生存周期不能大于任何一个输入参数
- 所以编译报错

```rust
fn main() {
    let s1 = String::from("abcdefghijk");
    let result;
    {
        let s2 = String::from("abcd");
        result = longest(&s1, &s2);
    }
    println!("{}", result);
}
```

### Generic Lifetimes in Structs

说明：
- 对于 struct 来说，如果成员中有引用，则都必须为该引用进行 lifetime annotation
- 而 lifetime annotation 的意义是，struct 实例的生存周期不能大于任何一个所引用的数据的生存周期
- 后面通过例子来验证编译器对 struct 实例与所引用的数据之间的生存周期检查

首先，定义 struct ：
```rust
struct Sth<'a> {
    f1: &'a String,
    f2: &'a String,
}
```

例子一：
- 有两份数据，生存周期大小不一致
- 创建 struct 实例，引用了这两份数据
- 该 struct 实例的生存周期不大于所引用任何一份数据
- 因此编译和运行正常

```rust
fn main() {
    let s1 = String::from("abcdefghijk");
    {
        let s2 = String::from("abcd");
        let i = Sth {
            f1: &s1,
            f2: &s2,
        };
        println!("{} {}", i.f1, i.f2);
    }
}
```

例子二：
- 有两份数据，生存周期大小不一致
- 创建 struct 实例，引用了这两份数据
- 该 struct 实例的生存周期大于所引用其中一份数据
- 因此编译报错

```rust
fn main() {
    let i;
    let s1 = String::from("abcdefghijk");
    {
        let s2 = String::from("abcd");
        i = Sth {
            f1: &s1,
            f2: &s2,
        };
    }
    println!("{} {}", i.f1, i.f2);
}
```

### Generic Lifetimes in Methods

说明：
- method 与 function 一样，需通过 lifetime annotation 来标注输入参数与返回值的生存周期关系
- 但是 method 比 function 多了 ```&self``` 或 ```&mut self``` 参数，而这个参数导致了更复杂的情况，但是我认为 The Book 中讲解的并不透彻，后续会进一步演示和总结
- 因此此处先用简单的与 function 类似例子来做展示

```rust
struct Sth1<'a> {
    f1: &'a String,
}

impl<'a> Sth1<'a> {
    fn m1<'c>(&self, x: &'c String, y: &'c String) -> &'c String {
        if x.len() > y.len() {
            x
        } else {
            y
        }
    }
}
```

例子剖析：
- 可以看到语法，由于 struct 本身使用了 generic lifetime parameter，因此在 ```impl``` 的时候，也需要 ```impl<'a> Sth1<'a>```
- 对于 method 来说，与 generic type 一样，可以使用与 struct 不同的 generic lifetime parameter
