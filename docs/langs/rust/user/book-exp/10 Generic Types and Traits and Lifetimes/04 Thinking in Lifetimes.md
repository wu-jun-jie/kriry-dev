# Thinking in Lifetimes

#### 概述：本章的意义

- 我很喜欢这个标题，因为以前学习 C++，Java 的时候，都从 Thinking in C++ ，Thinking in Java 这两本书里受益匪浅
- 刚接触软件不到一年，自学 C++ 的时候，确实被面向对象的概念搞糊涂了一阵，但看了部分 Thinking in Java 这本书的内容之后，才茅塞顿开，明白了面向对象的封装，继承，多态等基础概念
- 而对于 rust 来说，lifetime 确实是与其它编程语言最不同的概念，而本章内容到此处，对 lifetime annotation 的讲解和理解是不透彻的
- 所以我将 The Book 本章原本的讲解顺序进行了调整，按自己的理解进行了调整并汇总在此处，同时再加入自己的部分内容和理解，希望通过 Thinking in Lifetimes 这个标题，也来将 lifetime 的概念讲解得更透彻一些

#### 总结：返回值与参数的关系

1. function 和 method 都涉及到返回值和参数
2. lifetime annotation 的本质作用，是标注返回值的生存周期对参数生存周期的依赖
3. 注意重点，是针对返回值，因为返回值依赖的是数据，而数据是从参数传入的，所以 rust 编译器需要确保返回值所引用的数据是有效的
4. 那么，参数的数据又是从哪里来，编译器并不关心，因为此时我们是站在 function 和 method 的角度来看的，所以编译器只需要关心返回值如何依赖于参数，这就足够了，而至于参数的数据，那是 function 和 method 之外的检查
5. 注意，method 的 ```self``` 参数的影响后续再说

例子回顾：
```rust
fn longest<'a>(x: &'a String, y: &'a String) -> &'a String {}
```

##### 问题引申

- 假设 x 和 y 的 lifetime annotation 不一样，例如 ```'a x``` 和 ```'b y```
- 但返回值仍然必须依赖于某个输入参数，例如 ```'a String``` ，也就是说，我们的标注告知了编译器，返回值的生存周期依赖于 x ，但不依赖于 y
- 则此时编译器就会检查我们的代码，确认返回值是否确实只依赖于 x
- ==而言外之意是，如果返回值根据实际运行时的情况，可能依赖于 x，也可能依赖于 y，则 x 和 y 及返回值必须使用同一个 lifetime annotation==

因此，该例子编译正确：
```rust
fn longest<'a>(x: &'a String, y: &'b String) -> &'a String {
    x
}
```

而该例子就编译错误：
```rust
fn longest<'a>(x: &'a String, y: &'b String) -> &'a String {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

#### 总结：实例与引用内容的关系

1. struct 的 field 会涉及到实例与引用内容的关系
2. lifetime annotation 的本质作用，是限定实例的生存周期对所引用数据的生存周期的依赖
3. 注意重点，是针对实例，因为实例依赖于数据，所以 rust 编译器需要确保实例所引用的数据是有效的

例子回顾：
```rust
struct Sth<'a> {
    f1: &'a String,
    f2: &'a String,
}
```

##### 问题引申一

- struct 实例的生存周期依赖于所引用的数据，换句话来说，其实是：一旦所引用的数据被 drop，则 struct 实例本身也就被 drop
- 比如说，struct 实例所引用的任何一个数据被 drop 后，即使访问该实例中没有被 drop 的数据，也是不被允许的，因为此时整个 struct 实例都被自动 drop 掉了

例子：该 struct 有三个 filed，在 f2 所引用的数据被 drop 后，整个 struct 实例都不再可用，即使 f1 和 f3 实际并没有被 drop
```rust
struct Many<'a> {
    f1: &'a String,
    f2: &'a String,
    f3: i32,
}

