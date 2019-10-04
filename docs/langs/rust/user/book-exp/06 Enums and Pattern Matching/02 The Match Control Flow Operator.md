# 使用 match

说明：
1. ```match``` 可以用来匹配任何类型
2. 虽然使用 ```if``` 也可以达到 ```match``` 的功能，但 ```if``` 只能匹配 ```bool```
3. 语法是 ```match``` 配合 arm
4. arm 通过 ```=>``` 来产生对应代码块
5. 每个 arm 的代码块可以只有一行，而如果存在多行代码，可以使用 ```{}```

举例：匹配 enum
```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => {
            println!("this is dime!");
            10
        },
        Coin::Quarter => 25,
    }
}
```

举例：匹配和访问 enum 中的值
```rust
#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State is {:?}!", state);
            25
        },
    }
}

// 调用方法
value_in_cents(Coin::Quarter(UsState::Alaska));
```

注意：
> 对于 enum 来说，match 有一个强行的限制：enum 中的所有值都必须有对应的 arm，否则编译器会报错

举例：匹配和访问 ```Option<T>```
```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(6) => Some(100),
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```

针对该例子需要注意：
> - ```None``` 必须要有 arm，否则编译器报错
> - 可以不要 ```Some(6)``` 这个具体的 arm
> - 但是 ```Some(i)``` 这个 arm 必须有，而不能只有具体的 ```Some(6)``` 这种 arm，但后续例子有更好的解决办法

举例：通过 ```_``` 来实现类似 ```default``` 的功能
```rust
fn ftest(x : Option<i32>) -> Option<i32> {
    match x {
        Some(6) => Some(100),
        //Some(i) => Some(i+1),
        None => None,
        _ => None,
    }
}

let none = ftest(Some(5));
```

注意：
> 在上例中，我们注释掉了 ```Some(i)```，而只匹配了具体的 ```Some(6)```，其它值则通过 ```_``` 来代替

举例：```_``` 也包含 None
```rust
fn ftest(x : Option<i32>) -> Option<i32> {
    match x {
        Some(6) => Some(100),
        //Some(i) => Some(i+1),
        //None => None,
        _ => None,
    }
}

let none = ftest(Some(5));
```

举例： ```()``` 空实现
```rust
let some_u8_value = 0u8;
match some_u8_value {
    1 => println!("one"),
    3 => println!("three"),
    5 => println!("five"),
    7 => println!("seven"),
    _ => (),
}
```

注意：
> - 如果 arm 中什么也不做，就用 ```()``` 来表示
> - 如果写为 ```_ => ,``` ，编译器会报错
