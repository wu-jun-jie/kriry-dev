# 命令行参数

命令行参数的作用：
- 本章创建的 binary 项目叫 ```minigrep```
- 通过 ```cargo run``` 来运行时，可以设置两个参数：要查找的 string ，要查找的 filename
- 因此程序需要接收命令行参数
- 可以借助 crate.io 中已有的库来完成命令行参数的处理，但本章的目的是练习，因此需要我们自己来实现

命令行参数使用例子：
```text
$ cargo run stringxxx filexxx.txt
```

##### Reading the Argument Values

读取方式：
- 使用 rust 标准库的 ```std::env::args()``` 方法
- 该方法得到命令行参数的 ```iterator```
- 通过 ```collect()``` 方法来将 ```iterator``` 转换为 collection
- 通过声明接收变量的类型，例如 ```Vec<String>``` ，从而让 ```collect()``` 方法知道要转换为哪种 collection

关于 ```args()``` 方法：
- 最好不要 ```use std::env::args``` ，然后直接调用 ```args()```
- 而是 ```use std::env``` ，然后通过 ```env::args()``` 方式来调用，这样的话，如果当前 module 有同名 ```args``` 方法，也可以避免歧义
- ```std::env::args``` 只能处理 ==valid unicode== 参数，得到的结果是 ```String``` ，否则会 panic
- 如果要处理 ==invalid unicode== 参数，则需要使用 ```std::env::args_os``` ，得到结果就是 ```OsString```
- 本章使用 ```std::env::args```

命令行参数的内容：
- 第一个参数是当前程序的名称和路径，会被自动传入
- 后续就是 ```cargo run``` 所传入的参数，且顺序与 ```cargo run``` 传入时一致

> 使用 std::env::args 获取命令行参数

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    //使用 {:?} 来输出
    println!("{:?}", args);
}
```

> 使用 cargo run 运行，不传入参数，可以看到有一个命令行参数，就是当前程序

```text
$ cargo run

["target/debug/minigrep"]
```

> 使用 cargo run 运行，传入参数

```text
$ cargo run string1 file2

["target/debug/minigrep", "string1", "file2"]
```

> 可以传入更多的参数

```text
$ cargo run arg1 arg2 arg3 arg4

["target/debug/minigrep", "arg1", "arg2", "arg3", "arg4"]
```