fn main() {
    let m1;
    let s1 = String::from("s1");
    {
        let s2 = String::from("s2");
        m1 = Many {
            f1: &s1,
            f2: &s2,
            f3: 8,
        };
    }
    println!("{}", m1.f3);  
}
```

##### 问题引申二

- 创建 struct 的第一个实例 i1，所引用的数据来源是两个 String 变量 s1 和 s2
- 创建 struct 的第二个实例 i2，所引用的数据来源是第一个实例的 f1 和另一个 String 变量 s3
- 则此时 i2 实例的生存周期依赖于 i1.f1 和 s3
- 而编译器能够自行推演，所以可以简化为：i2 实例的生存周期依赖于 s1 和 s3

例子1：实例 i2 的生存周期不大于 s1 和 s3 ，编译正确
```rust
struct Sth<'a> {
    f1: &'a String,
    f2: &'a String,
}

fn main() {
    let s1 = String::from("s1");
    let s2 = String::from("s2");
    let s3 = String::from("s3");
    
    let i1 = Sth {
        f1: &s1,
        f2: &s2,
    };
    
    let i2 = Sth {
        f1: i1.f1,
        f2: &s3,
    };
    println!("{} {}", i2.f1, i2.f2);
}
```

例子2：实例 i2 的生存周期大于 s1 ，但不大于 s3 ，也不大于 i1 ，但仍然编译错误，因为编译器推演到 i2 实际依赖于 s1
```rust
struct Sth<'a> {
    f1: &'a String,
    f2: &'a String,
}

fn main() {
    let i1;
    let i2;
    let s2 = String::from("s2");
    let s3 = String::from("s3");
    {
        let s1 = String::from("s1");
        i1 = Sth {
            f1: &s1,
            f2: &s2,
        };

        i2 = Sth {
            f1: i1.f1,
            f2: &s3,
        };
    }
    println!("{} {}", i2.f1, i2.f2);
}
```

#### 总结：多个 lifetime annotation 及扩展

##### 【1】使用多个 lifetime annotation

- 从 struct 本身的定义来看，即使 struct 中各个涉及引用的 field 都使用不同的 lifetime annotation，是没有意义的
- 因为编译器要做的事情是，确保 struct 实例的生存周期不大于所引用的任何一份数据的生存周期

例子：
```rust
struct Sth<'a, 'b> {
    f1: &'a String,
    f2: &'b String,
}

fn main() {
    let s1 = String::from("s1");
    let s2 = String::from("s2");
    let i1 = Sth {
        f1: &s1,
        f2: &s2,
    };
    println!("{} {}", i1.f1, i1.f2);    
}
```

##### 【2】针对多个 lifetime annotation 的 ```impl``` 实现

- 与 generic type 类似，如果有多个 lifetime annotation，则 ```impl``` 时也需要遵循对应 struct 的对应
- 而在 ```impl``` 代码块内部，所实现的 function 或 method 没有什么不同

例子：不管 ```impl``` 代码块内部有多么普通，```impl``` 本身都必须遵循 struct 本身的定义
```rust
struct Sth<'a, 'b> {
    f1: &'a String,
    f2: &'b String,
}

impl<'a, 'b> Sth<'a, 'b> {
    fn m1(x: i32) -> i32 {
        x
    }
}

fn main() {
    println!("{}", Sth::m1(9)); 
}
```

##### 【3】对 lifetime annotation 的扩展

- 与 generic type 类似，虽然 ```impl``` 必须遵循 struct 本身的定义，但是 ```impl``` 内部的函数可以扩展出其它的 generic lifetime annotation
- 此处使用 function 的例子来做展示

例子：通过 function 扩展出了其它 lifetime annotation
```rust
struct Sth<'a, 'b> {
    f1: &'a String,
    f2: &'b String,
}

impl<'a, 'b> Sth<'a, 'b> {
    fn m2<'c>(x: &'c String, y: &'c String) -> &'c String {
        if x.len() > y.len() {
            x
        } else {
            y
        }
    }
}

