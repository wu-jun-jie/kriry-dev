# 引用和借用

如果一个变量在传递给函数之后，我们后续还需要继续使用该变量，则不必 Move 传递，而是使用引用，举例如下：
```rust
fn calculate_length(s: &String) -> usize {
    s.len()
}

fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);

    println!("The length of '{}' is {}.", s1, len);
}
```

### Reference

也就是下面的代码：
```rust
let s1 = String::from("hello");
let len = calculate_length(&s1);
```

说明：
- 通过符号 & 来创建一个针对变量的引用
- 这个引用的范围是在函数运行周期内
- 引用并不会获得变量的 ownership
- 因此当引用离开其 scope 后，并不会导致 heap 的内存被 drop

### Borrow

也就是下面的代码：
```rust
fn calculate_length(s: &String) -> usize {
    s.len()
}
```

说明：
- 通过符号 & 来标识函数的某个参数是引用的
- 由于该参数是引用的，因此该参数离开其 scope 后，并不会导致 drop 行为，因为该参数并没有获得 ownership
- 同样的，该函数运行结束后，也不需要返回该参数以归还 ownership，因为该函数本身就没有获得其 ownership

总结：
1. 我们把函数的参数引用叫做 borrow
2. 可以理解为：函数会自动的借用某些数据，用完后又自动归还

### Reference 与 Mut

##### 总结一

1. 变量默认是非 mut 的，包括 String
2. 非 mut 的意思是，该变量的所有内容都不可变，包括 String 在 heap 中的数据内容
3. 同理，函数的参数默认也是非 mut
4. 包括，函数的引用参数默认也是非 mut
5. 因此，不管变量、参数、引用参数，如果需要 mut，则需要显式的声明

错误举例：
```rust
fn main() {
    // s 不是 mut类型
    let s = String::from("hello");
    can_not_change(&s);
}

// 引用默认是非mut，不能改变
fn can_not_change(some_string: &String) {
    some_string.push_str(", world");
}
```

正确举例：
```rust
fn main() {
    // s 是 mut 类型
    let mut s = String::from("hello");
    can_change(&mut s);
}

// 这是mut的引用，可以改变
fn can_change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

##### 总结二

1. mut 变量可以被引用为 & 和 &mut
2. 非 mut 变量只可以被引用为 &

错误举例：

```rust
let x = 8;

// 非mut变量不能&mut
let rx = &mut 8;
```

正确举例：

```rust
// 对mut变量使用&
let mut x = 8;
let rx = &x;

// 对mut变量使用&mut
let mut x = 8;
let rx = &mut x;
```

##### 总结三

1. mut 变量指的是该变量本身能否被更改
2. mut 引用指的是所引用的值能否被更改
3. 因此，要搞清楚改变的是变量本身，还是所引用的值

正确举例：

```C++
let x = 8;
let y = 88;

let mut rx = &x;
// 改变的是变量自身
rx = &y;
```

正确举例：

```rust
let mut x = 8;

let rx = &mut x;
// 改变的是所引用的值
*rx = 99;
```

错误举例：

```rust
let mut x = 8;
let mut y = 88;

let rx = &mut x;
// rx不是mut变量，不能被改变
rx = &mut y;
```

错误举例：

```rust
let mut x = 8;

let mut rx = &x;
// 虽然x和rx两个变量都是mut
// 但x是通过&来引用rx
// 所以不能改变所引用的值
*rx = 9;
```

##### 总结四

1. 如果变量本身的类型是引用
2. 则 & 和 &mut 是两种数据类型
3. 因此，一个 mut 变量的类型不能在 & 和 &mut 之间切换

错误举例：

```rust
let mut x = 8;
let mut y = 9;

// rx的类型被确定为&mut
let mut rx = &mut x;
// 因此不能将一个&类型赋值给rx
rx = &y;
```

### 对 &mut 的限制

##### 限制一

> 对特定的一个 scope，对特定的一份数据，只能存在一个 &mut

错误举例：
```rust
let mut s = String::from("hello");

// ok
let r1 = &mut s;
// error
let r2 = &mut s;
```

> 例外：通过 {} 创造新的 scope 即可

正确举例：

```rust
let mut s = String::from("hello");

{
    // 新的 &mut 只局限于该 scope
    let r1 = &mut s;
}

let r2 = &mut s;
```

##### 限制二

> 对于同一份数据，不允许 & 和 &mut 同时存在，但允许多个 & 同时存在，这就类似读写锁的概念，可以并发读，但只能独占写

错误举例：
```rust
let mut s = String::from("hello");

// ok
let r1 = &s;
// ok
let r2 = &s;
// error
let r3 = &mut s;

// 此处需要访问 r1,r2,r3
// 因此存在同时读写的问题
println!("{} {} {}", r1, r2, r3);
```

> 需要注意的是：rust的这个限制是为了避免读写同时存在，所以某些不经意的情况下，会发现违背直觉的编译正确，比如将上例的 ```println!``` 删除，会发现编译正确，==是因为 r1 和 r2 并未被使用，因此 r3 仍然是唯一的一个引用，这可能是编译器的自动优化==

正确举例：
```rust
let mut s = String::from("hello");

// ok
let r1 = &s;
// ok
let r2 = &s;
// ok
// 因为后续没有使用 r1 和 r2
// 因此此时可以理解为只有 r3
let r3 = &mut s;
```

##### 限制三

> 在引用的生存周期内，被引用的变量本身不允许改变，不管是 & 还是 &mut 。==我认为 Rust 做出这个限制的理由是，避免一些无意识的代码修改导致极难排查的错误，虽然这样的限制仿佛不符合程序员的直觉==

错误举例：

```rust
let mut x = 8;

// 注意是&mut
let rx = &mut x;
// 不允许x自身内容变化
x = 9;

println!("{}", rx);
```

错误举例：

```rust
let mut x = 8;

// 注意是&
let rx = &x;
// 不允许x自身内容变化
x = 9;

println!("{}", rx);
```

### Dangling Reference

何为 dangling reference：
- 类似于 dangling pointer，就是指针所指向的内存已被释放，但该指针仍然被继续使用
- 对应的，在Rust中也会有 dangling reference，就是内存已被释放，但仍然有引用指向该内存

Rust的机制：
- 通过编译器，在编译期间就可以完全确保不会出现 dangling reference
- 机制是：==编译器确保在引用离开 scope 之前，对应的所引用的数据也不会离开 scope==

错误举例：
```rust
fn dangle() -> &String {
    // s 离开 scope 后就被 drop
    let s = String::from("hello");
    // 因此 &s 变成了 dangling reference
    // 从而编译器就会报错
    &s
}
```

正确举例：
```rust
fn no_dangle() -> String {
    let s = String::from("hello");
    // s 通过 Move 方式返回
    s
}
```
