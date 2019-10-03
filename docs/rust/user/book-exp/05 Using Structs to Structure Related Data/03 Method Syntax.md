# 方法

### Method 语法
1. method 与 function 一样，通过 fn 来声明，而且可以有参数，有返回值
2. 区别是，method 是声明在 struct/enum/object 内部的，而且，第一个参数总是 self
3. self 表示当前实例
4. 可以对 slef 进行任意一种使用：self, &self, &mut self
5. 通过 impl 代码块来声明 method
6. 调用 metho 的方式：instance1.method1(paramters)
7. 也就是说，通过 . 来直接访问实例内的 method，而实例本身会被 rust 自动作为 method 的第一个参数，即 self

Method 举例，使用的 &self ：
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

fn main() {
    let rect = Rect { width: 30, height: 50 };
    println!("cal_rect() = {}", rect.cal_rect());
}
```

### *automic referencing and dereferencing*

说明：
- 这是 rust 的一个特性，叫做 *automic referencing and deferencing* 
- 当我们调用 object.something() 时，根据对 self 的使用方式，==rust 会自动对实例进行 & / &mut / * 等处理==
- 另外，rust 没有像 C/C++ 的 obj->func() 操作符

举例，下面两句代码是等价的：
```rust
/*
rust 明确的知道对 self 的使用方式，
包括 &self / &mut self / self ，
因此 rust 会自动对发起调用的实例进行处理
*/

// 手动对 p1 进行 & 处理，但没有必要
(&p1).distance(&p2);
// 这样的写法更简洁，rust 会自动进行 (&p1) 处理
p1.distance(&p2);
```

### 多个 Method & 多个参数

说明：
- impl 代码块内可以有多个 method
- 与 function 一样，method 可以有多个参数
- 参数 ownership 的规则与 function 也一致

举例：
```rust
impl Rect {
    fn cal_rect(&self) -> u32 {
        self.width * self.height
    }
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && 
        self.height > other.height
    }
}

fn main() {
    let rect1 = Rect { width: 30, height: 50 };
    let rect2 = Rect { width: 10, height: 40 };
    let rect3 = Rect { width: 60, height: 45 };

    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
    println!("Can rect1 hold rect3? {}", rect1.can_hold(&rect3));
}
```

### Associated Function

说明：
1. 与 method 一样，associated function 也是定义在 struct / enum / object 内，语法完全一致
2. 区别在于，method 第一个参数是 self，但 function 不是
3. 也就说，第一个参数是否为 self，决定了属于 method 还是 associated function
4. associated function 的用途更多是作为构造器，用来返回新的实例
5. 访问 associated function 的方式是 :: ，例如 String::from

举例：
```rust
impl Rect {
    fn square(size: u32) -> Rect {
        Rect { width: size, height: size }
    }
}

let sq = Rect::square(3);
```

例子剖析：
- square 是 associate funcion
- 访问语法是 Rect::square
- 该例子的目的是，正方形的长和宽是一样的，如果没有 square，则需要将长和宽这两个一样的值写两次

### 多个 impl 代码块

说明：
1. 每个 struct 可以有多个 impl 代码块
2. 但为了阅读方便，没有必要将 struct 的多个 method 和 associated function 分开在多个 impl 代码块中
3. Chapter 10 中会讨论多个 impl 代码块的使用场景

举例：
```rust
/*
下面针对 Rect 的多个 impl 代码块是语法正确的，
但对于该例子来说，这样做是没有意义的。
*/

impl Rect {
    fn cal_rect(&self) -> u32 {
        self.width * self.height
    }
}

impl Rect {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width &&
        self.height > other.height
    }
}

impl Rect {
    fn square(size: u32) -> Rect {
        Rect { width: size, height: size }
    }
}
```