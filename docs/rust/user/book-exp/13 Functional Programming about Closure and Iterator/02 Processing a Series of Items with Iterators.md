# 迭代器 Iterator

## 概述

关于 iterator ：

- iterator 可以处理序列化的 item
- iterator 负责 item 遍历的逻辑，并确定是否已遍历完毕
- 对于使用者来说，只用关心对所遍历的 item 进行的操作，而不用关注如何去遍历

iterator 的本质：

- iterator 是一种 Trait ，该 Trait 叫 `Iterator`
- 也就是说，要使用 iterator 的方法，需要基于一个实现了 `Iterator` 这种 Trait 的对象
- 那么，这个实现了 `Iterator` Trait 的对象内包含了一些数据和逻辑，例如遍历的起始位置，以及判断如何定位到下一个 item ，还有，判断是否已经遍历完毕
- 以常见的 Vector 为例，例如 `let v = vec![1, 2, 3]` ，则 `v` 本身是一个对象
- 然后我们通过 `let it = v.iter()` 得到了 iterator ，也就是 `it` ，它本身也是一个对象，但这个对象实现了 `Iterator` 这个 Trait
- 因此要注意的是，上面的 `v` 和 `it` 是两个对象，这两个对象内部存储的数据是不同的：`v` 存储的是各个元素的内容，而 `it` 存储的可能是 `v` 中元素的起始位置、遍历的逻辑等；也就是说，数据的存储与数据的遍历，可能是两个对象
- 而另一种情况，既然 `Iterator` 是一种 Trait ，那么我们可以直接为存储数据的对象实现这种 Trait ，那么此时，数据的存储与数据的遍历就是同一个对象 

iterator 的特性：

- iterator 是 lazy 的（惰性）
- 也就是说，在创建了一个 iterator 的时候，数据并没有被遍历，因为此时仅仅是创建了一个 iterator 而已
- 因此，iterator 的方法有两种，一种是 ***Consume*** ，一种是 ***Produce***  
- ***Consume*** 就是消费，可以理解为，这种方法会进行数据的遍历，直到 iterator 告知遍历已结束
- ***Produce*** 就是生产，这种方法不会进行数据的遍历，而是改变或拓展了 iterator 的行为，例如，对于每个 item ，允许我们查看、修改、过滤它们，甚至由此产生新的序列化的 item
- 所以，我们可以将多个 ***Produce*** 方法连在一起调用，类似于 `iterator.p1().p2().px()` ，可以把这种调用理解为一连串精密的环环相扣的齿轮，最终需要 ***Consume*** 的调用才能让这一连串齿轮运转起来

## `Iterator` Trait

说明：

- `Iterator` 是 Rust 标准库中定义的 Trait 
- 这个 Trait 中有很多方法，但是 Rust 都进行了默认实现
- 除了一个方法：`next` ，因为这个方法决定了 item 如何遍历、遍历是否结束等逻辑

该 Trait 在 Rust 标准库中定义如下：

```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;

    // --Snip--
}
```

剖析：

- `type item` 详细在 Chapter 19 讲解，现在可以这样理解：`type` 表示后续会声明一种数据类型，这种数据类型就是 `Item` ，例如 `i32`
- 因此，`Option<Self::Item>` 表明了 `next` 方法得到的 item 的数据类型
- 所以，如果遍历得到了下一个 item ，例如 `i32` 类型，则得到的结果是 `Some(&i32)` ，而如果遍历已经结束，则得到的结果是 `None`
- 上述 `next` 方法就是 `Iterator` Trait 唯一没有被 Rust 标准库默认实现的方法
- 注意，`next` 方法要求 `&mut` ，因为这会改变 iterator 内部的数据，例如让 iterator 可以指向下一个 item

可以调用 `Iterator` 的 `next` 方法：

```rust
fn main() {
	let v = vec![1, 2, 3];
	let mut it = v.iter();

	assert_eq!(it.next(), Some(&1));
	assert_eq!(it.next(), Some(&2));
	assert_eq!(it.next(), Some(&3));
	assert_eq!(it.next(), None);
}
```