fn main() {
    let s1 = String::from("s1 abc");
    let s2 = String::from("s2 abcdefg");
    println!("{}", Sth::m2(&s1, &s2));
}
```

##### 【4】外部数据与内部数据的 lifetime 一致性

**需求一**

- 有一个 struct 实例 i1
- 为该 struct 实现 method ，对传入的参数与自身的数据进行比较，来返回较长的数据
- 所以，该需求涉及到外部数据（所传入的参数）与内部数据（self.fx）的 lifetime 一致性，因为返回值可能引用到外部数据，也可能引用到内部数据
- 因此，输入参数、所使用到的内部数据、返回值，这三者的 lifetime annotation 必须一致
- 进一步，由于内部数据（self.fx）对应的 struct 的标注是确定的（例如 ```'a```），所以，决定了输入参数、返回值都只能也必须标注为 ```'a```

例如：内部数据是 f1 ，因此使用 ```'a``` 进行限制，编译正确
```rust
struct Sth<'a, 'b> {
    f1: &'a String,
    f2: &'b String,
}

impl<'a, 'b> Sth<'a, 'b> {
    fn m3(&self, x: &'a String) -> &'a String {
        if self.f1.len() > x.len() {
            self.f1
        } else {
            x
        }
    }
}

fn main() {
    let s1 = String::from("s1");
    let s2 = String::from("s2");
    let s3 = String::from("s3");    
    let i1 = Sth {
        f1: &s1,
        f2: &s2,
    };
    println!("{}", i1.m3(&s3));
}
```

又如：由于内部数据是 f1，因此不管使用 ```'b``` 还是 ```'c``` ，都编译错误，因为与 struct 的成员 f1 对应的 lifetime 标注是 ```'a```
```rust
struct Sth<'a, 'b> {
    f1: &'a String,
    f2: &'b String,
}

impl<'a, 'b> Sth<'a, 'b> {
    //不管 'b 还是 'c ，都编译错误
    //因为都与 self.f1 对应不上
    fn m3<'c>(&self, x: &'b String) -> &'b String {
        if self.f1.len() > x.len() {
            self.f1
        } else {
            x
        }
    }
}
```

**需求二**

- 有一个 struct 实例 i1
- 为该 struct 实现 method ，并传入参数，使用自身数据和参数数据来创建新的 struct 实例 i2
- 所以，该需求涉及到外部数据（所传入的参数）与内部数据（self.fx）的 lifetime 一致性
- 因此，重点是需要对所使用到的内部数据的 lifetime 进行标注，而外部数据使用何种标注并不重要，因为对于 struct 实例来说，生存周期不能大于所引用的任何一份数据的生存周期
- 所以，对于该需求，有两种标注方式，在例子代码中进行了展示
- 同时，在例子代码中，故意对 struct 内的引用使用了不同的 lifetime annotation ，顺便也证明了一点：这么做并没有意义

首先，定义 struct ，使用不同的 lifetime annotation，但并不是非要这么做：
```rust
struct Sth<'a, 'b> {
    f1: &'a String,
    f2: &'b String,
}
```

其次，实现 m4 ，再次看到没有必要为 struct 的引用使用不同的 lifetime annotation ，但注意对返回值的标注方式 ```Sth<'a, 'c>``` ：
```rust
impl<'a, 'b> Sth<'a, 'b> {
    fn m4<'c>(&self, x: &'c String) -> Sth<'a, 'c> {
        Sth {
            f1: self.f1,
            f2: x,
        }
    }
}
```

然后，实现 m5 ，与 m4 同样的功能：
```rust
impl<'a, 'b> Sth<'a, 'b> {
    fn m5(&self, x: &'a String) -> Sth {
        Sth {
            f1: self.f1,
            f2: x,
        }
    }
}
```

对 m5 的进一步剖析：
1. 可以看到，m4 的返回值是 ```Sth<'a, 'c>```
2. 而对于 m5 ，返回值是 ```Sth``` ，因为编译器自动帮我们标注为 ```Sth<'a, 'a>```
3. 因此，其实 m5 可以有如下几种写法，但不管什么写法，根本原则是：由于将 ```self.f1``` 赋值给成员 ```f1``` ，因此，必须确保第一个占位符是 ```'a``` 

```rust
fn m5(&self, x: &'a String) -> Sth
fn m5(&self, x: &'a String) -> Sth<'a, 'a>
fn m5(&self, x: &'b String) -> Sth<'a, 'b>
fn m5<'c>(&self, x: &'c String) -> Sth<'a, 'c>
```

#### 其它：lifetime elision

说明：
- 在某些情况下，我们可以不标注 lifetime
- 因为编译器有一套规则来自动完成标注
- 这个自动完成标注的过程，叫做 ***lifetime elision***
- 在介绍规则前，定义术语：输入参数的 lifetime 叫做 ***input lifetime*** ，返回值的 lifetime 叫做 ***output lifetime***

