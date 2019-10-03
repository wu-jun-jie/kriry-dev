# 前言

每种语言都有对应的机制来有效处理概念及逻辑的重复，Rust 的机制就是 *generic* .

Generic 解释：
- 可以简单理解为，generic 就是 **++类型的抽象++**
- 例如，通过函数参数，可以处理未知的只有运行时才能确定的具体值
- 同样的，通过 generic ，可以处理未知的类型，而不只是具体的类型

本文讲解顺序：
1. 首先回顾函数的封装和抽象，从而避免代码的重复；其次，通过 geneic 来抽象多个函数，而这些多个函数的逻辑是类似的，除了参数类型不同；最后会讲解如何在 struct 和 enum 等类型中使用 genneric
2. 学习如何通过 trait 来限定 generic type 需要具备的特定行为，而不是任意类型
3. 学习 lifetime ，编译器通过 lifetime 可以得到 generic 之间的 reference 信息，并检查和确保 reference 的有效性

#### 通过函数封装来避免代码重复

例如，查找 list 中的最大值：
```rust
let number_list = vec![34, 50, 25, 100, 65];

let mut largest = number_list[0];

for number in number_list {
    if number > largest {
        largest = number;
    }
}

println!("largest number is {}", largest);
```

如果有两个 list ，则上述代码需要重复两次：
```rust
//处理第一个 list
let number_list = vec![34, 50, 25, 100, 65];

let mut largest = number_list[0];

for number in number_list {
    if number > largest {
        largest = number;
    }
}
println!("largest number is {}", largest);

//处理第二个 list
let number_list = vec![102, 34, 6000, 89, 54, 2, 43, 8];

let mut largest = number_list[0];

for number in number_list {
    if number > largest {
        largest = number;
    }
}
println!("largest number is {}", largest);
```

因此可以封装为函数：
```rust
fn largest(list: &[i32]) -> i32 {
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
    println!("The largest number is {}", largest(&number_list));

    let number_list = vec![102, 34, 6000, 89, 54, 2, 43, 8];
    println!("The largest number is {}", largest(&number_list));
}
```

进一步的问题：
- 该函数只能处理 i32 类型的 list
- 如果需要处理 char 类型的 list，则需要封装第二个函数
- 而这两个函数的代码逻辑都是一样的，仍然存在冗余
- 因此后续就可以通过 generic 来解决该冗余

