# 枚举的定义

### 定义 enum

说明：
- enum 在某些场景下比struct更适合
- 因为在这些场景下，只会出现enum中的某个值，而不会同时出现
- 例如 IP 的版本是 V4 或 V6， 但不会同时是 V4 和 V6
- enum 中的所有值都属于同一种类型，也就是 enum 的名称所表示的类型
- 定义 enum 的关键字是 enum

举例：
```rust
enum IpAddrKind {
    V4,
    V6,
}
```

### 枚举 enum

说明：
- 可将 enum 中的值赋给变量
- 这些变量的类型就是 enum 名称所表示的类型
- 访问 enum 中的值的语法是 enum::value
- 而 enum 名称所表示的类型也可以作为函数形参的类型
- 对应的，enum 中的值也可以作为作为函数的实参

举例：赋值给变量
```rust
let four = IpAddrKind::V4;
let six = IpAddrKind::V6;
```

举例：函数形参
```rust
fn route(ip_type: IpAddrKind) { }
```

举例：函数实参
```rust
route(four);
route(IpAddrKind::V4);
route(IpAddrKind::V6);
```

### 让 enum 存储数据

说明：
1. enum 中的每个值，可以携带数据
2. 携带的数据可以是一些基本的数据类型，也可以是复杂的数据类型
3. 场景举例：除了 V4 和 V6 两个类型外，还可以携带 IP 地址信息
4. 下面通过例子，从简单到复杂，看看 enum 如何存储数据

刚开始，可能我们会定义独立的 struct 来存储 IP 地址数据：
```rust
// IP地址类型
enum IpAddrKind {
    V4,
    V6,
}

// IP数据，包括类型和地址
struct IpAddr {
    kind: IpAddrKind,
    address: String,
}

// 创建实例
let home = IpAddr {
    kind: IpAddrKind::V4,
    address: String::from("127.0.0.1"),
};

// 创建实例
let loopback = IpAddr {
    kind: IpAddrKind::V6,
    address: String::from("::1"),
};
```

对于该例子，enum 有更便捷的方式，可以在 enum 中就直接包含 IP 地址：
```rust
// IP类型和地址
enum IpAddr {
    V4(String),
    V6(String),
}

// 创建实例
let home = IpAddr::V4(String::from("127.0.0.1"));

// 创建实例
let loopback = IpAddr::V6(String::from("::1"));
```

除了 String，还可以 tuple，例如 V4 的地址是 4 个 u8：
```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

let home = IpAddr::V4(127, 0, 0, 1);
let loopback = IpAddr::V6(String::from("::1"));
```

剖析：
- 上面例子里，还可以是更复杂的类型，甚至是 struct 等
- 其实 rust 的标准库中定义过关于 IP 地址的类型，当然我们也可以自己定义

下面是 rust 标准库中的定义，使用的就是 struct ，但标准库中是独立定义了 struct ：
```rust
struct Ipv4Addr {
    // --snip--
}

struct Ipv6Addr {
    // --snip--
}

enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}
```

下面再看一个例子，涉及到各种数据类型，也衍生出一些概念：
```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

剖析：
1. enum 类型是 Message
2. Quit 不携带数据
3. Move 携带的是```匿名struct```
4. Write 携带的是 String
5. ChangeColor 携带的是 tuple，但准确的说，是```匿名tuple struct```

因此可以如下使用：
```rust
let q = Message::Quit;
let m = Message::Move {x: 256, y: 128};
let w = Message::Write(String::from("sth");
let c = Message::ChangeColor(128, 66, 92);
```

### ```Method``` & ```Associated Function```

说明：
1. 与 struct 一样，可以有 method ，也可以有 associate function
2. method 的第一个参数是 self，通过 . 来访问
3. associated function 第一个参数不是 self，通过 :: 来访问
4. 也是通过 impl 来声明代码块

举例：
```rust
impl Message {
    fn call(&self) {
    }
}

let m = Message::Write(String::from("hello"));
m.call();
```

### ```Option``` & ```null```

概述：
1. 在 rust 中，没有 ```null``` 这种值
2. 因为在其它语言中，例如C/C++中，一个指针可能是有效的值，也可能是 null 值
3. 但在 rust 中，通过 ```enum Option<T>``` 来替代 null

具体用法：
```rust
enum Option<T> {
    Some(T),
    None,
}
```

说明：
- 这是 rust 标准库中定义和包含的类型
- 在使用 Some 时，不需要 Option:: 前缀，因为根据 Some 的内容，编译期可以自行推断
- 但在使用 None 时，就需要 Option:: 前缀并注明类型，因为编译期无法自动推断类型

举例：
```rust
let some_number = Some(5);
let some_string = Some("a string");

let absent_number: Option<i32> = None;
```

```Option<T>``` 和 ```T``` 不能直接混用：
```rust
let x: i8 = 5;
let y: Option<i8> = Some(5);

// 编译错误
let sum = x + y;
```

说明：
1. 参考 API 来将 ```Option<T>``` 转为 ```T```
2. 而且 ```Option<T>``` 有很多 可用的其它 API
3. ==对于确定不会出现 null 的情况，可以直接使用 ```T``` ，但如果要考虑 null 的情况，则需要 ```match``` 语法，来处理 ```Some<T>``` 和 ```None```==