代码剖析：

1. 通过 `iter()` 得到 iterator
2. 通过 `next()` 得到第一个遍历的 item
3. 由于 `next()` 会改变 iterator ，因此需要对 `it` 使用 `mut` 修饰
4. 对于 `vec![1, 2, 3]` 来说，多次调用 `next()` 时，依次得到的 item 是 `Some(&1), Some(&2), Some(&3)` ，此时 item 已遍历完毕，因此下一次得到的是 `None`
5. 注意，如果继续调用 `next()` ，不管多少次，都是继续得到 `None`
6. 另外，得到的 item 是 `&i32` ，也可以得到 `&mut i32` ，或者 `move i32` ，后续再讲

## ***Consume*** 方法

说明：

- ***Consume*** 方法对 iterator 进行消费，也就是说，会不断的调用 `next()` ，直到得到结果 `None` ，即遍历结束
- `Iterator` 中很多 ***Consume*** 方法，例如 `sum()` 用来遍历并计算所有 item 的相加的总和；又如，`for` 只是遍历 item

### `for`

例如下面的代码，进行最简单的遍历：

```rust
let v = vec![1, 2, 3];

for i in v.iter() {
    println!("{}", i);
}
```

### `sum`

例如下面的代码，遍历每个 item 并相加得到总和：

```rust
let v = vec![1, 2, 3];
let total: i32 = v.iter().sum();

// 相加总和是6
assert_eq!(total, 6);
```

### `collect`

说明：

- 这也是一个消费方法，用来将遍历的 item 收集成为另一份序列化的数据
- 例如下面的例子，没有任何意义，因为它将一个 Vector 收集为原样的另一个 Vector
- 但是后面的讲解会使用到 `collect` ，我们需要理解它是一个消费方法

```rust
let v = vec![1, 2, 3];
let v1: Vec<_> = v.iter().collect();

// 打印 [1, 2, 3]
println!("{:?}", v1);
```

## ***Produce*** 方法

说明：

- ***Produce*** 方法也叫 ***iterator adaptor*** ，即迭代器的适配
- 因此，***Produce*** 方法不会对 iterator 进行遍历，也就是说，不会调用 `next()` ，而是通过对 iterator 的适配，拓展了 iterator 的功能，例如可以让我们查看、修改、过滤所遍历到的 item

### `map`

作用：

- 允许对 item 进行处理
- 这个处理通过 Closure 来完成
- Closure 返回一个新的 item

例如下面的例子：

- 会得到一个 warning ，因为没有消费 iterator
- warning 的原文是 `iterators are lazy and do nothing unless consumed`

```rust
let v = vec![1, 2, 3];
v.iter().map(|i| i+1);
```

因此需要消费 iterator ，例如调用 `collect` 来进行消费，得到另一份新的序列化数据：

```rust
let v1 = vec![1, 2, 3];
let v2: Vec<_> = v1.iter().map(|i| i+1).collect();

// 打印结果是 [2, 3, 4]
println!("{:?}", v2);
```

### `filter`

作用：

- 允许对 item 进行过滤
- 过滤操作通过 Closure 来完成
- Closure 返回 true ，则 item 被收集，否则被过滤

例如：

```rust
let v1 = vec![1, 2, 3, 4, 5];
let v2: Vec<_> = v1.iter()
	// 注意需要 **i 来解引用，因为参数是 &&i32
	.filter(|i| **i % 2 != 0)
	.collect();

// 打印结果是 [1, 3, 5]
println!("{:?}", v2);
```

### Closure 闭包

由于 iterator 的方法可能提供 Closure ，而 Closure 具备闭包特性，因此访问上下文环境，例如下面的例子：

```rust
fn main() {
	let para = 10;
	let v1 = vec![10, 5, 10, 6, 10];
	let v2: Vec<_> = v1.iter()
    	// 访问了上下文环境即para
		.filter(|i| **i == para)
		.collect();

    // 打印结果是 [10, 10, 10]
	println!("{:?}", v2);
}
```

