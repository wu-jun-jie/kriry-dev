# 泛型 generic

***generic*** 的作用：
- 可以实现数据类型的参数化
- 包括 function，struct，enum，method

### In Function Definitions

接着上面的例子，对于 i32 和 char 两种 list，需要分别定义两个函数来查找最大值：
```rust
fn largest_i32(list: &[i32]) -> i32 {
    let mut largest = list[0];
    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn largest_char(list: &[char]) -> char {
    let mut largest = list[0];
    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

使用 generic 改进：
1. 这两个函数的逻辑完全一样，只有处理的数据类型不同
2. 因此可以将数据类型参数化
3. 数据类型参数化之前，首先需要为该参数指定名字
4. 命名原则：尽量简短，通常一个字符
5. 因此，一般使用 ```T``` , ```U```, ```V```, ```W``` 等命名
6. 如果只有一种 generic type，那么一般使用 ```T``` 来命名

因此，将上面两个函数封装为 generic，语法如下：
```rust
fn largest<T>(list: &[T]) -> T { }
```

对应的，上面两个函数简化为：
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

注意：
> 该代码目前还不能成功编译，错误提示 ```T``` 类型需要 ```std::cmp::PartialOrd``` 这种 trait，会在后续讨论如何为 generic type 指定特定的 trait

### In Struct Definitions

可以对 struct 使用 generic type，例如 ```Point<T>``` ：
```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```

注意：
- 由于只使用一个 gneric type，因此，x 和 y 都是同一种数据类型
- 所以，在创建 ```Point<T>``` 的实例时，如果数据类型不一样，编译器就会报错

例如：
```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let wont_work = Point { x: 5, y: 4.0 };
    /*
    编译器提示错误：
    ^^^ expected integral variable,
    found floating-point variable
    */
}
```

可以定义多种 generic type，从而 ```Point<T>``` 中的 x 和 y 可以是不同的数据类型，例如：
```rust
struct Point<T, U> {
    x: T,
    y: U,
}

fn main() {
    let both_integer = Point { x: 5, y: 10 };
    let both_float = Point { x: 1.0, y: 4.0 };
    let integer_and_float = Point { x: 5, y: 4.0 };
}
```

### In Enum Definitions

看一下熟悉的 ```Option<T>``` 的声明：
```rust
enum Option<T> {
    Some(T),
    None,
}
```

说明：
- ```Option<T>``` 使用了 generic type，也就是 ```T```
- 有两个变量，```None``` 和 ```Some```
- 其中，```Some``` 可以携带 ```T``` 类型的数据

Enum 也可以使用多种 generic type，例如熟悉的 ```Result<T,E>``` ：
```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

在使用标准库打开文件的时候，就会返回 ```Result<T,E>``` 类型：
- 如果打开成功，```T``` 是 ```std::fs::File```
- 如果打开失败，```E``` 是 ```std::io::Error```

### In Method Definitions

可以为 struct 和 enum 定义 method ，且这些 method 可以使用 generic type ，下面分步进行说明。

#### generic type method

下面的例子对 method 使用了 generic type ：
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

fn main() {
    let p = Point { x: 5, y: 10 };
    println!("p.x = {}", p.x());
}
```

注意：
- 该 method 是为 ```Point<T>``` 这种 generic 类型实现的
- 因此，需要让编译器知道 ```Point<T>``` 中的 ```T``` 是 generic type 而不是具体的某种数据类型
- 所以，就需要在 ```impl``` 后面加上 generic 修饰，也就是 ```impl<T>```

#### concrete type method

进一步的，可以只为具体的某种类型实现 method ，而不是 ```Point<T>``` ：
```rust
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
```

说明：
- 对于 ```Point<f32>``` 类型，有 ```fn distance_from_origin```
- 但对于其它的 ```Point<T>``` ，如果 ```T``` 不是 ```f32``` 类型，就没有该 method

#### generic type extension

generic type 可以扩展，先看下例：
```rust
struct Point<T, U> {
    x: T,
    y: U,
}

impl<T, U> Point<T, U> {
    fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c'};

    let p3 = p1.mixup(p2);
    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```

例子剖析：
1. 定义的 ```Point``` 类型是 ```T``` 和 ```U```
2. 但为该 ```Point``` 定义的 method 可以处理另外一种 ```Point```，类型是 ```V``` 和 ```W```
3. 因此，```T/U``` 与 ```V/W``` 的数据类型可能是不一样的
4. 通过该 method ，创建新的 ```Point``` 实例，类型是 ```T``` 和 ```W```
5. 因此该例子会打印出 ```p3.x = 5, p3.y = c```

需要注意的是：
- ```T/U``` 需要用于 ```impl``` ，因为 ```impl``` 是针对 ```Point<T,U>``` 声明的，所以 ```impl``` 的 ```T/U``` 必须与 ```Point<T,U>``` 的 ```T/V``` 保持一致
- ```V/W``` 只需要用于 ```fn mixup``` ，因为 ```V/W``` 仅与 ```fn mixup``` 有关，而与 ```Point<T,U>``` 的声明无关

### Performance of Generic

generic 对程序运行时性能的影响：
- 无任何影响
- 因为 rust 是在编译期将 generic type 转换为 concrete type
- 这个转换过程叫做 ***monomorphization***
- 因此，generic type 只是针对编译时，而不是运行时
- 运行时都是 concrete type
- 因此并不会影响到程序的运行时性能

#### *monomorphization* 举例

例如下面的 generic 例子：
```rust
enum Option<T> {
    Some(T),
    None,
}

let integer = Some(5);
let float = Some(5.0);
```

那么经过编译器 ***monomorphization*** 之后，代码可能是如下的样子：
```rust
enum Option_i32 {
    Some(i32),
    None,
}

enum Option_f64 {
    Some(f64),
    None,
}

fn main() {
    let integer = Option_i32::Some(5);
    let float = Option_f64::Some(5.0);
}
```
