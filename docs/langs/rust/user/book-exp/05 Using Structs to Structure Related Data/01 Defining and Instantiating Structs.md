# 结构体的定义和实例化

该章节的内容要点：
1. struct 的定义和实例化
2. struct 中的 method 和 associated function

### 结构体的定义

语法：
1. 关键字是 struct
2. 可包含多个 field
3. 每个 field 的数据类型可以不同
4. 每个 field 都必须声明数据类型

举例：
```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

访问结构体的 field
1. 通过 field 名称访问
2. 不像 tuple 一样可以通过下标访问
3. 因此访问 field 时不用关心 field 声明顺序

### 结构体的实例化

说明：
1. 结构体的实例化语法本身是 expression
2. 因此，可以用于 let 语句
3. 同时，也可以直接作为返回值
4. 实例化结构体时，每个 field 都必须赋值，不允许只赋值其中某几个 field
5. 实例化结构体时，每个 field 的顺序可以改变，不需要与声明的顺序一致
6. 如果实例化后的结构体需要改变其中某个 field 的值，则整个结构体实例都必须是 mut 的，不允许只将某几个 field 设置为非 mut

实例化结构体举例 - 用于 let 语句：
```rust
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
```

实例化结构体举例 - 修改 field：
```rust
let mut user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: false,
    sign_in_count: 8,
};

user1.email = String::from("anotheremail@example.com");
```

实例化结构体举例 - 用作返回值：
```rust
fn build_user(email: String, username: String) -> User {
    User {
        email: email,
        username: username,
        active: true,
        sign_in_count: 1,
    }
}
```

### 函数参数与结构体实例化

说明：
- 函数参数可能与 field 同名
- 此时可以只声明 field 的名字，Rust会自动使用同名的参数来为该 field 赋值
- 这样可以避免代码中重复的书写该 field 名称

举例：改进前
```rust
fn build_user(email: String, username: String) -> User {
    User {
        email: email,
        username: username,
        active: true,
        sign_in_count: 1,
    }
}
```

举例：改进后
```rust
fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}
```

### 基于已有实例来完成实例化

说明：
- 如果结构体的实例化基于另一个现有的结构体，且可能会沿用现有结构体的很多 field
- 则可以只为部分 field 赋值，其余 field 直接沿用现有结构体的值
- 语法是 ..user1
- 从而避免代码中重复的书写该 field 名称

举例：改进前
```rust
let user2 = User {
    email: String::from("another@example.com"),
    username: String::from("anotherusername567"),
    active: user1.active,
    sign_in_count: user1.sign_in_count,
};
```

举例：改进后
```rust
let user2 = User {
    email: String::from("another@example.com"),
    username: String::from("anotherusername567"),
    ..user1
};
```

### Tuple Struct

说明：
1. tuple 本身是没有名称的，因为 tuple 只能赋值给 let 语句中的变量
2. 所以各个 tuple 之间的不同只是体现于不同的变量，而整个 tuple 本身没有名称和类型的区别
3. 而 tuple struct 是：使用 struct 和 tuple 的语法，而各个 field 只需要类型却不需要名称
4. tuple struct 相比 struct 的优点：可以给整个 tuple 声明一个名称，且该名称决定了该 tuple 是一个独立的类型
5. 即使两个 tuple struct 中的 field 的个数和类型完全相同，但名称不同，则它们仍然属于两种数据类型

举例：
```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```

例子剖析：
- 变量 black 和 origin 属于不同的数据类型，因为它们实例化自两个不同的 struct 类型
- 这两个 struct 虽然 field 的个数和数据类型都是一样的，但因为两个 struct 的名称不同，所以仍然是两种数据类型
- 另外，tuple struct 的解构方式与 tuple 完全一致，可以参考 tuple 章节的讲解

### Unit-Like Struct

说明：
1. 可以定义没有任何 field 的 struct，也就是 unit-like struct
2. unit-like 的作用是可以为某些类型声明一个 trait，但不需要在该类型中存储任何数据
3. ==该内容在 Chapter 10 中讨论==

### Ownership of Struct Data

问题提出：
- 前面的例子中，struct 的 field 涉及到字符串时，使用的是 String，而不是 &str 这种 slice
- 原因是希望该 struct 实例中数据的有效性与实例本身的有效性保持一致

举例：
```rust
struct User {
    username: &str,
    email: &str,
    sign_in_count: u64,
    active: bool,
}

fn main() {
    let user1 = User {
        email: "someone@example.com",
        username: "someusername123",
        active: true,
        sign_in_count: 1,
    };
}
```

例子剖析：
1. 该例子编译会报错，因为该 struct 涉及到对其它位置数据的引用
2. 要修复该错误，涉及到 lifetime 概念
3. ==lifetime 的概念在 Chpater 10 详细讨论==，但在该章节内容中，我们使用 String 类型而不是 &str 这种 slice