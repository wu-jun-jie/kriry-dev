# 前言

### 关于错误处理

Rust 可靠性的保证包含了错误处理。大多数情况下，Rust 会识别出可能的错误并停止编译，从而在程序被部署之前提前发现和解决错误。

很多语言不区分错误的类别，并使用 exception 机制，但Rust 没有exception ，而是把错误分为两类并有对应的处理方式：
1. recoverable，例如要访问的文件不存在，使用 ```Result<T, E>```
2. unrecoverable，例如越界访问某个数组的下标，使用 ```panic!```

### Unwinding and Aborting

当 ```panic!``` 发生的时候，rust 有两种机制来处理：
- Unwinding
- Aborting

##### Unwinding

1. 程序打印错误信息
2. 逐层回溯 stack
3. 清理各个函数的数据
4. 退出程序

##### Aborting

1. 程序打印错误信息
2. 直接退出程序
3. 清理内存的工作由操作系统来完成

##### Unwinding or Aborting

二者的区别：
- Unwinding 是比较耗费时间的
- rust 默认使用 Unwinding 机制
- 而使用 Aborting 机制时，编译出来的程序会小一些

使用 Aborting ：
> 在 Cargo.toml 中修改 ```[profile]```
```toml
[profile.release]
panic = 'abort'
```
