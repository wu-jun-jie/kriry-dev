# 匿名函数 Closure

## 术语

### *Functional Programming*

- 即函数式编程
- 函数可以被当作一种值，从而可以赋值给变量，或作为函数的返回值
- 包括 Cosure ，Iterator 等

### *Closure*

- 即匿名函数
- 可以将其存储在变量中，或者作为参数传递给另一个函数
- 与函数不同的是，Closure 是闭包的，也就是说它记录了被创建时的上下文环境
- 因此，可以在一个位置创建 Closure ，然后在另一个上下文环境中使用它

## 问题的提出

### 场景描述

> 为了讲解 Closure ，原文 The Book 绞尽脑汁举了个例子，关于健身计划的，代码非常蹩脚，而且实际上原文中提到的问题是可以有其它解决办法的，只是不像 Closure 那么简洁。所以本书中我们不用在意实际的场景是不是健身计划，直接用代码来描述即可。

首先，有个运算函数比较耗时，这个耗时过程用 `sleep` 来模拟：

```rust
// 使用线程
use std::thread;
// 时间操作
use std::time::Duration;

fn expensive(v: u32) -> u32 {
    // sleep 2秒之后返回
    thread::sleep(Duration::from_secs(2));
    v
}
```

然后，开始蹩脚的代码，简单来说，就是根据输入参数，会调用零次、一次、多次 `expensive` ：

```rust
fn ugly(v: u32, r: u32) {
	if v >= 100 {	
        // 调用了两次
        println!("A.1 {}", expensive(v));
		println!("A.2 {}", expensive(v));
	} else {
		if r > 0 {
            // 调用了一次
            println!("B.1 {}", expensive(v));
		} else {
            // 调用了零次
			println!("B.0");
		}
	}
}
```

### 问题改进

我们打算改进代码，希望只调用一次，所以先调用函数得到结果，再根据条件判断，直接访问结果值：

```rust
fn ugly(v: u32, r: u32) {
    // 先调用函数得到结果
	let ret = expensive(v);
    
	if v >= 100 {
        // 两次访问结果
		println!("A.1 {}", ret);
		println!("A.2 {}", ret);
	} else {
		if r > 0 {
            // 一次访问结果
			println!("B.1 {}", ret);
		} else {
            // 零次访问结果
			println!("B.0");
		}
	}
}
```

### 余留问题

上面的改进方式仍然存在如下问题：

1. 虽然避免了多次调用函数，但函数仍然总是被调用了一次
2. 函数总是先执行函数并等待结果，即使某些情况下并不需要调用函数，例如 `B.0`
3. 函数和函数执行结果是两份关联的信息，但此时这两份信息是分离的
4. 为了存储函数执行结果，增加了局部变量，且这个局部变量所存储的信息与函数本身是分离的

### 解决目标

我们希望这个例子用下面的方式来解决，且 Closure 可以解决：

- 函数只被调用一次
- 需要结果时才调用函数
- 即使多个地方需要结果，也只调用一次函数
- 如果某些地方不需要结果，则不会调用函数

## Closure 语法

### 举例

先看个例子，将上面的 `expensive` 函数改为 Closure 的语法：

```rust
let ret_closure = |vc| {
    thread::sleep(Duration::from_secs(2));
    vc
};
```

需要注意的是：

- 此时 `ret_closure` 保存的并不是函数的执行结果，而是函数本身
- 定义 Closure 的时候，只是定义了函数本身，函数并没有被执行

### 语法规则

语法如下：

```rust
let var = |p1, p2| { /*code*/ };
```

语法说明：

- 函数用 `(p1, p2)` 来表示参数，但 Closure 用 `|p1, p2|` 
- Rust 认为采用 `|` 来囊括参数的原因是该语法与 Smalltalk 和 Ruby 很像，但我并不了解这两门语言
- Closure 的代码块用 `{}` ，与函数是一致的
- Closure 本身是一种数据，可以赋值给变量，因此末尾的 `;` 并不是 Closure 语法的一部分，而是 `let` 语句的结束
- 如果 Closure 只有一句代码，则 `{}` 可以省略

