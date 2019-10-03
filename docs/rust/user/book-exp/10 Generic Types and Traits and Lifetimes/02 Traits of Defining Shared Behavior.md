# 定义 trait

什么是 trait :
- 某种 type 的行为，就是我们能够在该 type 上调用到的方法
- 如果多种 type 具备共同的行为，则可以使用 trait 来将这些共同的行为组织在一起

> trait 类似其它语言中的 interface ，虽然有些细微的差异

### Defining a Trait

语法举例：
```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
```

语法说明：
1. 关键字是 ```trait```
2. trait 有名称，在该例子中是 ```Summary```
3. trait 中的 method 只需要声明，不需要实现
4. trait 中可以有多个 method，每个 method 一行

### Implementing a Trait on a Type

实现 trait 的例子：
```rust
pub struct NewsArticle {
    pub headline: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {}", self.headline, self.author)
    }
}
```

说明：
1. 对于 ```NewsArticle``` 的 method，语法是 ```impl NewsArticle```
2. 但如果是为 ```NewsArticle``` 实现 ```Summary``` 这个 trait，则语法是 ```impl Summary for NewsArticle```
3. 因此，主语语法关键字 ```for```

调用 trait 与调用 method 没有区别：
```rust
let article = NewsArticle {
    headline: String::from("good new !"),
    author: String::from("dorof lin"),
    content: String::from("sth ..."),
};

println!("new article: {}", article.summarize());
```

实现 trait 的限制：
1. 实现 trait 时，type 和 trait ，必须至少有一个 local to our crate
2. 例如上面的例子，可以为 ```NewsArticle``` 实现标准库的 ```Display``` 这个 trait ，也可以为标准库的 ```Vec<T>``` 实现 ```Summary``` 这个 trait
3. 但是，对于上面的例子，不可以为标准库的 ```Vec<T>``` 实现标准库的 ```Display``` 这个 trait
4. 这个约束叫做 ***coherence*** ，也叫 ***orphan rule***
5. 该约束的作用是，确保了别人不会破坏到我们的代码，反过来，也确保了我们不会破坏到别人的代码

### Default Implementations

说明：
- trait 中的部分或全部 method 可以有默认的实现
- 从而在为 type 实现 trait 时，对于有默认实现的那些 method，可以 keep，也可以 override
- 但要注意的是，即使某个 type 的 trait 全部使用默认实现，也仍然需要有一个空的 ```impl``` 来表明该 type 实现了 该 trait
- 例如：```impl Summary for NewsArticle {}```

举例：
```rust
//定义trait，并增加默认实现
pub trait Summary {
    fn summarize(&self) -> String {
        String::from("sth...")
    }
}

//定义struct
pub struct NewsArticle {
    pub headline: String,
    pub author: String,
    pub content: String,
}

// struct使用trait默认的实现
impl Summary for NewsArticle {}

let article = NewsArticle {
    headline: String::from("good new !"),
    author: String::from("dorof lin"),
    content: String::from("sth ..."),
};

//new article: sth...
println!("new article: {}", article.summarize());
```

拓展：
- trait 中的 method 可以调用其它 method
- 无论该 method 是默认的实现还是 type 中的实现

举例：
```rust
//定义trait
pub trait Summary {
    //该method由type实现
    fn summarize_author(&self) -> String;
    //该method默认实现，并调用summarize_author
    fn summarize(&self) -> String {
        format!("from {}...", self.summarize_author())
    }
}

//定义struct
pub struct NewsArticle {
    pub headline: String,
    pub author: String,
    pub content: String,
}

// struct只需要实现trait中的summarize_author
impl Summary for NewsArticle {
    fn summarize_author(&self) -> String {
        format!("@{}", self.author)
    }
}

let article = NewsArticle {
    headline: String::from("good new !"),
    author: String::from("dorof lin"),
    content: String::from("sth ..."),
};

//new article: from @dorof lin...
println!("new article: {}", article.summarize());
```

### Traits as Parameters

trait 可以用来限定参数，其中涉及多种语法，包括语法糖，分别讲解如下。

#### trait bound syntax

语法规则：
- 为 generic type 使用 ```: trait``` 语法
- 即 ```<T: trait>```
- 如果有多个 generic type，对于任何需要 trait bound 的 generic type，都需要使用 ```: trait``` 语法限定

举例：
```rust
fn notify<T: Summary>(t: T) {}
fn notify<T: Summary>(t1: T, t2: T) {}
fn notify<T: Summary, U: Clone>(t: T, u: U) {}
```

#### syntax sugar of ```impl trait```

语法规则：
- 直接为参数使用 ```impl trait``` 限定
- 即 ```(para: impl trait)```
- 这是标准语法 ```<T: trait>``` 的语法糖

举例：
```rust
fn notify(t: impl Summary) {}
fn notify(t1: impl Summary, t2: impl Summary) {}
fn notify(t: impl Summary, u: impl Clone) {}
```

#### mutiple trait bounds with ```+``` syntax

语法规则：
- 如果有多个 trait 限制，则使用 ```+``` 语法
- 该语法对于语法糖也可使用

举例：
```rust
fn notify(t: impl Summary + Display) {}
fn notify<T: Summary + Display>(t: T) {}
```

#### clear trait bounds with ```where``` clauses

问题：
- 如果有多个 generic type
- 且多个 generic type 都有多个 trait bounds
- 则参数清单会变得很长和不易阅读

