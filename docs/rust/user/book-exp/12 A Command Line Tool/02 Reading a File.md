# 读文件

文件读取方式：
- 使用标准库 ```use std::fs```
- 使用方法 ```fs::read_to_string(filename)``` ，自动打开文件，并通过 ```Result<String>``` 返回读取到的文件内容
- 例如，```fs::read_to_string("test.txt")``` 时，```test.txt``` 的路径如下图所示

##### 文件路径

```
graph TD

PROJ{minigrep} --> SRC{/src}
PROJ --> TGT{/target}
TGT --> DEBUG{/debug}
DEBUG --> EXE(minigrep)
PROJ --> TXT(test.txt)
```

> ```cargo run``` 运行的是 ```/target/debug/minigrep``` 这个 binary 文件，但打开文件时，是在项目的根目录下查找，即 ```/test.txt```

```test.txt``` 文件内容如下：
```text
first line
第二行
<end>
```

下面是代码：
```rust
use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();
    println!("{:?}", args);

    //文件名是 args[2]
    let contents = fs::read_to_string(&args[2]).expect("failed to read file");
    println!("{}", contents);
}
```

查看整个运行结果：
```text
$ cargo run sth test.txt

["target/debug/minigrep", "sth", "test.txt"]

first line
第二行
<end>
```