### 参数和返回值的类型

从语法中可以看到：

- Closure 并不需要类似函数的 `-> type` 来说明返回值的类型
- 而且 `|p1, p2|` 里面的参数也不需要说明类型

这就是 Cosure 与 函数的一些不同：

- 函数需要明确的定义函数名称、参数和返回值类型，因为函数需要提供给外部使用
- 但 Closure 不需要像函数这么严格，因为 Closure 是一种数据，可以存放于变量中
- 因此 Closure 不需要函数名称，不需要提供给外部使用，而且，参数和返回值类型都可以省略，这样可以让 Closure看起来简洁一些
- 另外，Closure 一般在代码内部被定义和使用，所以编译器能够自动推断出参数和返回值类型

### 语法举例

下面是几种 Closure 的定义方式，可以看到有简单的写法，也有复杂的写法：

> 注意，为了对比几种写法的区别，因此故意使用了空格来进行对齐

```rust
// 函数的定义方式
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
// Closure - 最全面的定义方式
let add_one_v2 = |x: u32| -> u32 { x + 1 };
// Closure - 省略返回值类型
let add_one_v3 = |x|             { x + 1 };
// Closure - 省略代码块的 {}
let add_one_v4 = |x|               x + 1  ;
```

### 参数类型推断

假设有下面这个 Closure ：

> 注意，这样的 Closure 是没有任何意义的，因为它的作用就是用来演示，因此变量名故意叫做 `worthless`

```rust
let worthless = |x| x;
```

那么，此时 `x` 的类型是未知的，编译器会根据第一次对该 Closure 的调用来决定参数类型：

```rust
// 此时参数x的类型被确定为i32
let i1 = worthless(1);
```

然后再进行一次调用，编译器报错：

```rust
// 编译器错误提示"参数类型不匹配"
let s1 = worthless("abc");
```

## Closure 类型

### 关于 Closure 的类型

每个 Closure 本身的类型是唯一的：

- 前面讲过，Closure 本质是一种数据，而既然是数据，就会有类型
- 因此，每个 Closure 都有唯一的匿名的类型，这个唯一性是编译器自行完成的
- 即使两个 Closure 的 Signature (参数个数、参数类型、返回值类型等) 完全一样，它们的类型也是不一样的

为何 Closure 的类型具有唯一性：

- 这是我自己的理解，我认为有几方面原因
- 第一，Closure 也有 Signature ，不同的 Closure 的 Signature 可能不同，这与函数是一致的
- 第二，Closure 是匿名的，没有函数名，所以 Rust 需要理解为每个 Closure 的函数名都是不同的
- 第三，Closure 涉及到闭包，也就是对当前上下文环境的访问，这个后续会讲。因此，一方面，每个 Closure 的上下文环境可能是不一样的；一方面，每个 Closure 对上下文环境的访问也是不同的，可能只是读取上下文数据，也可能会修改上下文数据；总之，Closure 闭包的不同，导致了每个 Closure 的不同
- 在前面的例子里，Closure 都是被直接赋值给变量，所以我们不需要关注也可以忽略 Closure 本身的类型
- 但是，如果要将 Closure 作为函数的参数、函数的返回值、struct 的 field，就需要说明类型，因此，在这些场景下，如何标注 Closure 的类型就成为一个问题

### 表达 Closure 的类型

根据前面对 Closure 类型唯一性的讲解，如果要表达 Closure 的类型，需要考虑三方面问题

1. Signature，即参数和返回值
2. Closure 的匿名性，也就是没有函数名
3. Closure 的闭包特性

因此，Rust 用下面的方式来解决这些问题：

1. Signature 比较简单，与函数一致，用 `()` 来表示参数，用 `-> type` 来表示返回值
2. Closure 的匿名性，这个不好表达，先放一下
3. Closure 的闭包特性，Rust 归为三类，分别是 `Fn / FnMut / FnOnce` ，具体差异后续会讲

进一步，Rust 的思考方式是：