例如：
```rust
fn notify<T: Display + Clone, U: Clone + Debug>(t: T, u: U) ->i32 {}
```

改进：
- 使用 ```where``` 从句
- 从而将 generic type 的 trait bounds 统一放到 ```where``` 从句里面
- 这样的话，函数名，参数列表，返回值，trait bounds 就很清晰的被分开，从而代码更容易阅读

举例：
```rust
fn notify<T, U>(t: T, u: U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{
}
```

### Returning Types that Implement Traits

语法：
- 函数返回值可以是实现了 trait 的 generic type
- 语法是 ```impl trait``` ，从而不需要为返回值指定具体的类型

举例：
```rust
fn ret_trait() -> impl Summary {
    NewsArticle {
        headline: String::from("good new !"),
        author: String::from("dorof lin"),
        content: String::from("sth ..."),
    }
}
```

限制：
- 返回值是实现 trait 的 generic type 时有一个限制，就是所返回的 type 必须是编译时能够确定的
- 因此对于运行时才能确定所返回的 generic type，编译会报错
- 原因其实也很简单，因为对于 generic type，编译期会在编译期进行 ***monomorphization*** ，也就是说所返回的类型在编译器就必须确定

例如下面的代码是编译不通过的：
```rust
fn ret_trait(switch: bool) -> impl Summary {
    if switch {
        NewsArticle {
            headline: String::from("good new !"),
            author: String::from("dorof lin"),
            content: String::from("sth ..."),
        }
    } else {
        Tweet {
            headline: String::from("tweet new !"),
            author: String::from("dorof lin"),
            content: String::from("tweet ..."),
        }
    }
}
```

注意：
> ==在 Chapter17 会讨论如何通过 ```trait object``` 来实现返回不同的 generic type==

### Fixing the ```largest``` Function

现在重新来看前面所写的 ```largest``` 函数，该函数是编译不过去的，先贴在下面：
```rust
fn largest<T>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];
    println!("largest number is {}", largest(&number_list));

    let char_list = vec!['y', 'm', 'a', 'q'];
    println!("largest char is {}", largest(&char_list));
}
```

错误分析：
> 编译器报错，提示 ```T``` 需要实现 ```PartialOrd``` 这个 trait，因为代码中我们使用了 ```>``` 这种比较运算符，因此代码更改如下：

```rust
fn largest<T: PartialOrd>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

错误进一步分析：
> 此时仍然编译报错，因为这句代码 ```let mut largest = list[0]```，错误提示 ```cannot move out of type [T], a non-copy slice```，原因是对于 generic type 的 ```&[T]``` ，rust 默认按照 ```Move``` 方式对待元素 ```T```，即使我们 ```main``` 函数中实际传入的 ```Vector``` 都是 scalar type

##### 改进办法一

> 为 ```T``` 增加 ```Copy``` 或 ```Clone``` 的 trait，但要注意的是，对于像 ```String``` 这种涉及到 heap data 的类型，```Clone``` 可能会影响程序性能

```rust
fn largest<T: PartialOrd+Copy>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

##### 改进办法二

> 将返回值更改为 ```&T```，从而不再需要为 ```T``` 增加 ```Copy``` 或 ```Clone``` 的 trait，注意两种改进方式的代码实现区别

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

==未解：==
> ==上述两种改进方式中的 ```for``` 循环，有时需要 ```&item``` ，有时需要 ```item``` ，原因还未想明白。==

### Using Trait Bounds to Conditionally Implement Methods

- 该部分内容会对 method 做一个总结回顾，包括 generic type，trait 等
- 同时扩展出新的内容，例如根据 trait bound 来选择性的实现 method
- 下面用代码来按学习的顺序从简单到复杂进行展示

##### 回顾：不涉及 generic type，定义 struct 并实现 method

```rust
struct Rect {
    width: u32,
    height: u32,
}

impl Rect {
    fn cal_rect(&self) -> u32 {
        self.width * self.height
    }
}
```

##### 回顾：为涉及 generic type 的 struct 实现 method

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}
```

##### 回顾：为涉及 generic type 的 struct 实现针对某种具体类型的 method

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

##### 扩展：对于涉及 generic type 的 struct ，针对满足 trait bound 的 generic type 来实现 method

```rust
struct Pair<T> {
    x: T,
    y: T,
}

impl<T: PartialOrd> Pair<T> {
    fn cmp_display(&self) {}
}
```

##### 回顾：为某种类型实现 trait

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}

pub struct Tweet {
}

impl Summary for Tweet {
    fn summarize(&self) -> String {}
}
```

##### 扩展：对于任何类型，只要满足指定的 trait bound ，则可以为其实现另一种 trait

语法：
```rust
impl<T: TraitA> TraitB for T {
}
```

剖析：
- 这种为满足 ```trait a``` 的 ```generic type T``` 实现 ```trait b``` 的行为叫做 ***blanket implementation***
- ***blanket implementation*** 在rust的标准库中被广泛使用
- 例如，对于任何类型 ```T``` ，只要实现了 ```Display``` trait ，标准库就会为其实现 ```ToString``` trait
- 因此，对于 ```int``` 类型，由于支持 ```Display``` trait，因此可以直接调用 ```to_string()``` 方法来得到对应的 ```String``` 内容，而 ```to_string()``` 方法就是标准库在 ```ToString``` trait 中定义的

举例：
```rust
pub trait ToString {
    pub fn to_string(&self) -> String;
}

impl<T: Display> ToString for T {
    // --snip--
}

let s = 3.to_string();
```