## `Iteraotr` & Ownship

使用 iterator 的时候，需要关注所有权，包括：

- iterator 本身的所有权
- iterator 遍历得到的 item 的所有权

### 关于 `Iterator`

`Iterator` 在执行某些操作之后，所有权即被 move ，之后不能再被使用，包括但不限于：

- `for`

- `sum`

- `map`

- `filter`

- `collect`

> 例如 `for` 循环之后，`it` 不再可用

```rust
let v = vec![1, 2, 3];
let it = v.iter();

// it此时被move
for i in it {
    println!("{}", i);
}

// 编译器报错，it已不可用
println!("{:?}", it);
```

进一步剖析：

- 前面讲过，`Iterator` 最重要的方法是 `next()` ，它会改变 iterator 自身，因此对应的变量需要 `mut` 修饰
- 但是从上面的例子来看，`it` 并没有 `mut` 修饰
- 这是因为 `it` 已经被 move 到 `for` 循环中，然后在 `for` 内部使用了 `mut` 变量来接收 `it`

> 又如 `sum` 方法，`it` 也会 move

```rust
let v = vec![1, 2, 3];
let it = v.iter();

// it 此时被move
let sum: i32 = it.sum();

// 编译器报错，it已不可用
println!("{:?}", it);
```

> 下面的例子看到，`map` 、`collect` 也会导致 move

```rust
let v1 = vec![1, 2, 3];

// 创建it1
let it1 = v1.iter();
// it1被move
let it2 = it1.map(|z| z+1);
// ite2被move
let v2: Vec<_> = it2.collect();

// 编译器报错，it1和it2已不可用
println!("{:?}", it1);
println!("{:?}", it2);
```

代码剖析：

1. 从上面的例子看到，`map` 是一种 ***Produce*** 方法，它并不会消费 iterator ，只是产生了另一个 iterator
2. 同时，也可以看到，`collect` 是一种 ***Consume*** 方法，它消费 iterator
3. 另外，不管 ***Produce*** 方法还是 ***Consume*** 方法，它们所操作的 iterator 都被 move

### 关于 item

item 会被遍历，因此遍历得到的 item 也存在所有权问题，一般有如下几种方式得到 item ，对应了 item 不同的所有权：

- `iter` ，得到的是 `&Item`
- `into_iter` ，得到的是被 move 的 `Item`
- `iter_mut` ，得到的是 `&mut Item`

> 下面通过例子来剖析这几种方法的区别及使用场景

由于 `iter` 得到的是 `&Item` ，因此在某些场景下会非常不方便，看下面的例子：

```rust
fn use_closure(v: Vec<i32>, p: i32) -> Vec<i32> {
	v.iter()
		.filter(|i| **i % p != 0)
		.collect()
}
```

代码剖析：

- 上述代码编译报错，错误提示 `Vec<i32> cannot be built from Iterator<Item=&i32>`
- 也就是说，`collect()` 收集得到的 item 是 `&i32` ，而 `use_cosure` 方法的返回值类型是 `Vec<i32>`
- 而这是因为 `iter()` 得到是 `&32` ，对应的 `filter` 过滤之后得到的 item 也是 `&i32`
- 顺便再说一下 `filter` 方法：因为该方法的作用只是判断每个 item 是否需要被过滤，并不需要对 item 进行修改，也不需要获得 item 的所有权，因此对于 `v.iter()` 得到的 item ，是通过 `&` 的方式传递给 Closure
- 也就是说，`v.iter()` 得到 `&i32` ，接着 `filter` 的参数是 `&&i32`
- 因此，在上面的例子里，`filter` 的 Closure 参数 `i` 需要进行两次解引用，即 `**i`

要解决上述问题，最简单的办法是使用 `into_iter()` ：

```rust
fn use_closure(v: Vec<i32>, p: i32) -> Vec<i32> {
	v.into_iter()
		.filter(|i| *i % p != 0)
		.collect()
}
```