- 除了 Signature 可以明确表达，另外的匿名性和闭包特性都无法表达为确切的类型，而只能理解为一种特性
- 也就是说，Closure 具备某些特性，包括匿名、闭包，而这些特性可以用 Trait 来表达
- 所以，`Fn / FnMut / FnOnce` 是三种针对 Closure 的 Trait
- 因此，如果要表达 Closure 的类型，需要使用 Generic 和 Trait

此处先暂时只使用 `Fn` ，我们可以顺其自然的表达出 Closure 的类型：

```rust
Fn(type1, type2) ->type
```

用 struct 举例如下：

```rust
struct SthStruct<T>
	where T: Fn(u32) -> u32
{
	sth_closure: T
}
```

## 问题的解决

先回顾一下前面期望的问题解决目标：

- 函数只被调用一次
- 需要结果时才调用函数
- 即使多个地方需要结果，也只调用一次函数
- 如果某些地方不需要结果，则不会调用函数

### 解决方式

> 首先定义 struct ，存储 Closure 和计算结果。需要注意 val 的类型是 `Option` ，因为在没有计算之前，val 的值是 `None`

```rust
struct Cacher<T>
	where T: Fn(u32) -> u32
{
	cal: T,
	val: Option<u32>,
}
```

> 然后为该 struct 实现一些方法，注意 `impl` 写法如下

```rust
impl<T> Cacher<T>
	where T: Fn(u32) -> u32
{
}
```

> 在  `impl` 中实现 `new` 方法，用来创建该 struct 的实例

```rust
fn new(cal: T)-> Cacher<T> {
    Cacher {
        cal,
        val: None,
    }
}
```

> 然后实现取值方法，思路是：如果 `val` 不是 `None` ，则直接返回；否则调用 `cal` 来计算结果

```rust
fn value(&mut self, arg: u32) -> u32 {
    if let None = self.val {
        self.val = Some((self.cal)(arg));
    }
    self.val.unwrap()
}
```

注意：

- 调用 Closure 的方式是 `closure(arg)`
- 但是上面的代码里 Closure 是 `Self.cal` ，按照 C/C++ 的运算符结合特性，是可以写为 `self.cal(arg)` 的，因为 `.` 和 `()` 涉及的操作是从左到右结合，但 Rust 里必须写为 `(self.cal)(arg)` ，==也许是 Rust 里的运算符结合特性不同吧，暂时没有深究==

> 最后，可以对前面的 `ugly` 函数改进如下

```rust
fn ugly(v: u32, r: u32) {
    // 创建Cacher实例，参数是一个Closure
	let mut cacher = Cacher::new(|vc| {
		thread::sleep(Duration::from_secs(2));
		vc
	});

	if v >= 100 {
        // 调用了一次Closure
		println!("A.1 {}", cacher.value(v));
        // 不再调用，直接获取结果
		println!("A.2 {}", cacher.value(v));
	} else {
		if r > 0 {
            // 不再调用，直接获取结果
			println!("B.1 {}", cacher.value(v));
		} else {
			println!("B.0");
		}
	}
}
```

### 剩余问题

上面的 `Cacher` 存在一些小问题：

- 一旦 `Cacher` 实例执行过一次计算以后，就不会再执行第二次计算
- 即使每次传入的 `arg` 值不同

例如下面的例子：

```rust
fn limitation() {
	let mut c = Cacher::new(|a| a);

    // 调用了一次Closure
    // val已经被存储，值是1
	let v1 = c.value(1);
    // 此时不再调用Closure
    // 直接返回实例c中的val
	let v2 = c.value(2);

    // v2得到的结果仍然是1
	assert_eq!(v2, 2);
}
```

解决办法：

- 可以为不同的 `arg` 创建不同的 `Cacher` 实例
- 另外的办法是，`Cacher` 内的 `val` 使用 `HashMap` ，其中，key 是 `arg` ，value 是 `closure(arg)` 的结果

## Closure 闭包

### 闭包特性

Closure 有一个函数不具备的功能，即闭包特性，也就是说，Closure 可以访问当前 Scope 的变量。看下面的例子：

