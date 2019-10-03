# Vector

说明：
- rust 标准库包含了一系列的 collection
- collection 与内置的 array 和 tuple 不同，因为 collection 的数据是存储在 heap
- 所以 collection 在编译期不需要知道确切的大小，且在程序运行期间可以扩张和缩小

本章讨论几种 collection ：
1. vector ：顺序存储的一系列数据
2. String ：与 string 不同
3. hash map ：是 map 的另一种特殊的实现

### 关于 Vector

规则：
- 关键字是 ```Vec<T>```
- 只能同时存储一种数据类型
- 内存是顺序排布的

### 创建 Vector

例：指定数据类型
- 此时vector是空的
- 所以编译器无法推断数据类型
- 因此需要显式指定数据类型
```rust
let v: Vec<i32> = Vec::new();
```

例：自动推断数据类型
- 使用 ```vec!``` 宏，注意大小写
- 此时使用编译器的默认推断类型
- i32 是编译器默认的整型
- 因此此时类型是 i32
```rust
let v = vec![1, 2, 3];
```

例：使用数据类型后缀
- 指定数据类型为 i64
- 只需要指定其中一个，则整个 vector 就是这种数据类型
```rust
let v = vec![1_i64, 2, 4];
```

例：不适用默认推断数据类型
- 指定数据类型为 i64
- 而不是使用编译器默认推断的 i32
```rust
let v3: Vec<i8> = vec![1, 2, 4];
```

错误举例：
```rust
// 只能存储同一种数据类型
let v2 = vec![1_i64, 2_i32, 4];

// 指定的数据类型与实际类型后缀不一致
let v3: Vec<i8> = vec![1, 2_i32, 4];
```

### 增加数据

说明：
1. 要增加数据，则 vector 需要是 mut
2. 使用 ```push``` 方法

举例：
```rust
let mut v:Vec<i32> = Vec::new();
v.push(6);
```

### 销毁 Vector

说明：
1. 在 vector 离开 scope 的时候，vector 自动被销毁
2. 而销毁 vector 的时候，里面的数据内容也会被销毁

举例：
```rust
{
    let v = vec![1, 2, 3, 4];
} // 离开scope，v 和 v 里的内容被销毁
```

### 访问 Vector

有多种访问 Vector 元素的方式，每种方式都有优缺点，下面进行详细说明。

##### 下标访问

说明：
- 通过 ```&v[idx]``` 获取
- 注意得到的是引用，因此需要 ```&```
- 得到的数据类型是 ```&type```
- 例如得到的数据类型是 ```&i32```

举例：
```rust
let v = vec![1, 2, 3, 4, 5];

// 下面两句代码都一样
let third = &v[2];
let third: &i32 = &v[2];
```

陷阱：
- 如果下标越界，则程序 panic
- 如果程序设计的初衷是当访问不存在的元素时直接让程序 panic，那么可以直接使用下标访问的机制

举例：
```rust
let v = vec![1, 2, 3, 4, 5];

// panic
let does_not_exist = &v[100];
```

##### 使用 ```get``` 方法

规则：
- 通过 ```v.get(idx)``` 获取
- 得到的结果是 ```Option<&T>```
- 也就是说，结果可能是 ```Some(&T)``` 或者 ```None```
- 因此，程序需要覆盖有效结果和无效结果的情况
- 比如访问的下标不存在时，得到就是 ```None``` ，但不会导致程序 panic

举例：
```rust
let v = vec![1, 2, 3, 4, 5];

match v.get(100) {
    Some(_) => { println!("Reachable"); },
    None => { println!("Unreachable"); }
}
```

##### 回顾 borrowing rules

说明：
1. 不管什么方式访问 Vector，都是得到元素的引用
2. rust 会在编译期就检查并保证引用的有效性
3. 也就是说，rust 会保证 Vector 变得无效时，引用也必须无效
4. 也可以说，rust 会确保引用与 Vector 的紧密关联，当引用变成无效时，程序员就不再可以使用该引用
5. 所以，有一条规则是：在同一个 scope 内，不允许同时存在 mut 和 非mut 的引用

举例：
```rust
let mut v = vec![1, 2, 3, 4, 5];

let first = &v[0];
v.push(6);
```
例子剖析：
- 编译错误，因为 first 是 非mut 的引用，.push 是 mut 引用
- 虽然表面看 push(6) 不会对 v[0] 产生影响，但其实新增一个值时，Vector 可能空间会变化，所以可能重新分配一片更大的内存并拷贝原有的值，从而 &v[0] 就变为无效的引用

### 遍历 Vector

举例：获得 &
```rust
let v = vec![100, 32, 57];
for i in &v {
    println!("{}", i);
}
```

举例：获得 &mut
```rust
let mut v = vec![100, 32, 57];
for i in &mut v {
    *i += 50;
}
```

注意：
> 要改变遍历到的某个元素的值时，需要通过 ```*``` 来进行解引用

### 让 Vector 存储多种数据类型

场景举例：
- 对于电子表格的某一行，存在多个列
- 不同的列存储的数据内容不同，可能是整型，可能是字符串，可能是浮点数
- 为了将一行的多个列存储在一个 Vector中，可以使用 enum

例如：
```rust
enum SCell {
    Int(i32),
    Float(f64),
    Text(String),
}

let row = vec![
    SCell::Int(3),
    SCell::Text(String::from("abc")),
    SCell::Float(6.18),
];
```

拓展：
> 如果在编译期无法确定 Vector 要存储的所有数据类型，则上述 enum 的方式就不可用，而需要使用 trait object ，在 Chapter17 讨论