代码剖析：

- `into_iter()` 得到的是 move 后的 `i32` 
- 接着， `filter` 以 `&32` 形式传递给 Closure
- 因此 Closure 中只需要进行一次解引用，即 `*i`
- 经过 `filter` 过滤之后，得到的 item 依然是 `i32` 类型，因此可以被 `Vec<i32>` 收集
- 另外，其实 Closure 中也可以直接写为 `i % p != 0` ，也就是说，编译器对于 `%` 运算，会自动进行解引用，而代码中之所以仍然写为 `*i` ，目的只是为了说明 `filter` 方法给 Closure 传递的参数类型

如果我们坚持使用 `iter()` ，则可以尝试一下，代码会变得复杂而有趣：

```rust
fn use_closure<'a>(v: Vec<i32>, p: i32) -> Vec<&'a i32> {
	v.iter()
		.filter(|i| **i % p != 0)
		.collect()
}
```

代码剖析：

- 首先，根据前面的讲解，`collect` 所收集的 item 是 `&32` ，所以需要将 `use_closure` 方法的返回值类型更改为 `Vec<&i32>`
- 但此时仍然编译报错，因为返回的是引用，需要进行 lifetime 标注，所以，返回值增加了 `'a` 来标注 lifetime
- 此时再编译，仍然报错，错误提示是 `returns a value referencing data owned by the current function`
- 也就是说，参数 `v` 是被 move 到 `use_closure` 中的，在 `use_closure` 执行完毕后，`v` 就自动被销毁，而返回值却引用了 `v` 中的数据，这是不被允许的

所以，要解决该问题，只能将 `v` 作为引用传入，并为 `v` 标注 lifetime ，从而完美接解决问题：

```rust
fn use_closure<'a>(v: &'a Vec<i32>, p: i32) -> Vec<&'a i32> {
	v.iter()
		.filter(|i| **i % p != 0)
		.collect()
}
```

另外，注意 `into_iter()` 是将 item 的所有权进行了 move ，因此原数据已不再可用：

```rust
fn main() {
	let v1 = vec![1, 2, 3];
    // v1中的item都被move
	let v2: Vec<_> = v1.into_iter()
		.filter(|i| *i > 0)
		.collect();

    // 错误，v1已不可用
	println!("{:?}", v1);
    // 正确，v2可用
	println!("{:?}", v2);
}
```

再看一个例子，`into_iter()` 之后传递给 `for` 循环：

```rust
fn main() {
	let v = vec![1, 2, 3];
    // v中的item都被move
	let it = v.into_iter();
    // it被move到for
	for i in it {
		println!("{:?}", i);
	}

    // 错误，v已不可用
	println!("{:?}", v);
    // 错误，v1已不可用
	println!("{:?}", it);
}
```

代码剖析：

- 需要注意一点，代码中使用了 `Vec<i32>` 来做例子
- 我们知道 `i32` 的 move 本质上是拷贝，因此从内存的角度来看，其实 `v` 中的 item 是应该可用的
- 但对于 Rust 编译器来说，既然 `v` 中的 item 所有权已被 `into_iter()` 进行了 move，则 `v` 就不再可用
- 也就是说，Rust 关注的是所有权是否被 move ，而不会区别对待 `i32` 这种简单类型的 move 本质

最后看看 `iter_mut` ，用下面的例子，结合 `map` 方法，实现对原数据的更改，同时产生新数据：

```rust
fn main() {
    // 因为要使用iter_mut
    // 所以需对v1使用mut修饰
	let mut v1 = vec![1, 2, 3];
    // 打印结果是 [1, 2, 3]
	println!("{:?}", v1);

    // 遍历到的item是 &mut i32
	let v2: Vec<_> = v1.iter_mut()
    	// 首先对原数据进行加1操作
    	// 然后再次加1得到新数据
		.map(|i| { *i += 1; *i + 1 })
		.collect();

    // 打印结果是 [2, 3, 4]
	println!("{:?}", v1);
    // 打印结果是 [3, 4, 5]
	println!("{:?}", v2);
}
```