```rust
fn main() {
    let x = 4;
    // 在Closure中访问了变量x
    let equalx = |z| z == x;

    // 相当于参数8与变量x比较
    assert!(equalx(8));
}
```

但是函数不允许这种闭包特性：

```rust
fn main() {
    let x = 4;
    // 编译器错误提示，函数不允许闭包
    fn fequalx(z: i32) -> bool { z == x }
}
```

关于闭包的内存：

- 闭包可以访问当前上下文的数据，而为了访问这些数据，可能产生内存的消耗
- 例如数据的拷贝，数据的引用，所有权的转移等
- 这些内存的消耗是 Rust 自动完成的，但程序员仍然需要知道这个事实
- 函数不允许闭包，因此不会产生这些间接的内存消耗

根据闭包对上下文数据的访问方式，一共有三种 Trait ，且编译器能够自动推断出属于哪一种 Trait ：

- `Fn` ，只读取数据，本质是对数据的 `&`
- `FnMut` ，修改数据内容，本质是对数据的 `&mut`
- `FnOnce` ，对数据 Move 操作，The Book 说每个 Closure 都实现了 `FnOnce` 这个 Trait ，因为每个 Closure 都可以被调用至少一次，即 Once ，==但恕我理解不了，也不知道至少被调用 Once 的意义是什么，在我看来，`Fn` 的频率更高==

### `Fn`

要注意的是：

1. 只对上下文数据进行读取操作
2. 因此如果编译器看到 Closure 对上下文数据只有读取行为，就推断为 `Fn`
3. 因此容易忽略的点是，在 Closure 访问上下文数据时，本质是一种 Borrow ，即使是 `i32` 数据

> 先看最简单的例子

```rust
fn main() {
    let x = 4;
    // 此时Closure中其实是&x
    // 只是编译器自动解引用了
    let equalx = |z| z == x;

    assert!(equalx(8));
}
```

> 为了证明上面的 Closure 其实是 &x ，可以做出如下修改

```rust
fn main() {
    let mut x = 4;
    // 此时产生了&x
    let equalx = |z| z == x;

    // 此时不允许x自身修改
    x = 5;

    assert!(equalx(8));
}
```

错误剖析：

- 编译器错误提示：在 Borrow 期间，不允许被引用的数据内容修改
- 具体可以参考对所有权的讲解章节
- 因此这个例子很清楚的看到，Closure 中使用的是 `&x`

> 再看一个例子，不使用 i32 这种简单类型，使用 Vector

```rust
fn main() {
    let x = vec![1, 2, 3];
    // 此时使用的是 &x
    let equalx = |z| z == x;

    assert!(equalx(vec![4, 5, 6]));

    // x仍然能够被访问
    println!("{:?}", x);
}
```

### `FnMut`

先说规则：

- 如果对上下文数据产生了修改，则是 `FnMut`
- 如果 Closure 是 `FnMut` ，则存储 Closure 的变量也必须是 `mut` 修饰
- 如果 Closure 是 `FnMut` ，则只能使用 `mut` 变量来存储，但是 `mut` 变量可以存储 `Fn` 这种 Closure ，虽然这没有什么意义
- 用 `mut` 变量来存储 `FnMut` ，只是表达了 `FnMut` 这个特性，而不是变量本身的值可以被修改
- 只要有任何对上下文数据的修改行为，则必须是 `FnMut` ，即使对其它的数据只进行读取

> 先看一个简单例子，说明 `FnMut` 本质是 `&mut`

```rust
fn main() {
    let mut x = 4;
	// 此时产生了 &mut x
    let mut equalx = |z| { x += 1; z == x };

    // 此时不允许x自身修改
    x = 6;

    assert!(equalx(5));
}
```

> 如果不对变量增加 `mut` 修饰，则编译器报错

```rust
fn main() {
    let mut x = 4;
	// 移除了 mut 修饰
    // 编译器错误提示：mut Closure 才能使用 &mut x
    let equalx = |z| { x += 1; z == x };

    assert!(equalx(5));
}
```

> 可以使用 `mut` 变量来存储 `Fn` ，虽然这没有任何意义，编译器也会给出 warnning

