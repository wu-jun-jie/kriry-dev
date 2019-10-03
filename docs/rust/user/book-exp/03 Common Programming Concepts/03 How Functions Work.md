# 函数

先举一个函数的例子：
```rust
fn plus_one(x: i32) -> i32 {
    x + 1
}
```
后续分别讲解函数相关的各项内容：
1. 函数定义
2. 函数名称
2. 函数参数
3. 函数体
3. 函数返回值

## 函数定义

- 函数定义的关键字是 fn
- Rust并不关心函数在哪里定义，例如函数在调用者之前或之后定义都行，只要能被编译器识别即可
- main函数是大多数程序的入口

## 函数名称

- 对于函数名称，Rust的编码风格是snake case
- 即所有单词使用小写并通过下划线来分隔
- 例如plus_one

## 函数参数

- 函数定义时的参数叫形参parameter
- 函数调用时传入的参数叫实参argument
- 如果函数有参数，必须为每个参数都指定确切的数据类型，从而在使用函数的时候，编译器确切的知道要调用的函数是哪一个

## 函数体

函数体说明：
1. 函数体由一系列statement组成，并可能由expression结束，而这个结束的expression就是函数的返回值
2. Rust是基于expression的语言，这是Rust与其它语言的一个很重要的区别

statement和expression的说明：
- 它们都是一些语句
- statement执行一些动作但不会得到一个可返回的值
- expression会得到一个可返回的结果值
- statement是以分号结束的，但expression没有结尾的分号

下面的例子都是statement：
- let语句，例如 let x = 6;
- 函数的定义，即函数名，参数等

下面的例子都是expression：
 - 5+6
 - 调用一个方法，例如plus_one()
 - 调用一个宏，例如println!
 - 通过 {} 创建的新的Scope

statement和expression的关系：
1. expression可以是statement的一部分
2. 例如let x = 6; 是statement，但其中 6 是statement
3. 又如let x = 5+6; 是statement，但其中 5+6 是statement

举例：
```rust
let x = (let y = 6);
```
例子剖析：
- 该代码编译报错
- 因为 let y=6 是statement
- 而statement不会有可返回的值
- 所以没有可用的值来绑定给变量 x
- 但C语言是支持这样的语法的，例如x = y = 6;

举例：
```rust
let y = {
    let x = 3;
    x + 1
};
```
例子剖析：
- 该代码能够编译成功
- let y =xxxx；该语句需要有分号结尾，因为这是statement，所以该语句的 } 之后需要有分号
- 而y的赋值，也就是绑定到变量 y 的内容是expression，因此可以是5，或者5+6，或者通过 {} 得到的值
- 在该例子中，绑定到变量 y 的内容是通过 {} 来得到的
- 因此， {} 内 x+1 不能有分号结尾，否则就是statement，进而 {} 就无法得到可用的值来绑定给变量 y

## 函数返回值

返回值的说明：
1. 返回值不需要名称
2. 但需要明确返回值的类型
3. 语法是 fn test() -> DataType

Rust中返回值如何确定：
- 在Rust中，返回值等同于函数的最后一个expression的值
- ==可以在函数中提前通过return关键字来确定返回结果==
- 但大多数程序的函数都是隐式的返回最后一个expression

举例：
```rust
fn five() -> i32 {
    5
}
```
例子剖析：
- 该函数没有参数
- 但是有返回值，类型是 i32
- 该函数通过 expression 得到返回值，也就是 5，该语句不能用分号结尾

举例：
```rust
fn main() {
    let x = plus_one(5);
    println!("The value of x is: {}", x);
}
fn plus_one(x: i32) -> i32 {
    x + 1
}
```
例子剖析：
- 该函数有参数，也有返回值
- 该函数通过 expression 得到返回值，也就是 x+1，该语句不能用分号结尾
- 如果 x+1 语句加上分号，就是 statement，此时编译器报错，认为返回的是()，即一个空的tuple，而不是 i32 返回值
- 从这个例子中可知，如果一个函数没有返回值，则返回的就是 ()，即空的tuple，类似于C语言中的 void