### 关于解引用

从上面的例子里，可以看到引用和解引用挺繁琐的，而且有时候可以由编译器自动解引用，有时候需要手动显式的解引用，下面还是需要简单总结一下：

1. 以 `Vec<i32>` 为例，看看 `filter` 和 `map` 对应的参数
2. `iter()` 得到 `&i32` ，`iter().filter()` 传入 `&&i32` ，`iter().map()` 传入 `&32`
3. `iter_mut()` 得到 `&mut i32` ，`iter().filter()` 传入 `& &mut i32` ，`iter().map()` 传入 `&mut 32`
4. `into_iter()` 得到 `i32` ，`iter().filter()` 传入 `&i32` ，`iter().map()` 传入 `i32`

解引用规则：

- 如果进行 `+,-,%` 等操作，则 `&i32` 会被自动解引用
- 如果进行 `==,>,<` 等比较操作，则 `&i32` 需要显式的解引用
- 上述操作对于 `&&i32 , &mut 32 , & &mut i32 ` 都不会自动解引用，需要手动显式进行

## 实现 `Iterator`

前面的内容里，讲的都是 Rust 标准库中 iterator 的使用，包括：

- 使用标准库中的 Collection ，例如 `Vec`

- 调用标准库中 Collection 提供的 `iter, iter_mut, into_iter` 方法来得到 `Iterator`

- 使用 `Iterator` 中的方法

- 而我们也可以为自己的数据类型实现 `Iterator`

### 准备

首先创建自己的数据类型：

```rust
struct Counter {
	count: i32,
}

impl Counter {
	fn new() -> Counter {
		Counter { count: 0 }
	}
}
```

代码说明：

- 结构体 `Counter` 有 `new` 方法，用来创建新的实例
- 新实例的 `count` 计数从 0 开始

### 实现 `next`

要实现 `Iterator` ，唯一实现的方法是 `next` ：

```rust
impl Iterator for Counter {
    // 为Item赋值，即数据类型
	type Item = i32;

    // 参数需使用 &mut 修饰
    // 返回值固定为 Option<Self::Item>
	fn next(&mut self) -> Option<Self::Item> {
		self.count += 1;

        // 通过None表示遍历完毕
		if self.count <= 5 {
			Some(self.count)
		} else {
			None
		}
	}
}
```

代码说明：

- 首先需要为 `Item` 赋值，其中，变量名称是 `Item` ，变量类型是 `type` ，变量值是 `i32`
- 然后实现 `next` ，参数需使用 `&mut` 修饰，因为该方法需要改变数据内容
- 返回值固定为 `Option<Self::Item>` ，其实本质就是 `Option<i32>` ，但写为 `Self::Item` 的好处是，我们只用关注 `type Item` 的值即可，不用对代码进行多处修改
- 也就是说，如果我们直接将返回值写为 `Option<i32>` ，程序也是正确的
- 根据上面的代码，可以看到该 iterator 一共可以循环 5 次，循环到的值分别是 `1, 2, 3, 4, 5`

### 使用 `Iterator`

#### 使用 `next`

现在 `Iterator` 已实现完毕，已可以使用 `Iterator` 中的方法，先看最简单的例子：

```rust
fn main() {
	let mut counter = Counter::new();

    // 一共6次调用
	println!("{:?}", counter.next());
	println!("{:?}", counter.next());
	println!("{:?}", counter.next());
	println!("{:?}", counter.next());
	println!("{:?}", counter.next());
	println!("{:?}", counter.next());
}
```

则打印结果是：

```text
$ cargo run

Some(1)
Some(2)
Some(3)
Some(4)
Some(5)
None
```

#### 遍历 `Iterator`

既然是 `Iterator` ，则可以使用前面讲到过的各种遍历方法，例如 `for` ：

```rust
let counter = Counter::new();

for i in counter {
    println!("{:?}", i);
}
```

则打印结果是：

```text
$ cargo run

1
2
3
4
5
```

又如 `map` 方法：