```rust
fn main() {
    let x = 4;
    // 此时使用 mut 修饰是没有意义的
    let mut equalx = |z| z == x;

    assert!(equalx(5));
}
```

> 存储 `FnMut` 的变量虽然是 `mut` 修饰，但不代表该变量本身可以被改变

```rust
fn main() {
    let x = 4;
    // 此时equalx变量的类型已经确定
    let mut equalx = |z| z == x;
    assert!(equalx(5));

    // 编译器错误提示：Closure类型不同
    equalx = |z| z == x;
}
```

错误剖析：

- 在对 `equalx` 重新赋值时，编译器的错误提示原文是 `expected closure, found a different closure`
- 由此可见，我们也可以理解为，`equalx` 是 `mut` 变量，可以被重新赋值，但是此时赋值给 `equalx` 的数据类型不匹配，虽然两个 Closure 看着是一模一样的
- 这也再次印证了前面讲到的 Closure 类型，每个 Closure 都有唯一的匿名类型
- 因此，即使变量是 `mut` 修饰，即使变量可以被重新赋值，但我们已经无法找到第二个符合其 Closure 类型的数据了
- 所以，我们也可以直接理解为，存储 `FnMut` 的变量本身的值无法被改变，即使它是 `mut` 修饰

> 只要对任何上下文数据进行过修改，则必须是 `FnMut` ，即使对其它数据只是读取操作

```rust
fn main() {
    let mut x = 4;
    let y = 5;

    // 对x进行了修改，对y只是读取
    // 但仍然必须使用mut来修饰equaly
    // 否则编译器报错
    let mut equaly = |z| { x += 1; z == y };

    assert!(equaly(5));
}
```

### `FnOnce`

先说规则：

- 与 `Fn` 一样，使用变量存储 `FnOnce` 时，不需要对变量增加 `mut` 修饰，只有 `FnMut` 才需要对变量进行 `mut` 修饰
- 当然，即使要为变量增加 `mut` 修饰，编译器也只是给出 wanning ，因为这样做没有任何意义
- 编译器在推断闭包行为时，可能会有歧义，可以推断为 `Fn` ，也可以推断为 `FnOnce` ，此时编译器就会使用 `Fn` ，而不是 `FnOnce`
- 因此，可以使用 `move` 来修饰 Closure ，强制要求编译器将 Closure 推断为 `FnOnce`
- 但要注意的是，Move 行为对于简单类型来说，其实是 Copy ，对于对象来说，才是 Move ，才涉及到所有权的转变，参考讲解所有权的章节
- 因此，有时候对于简单类型例如 i32 来说，强制使用 `move` 可以简化一些程序逻辑

> 先看一个 `FnOnce` 的例子

```rust
fn main() {
    let x = vec![1, 2, 3];
    let y = vec![4, 5, 6];

    // x被赋值给m，因此x的所有权被move给m
    // 在此Closure之后，x已不再可用
    // 因此sth_move的Trait是FnOnce
    let sth_move = |z| { let m = x; m == z };
    sth_move(y);

    // 此时访问x，编译器错误提示：
    // "x已被move，不可访问"
    println!("{:?}", x);
}
```

> 下面的例子，编译器推断为 `Fn` ，而不是 `FnOnce` ，注意看注释

```rust
fn main() {
	let mut x = 4;
    // 此时编译器推断为Fn
    // 而不是FnOnce
	let equalx = |z| z == x;

    // 因此编译器错误提示：
    // 被Borrow的数据不允许改变
	x = 5;

	equalx(5);
}
```

> 下面的例子使用的 Vector 类型，可以看到并没有被 Move

```rust
fn main() {
	let x = vec![1, 2, 3];
    // 此时使用的是 &x
	let equalx = |z| z == x;

	equalx(vec![4, 5, 6]);
    // 此时x仍然可以被访问
	println!("{:?}", x);
}
```

> 对于简单类型，强制要求编译器推断为 `FnOnce` ，而不是 `Fn` ，使用关键字 `move`