规则：
1. 为每个 ***input lifetime*** 都标注不同的 ```'name``` ，例如，```'a``` ，```'b``` ，```'c``` ...
2. 如果只有一个 ***input lifetime*** ，则 ***output lifetime*** 的标注与 ***input lifetime** 一致
3. 如果有多个 ***input lifetime** ，且存在 ```self``` ，也就是说，这是一个 method ，则 ***output lifetime*** 使用与 ```self``` 一致的生存周期

举例：编译正确
```rust
//code
fn func(x: & String) -> & String
//lifetime elision
fn func<'a>(x: &'a String) -> &'a String
```

举例：编译错误
```rust
//code
fn func(x: & String, y: & String) -> & String
//lifetime elision
fn func<'a, 'b>(x: &'a String, y: &'b String) -> &'??? String
```

举例：编译成功
```rust
struct Sth<'a> {
    f1: &'a String,
    f2: &'a String,
}

impl<'a> Sth<'a> {
    //返回值的lifetime与self一致
    fn func(&self, x: & String) -> & String {
        self.f1
    }
}
```

举例：编译失败
```rust
struct Sth<'a> {
    f1: &'a String,
    f2: &'a String,
}

impl<'a> Sth<'a> {
    //实际返回值是与x关联
    //但 lifetime elision 规则是：
    //将返回值lifetime标注为与self一致
    //因此编译器报错
    fn func(&self, x: & String) -> & String {
        x
    }
}
```

举例：编译成功
```rust
struct Sth<'a> {
    f1: &'a String,
    f2: &'a String,
}

impl<'a> Sth<'a> {
    //实际返回值是与x关联
    //因此手动标注返回值与x的lifetime一致
    //此处标注为 'b/'c'/'d 都可以
    //但标注为 'a 的原因是：
    //避免 func<'c> 这个多余的声明
    fn func(&self, x: &'a String) -> &'a String {
        x
    }
}
```

#### 其它：static lifetime

说明：
- 有一个关键字，或者说是保留的标注，是 ```'static```
- 该标注用来说明引用的数据是全局的生存周期
- 例如，文本字符串默认就是全局的引用，不需要我们手动标注
- 而对于参数、返回值、引用内容等，需要程序自行确认，是否有必要标注为 ```'static```

举例：
```rust
//使用文本字符串
let s = "abc";
//编译器自动标注为 'static
let s: &'static str = "abc";
```

#### 其它：Sth

##### 【1】聊胜于无

- The Book 中举了个例子，就是返回值是函数内的临时变量
- 不知道 The Book 中举这个例子的目的是什么，也许函数内的临时变量也是一种 lifetime
- 所以标题叫做 ***聊胜于无***
- 当然，rust 想表达的意思是，既然返回值是引用，那么该引用就必须要与输入参数或者外部生存周期更广的其它变量（例如 ```'static```）进行关联，否则，要不就是返回了局部变量，要不就是返回的引用超出了自身能够被 ```borrow``` 的范围（例如前面的例子里，返回 ```self.f1``` 却不使用 ```f1``` 对应的 ```'a``` 来标注）

先看下面的代码：编译器报错，要求返回值需要标注 lifetime ，前面的 ***lifetime elision*** 讲过推演规则
```rust
fn func(x: & String, y: & String) -> & String {
    &String::from("sth")
}
```

然后依据编译器提示，为返回值标注 lifetime ，但依然编译错误，因为编译器发现返回值使用了函数内的临时变量
```rust
fn func<'a>(x: & String, y: & String) -> &'a String {
    &String::from("sth")
}
```

##### 【2】融会贯通

- 是该融会贯通的时候了
- 将 generic type, trait, trait bound, generic lifetime annotation 都汇总在一起

例子：查找较大的值，使用 generic 方式
```rust
struct Sth<'a, T> {
    f: &'a T,
}

impl<'a, T: PartialOrd> Sth<'a, T> {
    fn max(&self, x: &'a T) -> &'a T {
        if self.f > x {
            self.f
        } else {
            x
        }
    }
}
```