```rust
let counter = Counter::new();
let v:Vec<i32> = counter
    .map(|i| i + 1)
    .collect();

println!("{:?}", v);
```

打印结果是：

```text
$ cargo run

[2, 3, 4, 5, 6]
```

#### 使用其它方法

可以对 `Counter` 使用其它 `Iterator` 的方法，例如：

```rust
fn main() {
	let v:Vec<_> = Counter::new()
		.zip(Counter::new().skip(1))
		.map(|(a, b)| a * b)
		.filter(|x| x % 3 == 0)
		.collect();
	println!("{:?}", v);
}
```

代码剖析：

- `Counter::new()` 得到 iterator ，其遍历的值是 `1, 2, 3, 4, 5`
- `zip` 方法将两份序列化的数据进行组合
- `zip` 的参数是另一个 iterator ，其遍历的值是 `2, 3, 4, 5` ，因为使用了 `skip(1)` ，也就是从第二个 item 开始
- 因此 `zip` 得到的结果是新的序列化数据，其中的每个 item 是一个 tuple ，也就是 `(1,2), (2,3), (3,4), (4,5)` ，由于合并的两份数据中 item 个数分别是 5个 和 4个，因此合并结果是 4个
- 接着使用 `map` ，对应的 Closure 参数就是 tuple ，即 `(a, b)` ，而 `map` 得到的新 item 类型是 `i32` ，值是 `a*b` ，也就是 `2, 6, 12, 20`
- 再通过 `filter` 筛选，得到的结果是 `6, 12`

### 总结

上面的例子展示了如何为自己的数据类型实现 `Iterator` 并使用 `Iterator` 中的方法，从这些例子里可以做出新的总结：

1. `next` 是最基础的方法，因此其功能和所得到的结果也是最原始的，比如，遍历到的 item 是 `Some(Item)` 类型，如果遍历结束，则得到 `None` ；遍历结束后再接着遍历，仍然得到 `None` ；并且，需要根据返回值来自行判断遍历是否结束
2. 在 `next` 基础上实现的其它 `Iterator` 方法就比较智能，例如 `for , map` 等方法：第一，会自行判断遍历是否结束；第二，只需要我们处理遍历到的 item，而不需要处理 `None` ；第三，对于遍历到的 item ，会自动进行解构，直接给我们 `Item` ，而不是 `Some(Item)`
3. 可以看到，`next` 方法决定了 item 的类型，即 `Item` ，该类型与实现 `Iterator` Trait 的数据类型可能是不一样的，例如，`Counter` 的类型是 struct ，而为其实现的 `Iterator` 是得到 `i32` 类型
4. 对于 `Iterator` 的 ***Produce*** 方法，可能产生新的 iterator ，例如 `map` ，参数类型遵从上一个 iterator ，例如 tuple `(i32, i32)` ，但所产生的新 item 类型取决于 Closure ，例如 `i32`
5. 而对于 `Iterator` 的 ***Cosume*** 方法，则只负责收集，因此不会改变所收集的 item 数据类型
6. 对于自行实现的 `Iterator` ，仍然遵循前面内容讲到的所有权机制，因此，对于例子中的 `Counter` 实例，由于所实现的 `Iterator` 基于该实例本身，所以可能因为调用过 `Iterator` 中的某些方法而导致该实例被 move

> 例如，使用 `for` 循环之后，`Counter` 实例已不可用

```rust
let counter = Counter::new();

// counter已被move给for
for i in counter {
	println!("{:?}", i);
}

// 编译器报错，counter已不可用
println!("{:?}", counter);
```

> 又如，`zip` 方法的使用，也导致 `Counter` 实例不再可用

```rust
let counter = Counter::new();

// counter已被move给zip方法
let v:Vec<_> = counter
    .zip(Counter::new().skip(1))
    .map(|(a, b)| a * b)
    .filter(|x| x % 3 == 0)
    .collect();
println!("{:?}", v);

// 编译器报错，counter已不可用
println!("{:?}", counter);
```

