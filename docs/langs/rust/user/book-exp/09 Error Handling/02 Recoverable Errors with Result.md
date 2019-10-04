# 可恢复 Result

有些错误不需要 panic ，例如文件打开失败等，此时使用 ```Result``` 类型，原型如下：
```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

说明：
- 该类型与 ```Option``` 一样，是被默认引入 scope 的，因此不需要 ```Result::```
- ```Ok``` 表示成功，```T``` 是得到的结果
- ```Err``` 表示失败，```E``` 是错误类型

### 使用 ```Result```

确认返回类型是否为 ```Result``` ：
- 代码中指定变量的类型
- 编译器发现不匹配时，就会提示实际的类型

例如：
```rust
use std::fs::File;

fn main() {
    let f:u8 = File::open("hello.txt");
}
```

此时编译结果告知：
```text
note: expected type `u8`
    found type `std::result::Result<std::fs::File, std::io::Error>`
```

也就是说：
- ```File::open``` 的返回值是 ```Result```
- ```T``` 是 ```std::fs::File```
- ```E``` 是 ```std::io::Error```

从而可以改进如下：
```rust
use std::fs::File;

fn main() {
    match File::open("hello.txt") {
        Ok(file) => println!("success {:?}", file),
        Err(err) => println!("fail {:?}", err),
    }
}
```

那么可能会得到如下结果：
```text
fail Os { code: 2, kind: NotFound, message: "No such file or directory" }
```

### 处理不同的错误

改进上面的例子：
- 打开文件成功时，提示成功信息
- 打开文件失败时，查看失败原因
    - 如果是因为文件不存在，则尝试创建文件
        - 如果创建失败，则结束程序
        - 如果创建成功，则提示成功信息
    - 如果是其它原因，则结束程序

改进如下：
```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    match File::open("hello.txt") {
        Ok(_) => println!("open success"),
        Err(err) => match err.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(_) => println!("create success"),
                Err(e) => println!("create fail {:#?}", e),
            },
            other_err => println!("open fail {:#?}", other_err),
        },
    }
}
```

### 只获取成功结果

问题：
- 上面的例子虽然能够处理不同的错误，但是代码显得太过臃肿
- 而很多时候我们需要的是成功情况下的结果
- 类似之前接触过的 ```expect("")```，以及 ```HashMap.entry(K).or_insert(V)``` ，这些方法帮我们做了一部分判断
- 因此下面讲述 ```Result``` 帮我们包装好的一些自带判断逻辑的方法

#### ```unwrap```

说明：
1. 成功时，返回 ```T```
2. 失败时，panic ，并打印 ```Err```

举例：
```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").unwrap();
}
```

错误信息可能如下：
```text
panicked at 'called `Result::unwrap()` on an `Err` value:
Os { code: 2, kind: NotFound, message: "No such file or directory" }'
```

#### ```expect```

说明：
1. 该方法可以传入自定义的提示信息
2. 成功时，返回 ```T```
2. 失败时，panic ，先打印自定义的提示信息，再打印 ```Err```
3. 从而根据自定义提示信息，更容易追溯到我们代码对应的位置

举例：
```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").expect("failed to open file");
}
```

错误信息可能如下：
```text
panicked at 'failed to open file:
Os { code: 2, kind: NotFound, message: "No such file or directory" }'
```

#### ```unwrap_or_else```

说明：
1. 成功时，返回 ```T```
2. 失败时，我们自行处理
3. 该方法的细节在 Chapter13 讨论

举例：
```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let f = File::open("hello.txt").unwrap_or_else(|err| {
        if err.kind() == ErrorKind::NotFound {
            File::create("hello.txt").unwrap_or_else(|err| {
                panic!("create failed {:?}", err);
            })
        } else {
            panic!("open failed {:?}", err);
        }
    });
}
```

### Propagating Errors

说明：
- 对于封装为函数的功能，我们不一定在函数中对错误情况做出处理，例如，不一定 panic
- 此时可以继续利用 ```Result<T, E>``` 来包含成功和失败的可能结果

举例：
```rust
use std::io;
use std::io::Read;
use std::fs::File;

fn read_sth_from_file() -> Result<String, io::Error> {
    let mut f = match File::open("hello.txt") {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut s = String::new();
    match f.read_to_string(&mut s) {
        Ok(_) => Ok(s),
        Err(e) => Err(e),
    }
}
```

### Shortcut For Propagating Errors : ```?``` Operator

说明：
- 可以用 ```?``` 来简化对 ```Result``` 的处理
- 逻辑是：如果成功，则取出 ```T```，如果失败，则返回 ```E```

例子：
```rust
use std::io;
use std::io::Read;
use std::fs::File;

fn read_sth_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
```

可以串联使用 ```?``` ，例子简化：
```rust
use std::io;
use std::io::Read;
use std::fs::File;

fn read_sth_from_file() -> Result<String, io::Error> {
    let mut s = String::new();
    File::open("hello.txt")?.read_to_string(&mut s)?;
    Ok(s)
}
```

> 其实上述逻辑已经在标准库做了实现：
> - ```fs::read_to_string("hello.txt)```
> - 打开文件
> - 失败时尝试创建文件
> - 读取内容返回 ```Ok(String)```
> - 失败信息返回 ```Err(e)```

因此例子再简化如下：
```rust
use std::io;
use std::fs;

fn read_sth_from_file() -> Result<String, io::Error> {
    fs::read_to_string("hello.txt")
}
```

### ```?``` 的限制条件

限制如下：
1. 函数比如有类似 ```Result``` 的返回值
2. ```?``` 会将当前 ```Result``` 的 ```E``` 自动转换为返回值的 ```E```
3. 该转换通过自动调用 ```from``` 方法完成
4. ```from``` 方法在标准库中的 ```From``` trait 里定义
5. 通过 ```from``` ，才能将当前 ```Result``` 的 ```E``` 类型转换为方返回值对应的 ```E``` 类型
6. 可使用 ```Box<dyn Error>``` 来表示任意一种错误类型，详情在 Chapter17 讨论

例如，main 没有返回值时：
```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt")?;
}
```

得到的编译错误信息是：
```text
cannot use the `?` operator in a function that returns `()`
```

因此，可对 main 修改如下：
```rust
use std::error::Error;
use std::fs::File;

fn main() -> Result<(), Box<dyn Error>> {
    let f = File::open("hello.txt")?;
    
    Ok(())
}
```
