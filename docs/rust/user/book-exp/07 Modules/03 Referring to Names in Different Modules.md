# module 互访问

### 全路径访问

例如有嵌套的 module ：
```rust
pub mod a {
    pub mod series {
        pub mod of {
            pub fn nested_modules() {}
        }
    }
}
```

那么需要这样访问：
```rust
a::series::of::nested_modules();
```

### 使用 ```use``` 简化路径

规则：
1. ```use``` 的作用是使某个 item 可见，从而可以直接使用该 item 而不用书写全路径
2. item 可能是 module，可能是 function，可能是其它元素
3. 不可穿透性：use 某个 item，只是 item 可见，而 item 的子元素仍然是不可见的

举例：use module
```rust
use a::series::of;

fn main() {
    // of 是可以直接使用的
    // 但 of 中的方法仍然需要 of::
    of::nested_modules();
}
```

举例：use function
```rust
use a::series::of::nested_modules;

fn main() {
    // 该方法已被 use
    // 因此不再需要 of::
    nested_modules();
}
```

举例： use enum
```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

// 通过 {} 同时 use 多个值
use TrafficLight::{Red, Yellow};

fn main() {
    // 可直接使用
    let red = Red;
    // 可直接使用
    let yellow = Yellow;
    // 没有被 use ，因此需要 TrafficLight::
    let green = TrafficLight::Green;
}
```

### 组合 ```use```

通过例子来展示 use 的组合，下图是 module、function、enum 的组织结构：

```
graph TD
    A{mod foo} --> B[fn_foo]
    A --> C{mod bar}
    A --> D{mod baz}
    C --> CF[fn_bar]
    C --> CE(enum Foo)
    CE --> FA
    CE --> FB
    D --> DF[fn_baz]
    D --> E{mod quux}
    E --> EE(enum Bar)
    E --> EF(enum Qur)
    EE --> BA
    EE --> BB
    EF --> QA
    EF --> QB
```

使用如下的 use 语法：
```rust
use foo::{
    bar::{self, Foo},
    baz::{*, quux::Bar},
};
```

然后剖析该 use 的作用，剖析内容在注释中：
```rust
/*
[ERROR]
需要 foo::
*/
fn_foo();

/*
[OK]
self 表示引入了 bar 本身，
因此可以直接使用 bar
*/
bar::fn_bar();

/*
[ERROR]
没有 use 该方法，
需要 bar::
*/
fn_bar();

/*
[OK]
因为已经 use 了 enum Foo
*/
Foo::FA;

/*
[ERROR]
只 use 了 Foo，
没有 use 到 Foo 内部的 item，
因此需要 Foo::
*/
FA;

/*
[ERROR]
并没有 use 到 baz 本身，
因为没有使用 self，
因此需要 foo::
*/
baz::fn_baz();

/*
[OK]
通过 * 来 use 了 baz 内部的所有 item，
因此可以直接调用该方法，
且此时加上 baz:: 反而会导致编译错误
*/
fn_baz();

/*
[OK]
由于 quux 属于 baz 范围，
且通过 * 引入了 baz 的所有 item，
因此可以直接使用 quux
*/
quux::Bar::BA;

/*
[ERROR]
只 use 到 Bar，
并没有 use 到 Bar 内部的 item，
因此需要 Bar::
*/
BA;

/*
[ERROR]
通过 * 引入了 baz 中的所有 item，
包括了 quux，
但并不会引入 item 的子元素，
所以 Qur 作为 quux 的子元素，不能直接使用，
需要 quux::
*/
Qur::QA;
```

使用 * 的另一种例子：
```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

use TrafficLight::*;

fn main() {
    let red = Red;
    let yellow = Yellow;
    let green = Green;
}
```

使用 * 的注意事项：
- 使用 * 要谨慎，尽量少使用这种方式
- 因为通过 * 可能引入非预期的 item，从而引发不必要的冲突

### 使用 ```super``` 和 ```::```

```super```
- 回到上一级 scope
- 从而可以在上一级 scope 范围内找到当前 scope 的 sibling

```::```
- 回到顶级目录开始查找
- 从顶层目录开始，再逐层往下书写路径

举例：见注释剖析
```rust
pub mod client {
    pub fn connect() {}
}

mod tester {
    fn it_works() {
        /*
        [ERROR]
        在当前 tester module 下找不到 client
        */
        client::connect();
        
        /*
        [OK]
        从顶层目录来书写 client 路径
        */
        ::client::connect();
        
        /*
        [OK]
        从上一级目录可以找到 client
        */
        super::client::connect();
    }
}
```