```rust
fn main() {
	let mut x = 4;
    // 此时x被Move
	let equalx = move |z| z == x;
    // 因此x是简单类型
    // 所以本质是拷贝了x
    // 因此x仍然可用
	x = 5;

    // 只有4才相等
	assert!(equalx(4));
}
```

代码剖析：

- 上述代码强制使用了 `move`
- 但是对于简单类型，例如例子中的 `x` 是 `i32` ，因此 `move` 的本质是拷贝了 `x`
- 所以，相当于 Closure 自己开辟了空间来存储 `i32` 数据
- 因此，此时 Closure 所存储的 `x` 的值被固定了，也就是 4
- 所以，之后 `x` 仍然可用，也没被 Borrow ，可以修改 `x` 的值
- 但是，不管后续对 `x` 的值如何修改，Closure 中存储的值都是 4

> 现在再看 Vector ，强制要求编译器推断为 `FnOnce` ，而不是 `Fn` ，使用关键字 `move`

```rust
fn main() {

	let x = vec![1, 2, 3];
    // 此时x被强制move
	let equalx = move |z| z == x;

	equalx(vec![4, 5, 6]);
    // 编译器报错
    // 此时x已不可访问
	println!("{:?}", x);
}
```

## Closure 参数

何时需要显式标注 Closure 的参数：

- 虽然前面讲过，我们不需要显式的标注 Closure 的参数类型
- 但是在某些情况下，对 Closure 参数的标注是必须的，因为 Closure 也同样涉及到对实参所有权的影响
- 下面需要几个例子来展示一些需要标注 Closure 参数的情况，但这些例子是不全的，只是抛砖引玉
- 从下面的例子能够看到，编译器对 Closure 的实参，默认是按照 Move 的方式来传递的，如果我们的实参传递方式变化，例如 `&` 方式，则都需要我们显式的标注 Closure 的形参

> 下面的例子，看到作为参数传入的 Vector 被 Move 了

```rust
fn main() {
	let x = vec![1, 2, 3];
    let y = vec![4, 5, 6];

    // 首先是x被move
    let sth_move = |z| { let m = x; m == z };
    // 然后y的参数传递方式导致也被move
    sth_move(y);

    // 编译器报错，x不可访问
    println!("{:?}", x);
    // 编译器报错，y不可访问
    println!("{:?}", y);
}
```

> 因此，尝试更改参数传递方式为 `&`，并让编译器自动推断 Closure 的形参类型

```rust
fn main() {
	let x = vec![1, 2, 3];
    let y = vec![4, 5, 6];

    // x被move
    // y被传递的是引用
    // 因此此时需要对y手动解引用
    // 即 *z
    let sth_move = |z| { let m = x; m == *z };
    // 实参用引用方式传入
    // 并且期望编译器自动推断Closure的参数z类型
    // 但实际上编译器无法推断
    sth_move(&y);
}
```

错误剖析：

- 我们不希望 `y` 被 Move
- 因此传递实参时，使用了 `&y` 的方式
- 所以我们希望编译器自动推断 Closure 的形参 `z` 的类型为 `&Vec<i32>`
- 但编译器自动推断失败了，==其实我很费解为何此时编译器不能推断出来==
- 编译器的错误提示是：`consider giving this closure parameter a type, type must be known at this point` ，仿佛有一种编译器在求饶的既视感

> 因此，对于上面的例子，我们需要标注 Closure 的形参类型

```rust
fn main() {
	let x = vec![1, 2, 3];
    let y = vec![4, 5, 6];

    // 标注参数z的类型为&Vec<i32>
    let sth_move = |z: &Vec<i32>| { let m = x; m == *z };
    // 实参用引用方式传入
    sth_move(&y);
}
```

> 同样的，对于简单类型，如果使用 `&` 方式传递实参，编译器也要求我们显式标注 Closure 的参数类型

```rust
fn main() {
	let x = 4;
    let y = 5;

    // 此时需要显式标注参数z的类型为&i32
    // 否则编译报错
    let sth_move = |z: &i32| *z == x;
    // 实参用引用方式传入
    sth_move(&y);
}
```
