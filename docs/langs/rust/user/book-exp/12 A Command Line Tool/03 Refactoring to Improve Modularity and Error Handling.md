# 重构代码

当前该程序能够完成我们预期的功能，但是存在如下几方面问题：
1. ```main``` 函数中同时在处理多件事情：解析参数、文件读取等，随着函数功能的增加，```main``` 函数中的代码会变得庞大且不容易阅读和维护。因此，**需要按照功能来分解为多个函数，每个函数独立处理一件事情**
2. 函数中涉及到多个变量，例如命令行参数也就是配置数据 ```query``` 和 ```filename``` ，即 ```args[1]``` 和 ```args[2]``` ，同时，还有文件内容即 ```contents``` 这种变量，随着函数功能的增加，变量也会越来越多，且越来越不容易理解各个变量的用途。因此，**对于多个配置数据，需要封装在 ```struct``` 中，从而让这些数据的用途更清晰**
3. 读取文件内容时，使用了 ```expect``` ，所以在遇到错误时，打印出来的错误提示对用户来说没有任何意义。因此，**需要处理具体的错误类型**
4. 代码中多个地方可能发生错误，但是处理方式和提示信息凌乱。因此，**需要将错误处理集中在一个地方统一处理，从而，只需要在一个地方统一更改错误处理逻辑，且能够输出更人性化的错误提示信息**

### Binary Project 功能划分原则

大多数 Binary Project 都面临如何划分功能并提供给 ```main``` 函数使用的问题，因此，rust 社区制定了一套划分原则，这套原则包括下面几大方面：

##### 需要从 ```main``` 中分离的功能

- 将程序划分为 ```main.rs``` 和 ```lib.rs``` ，并将程序的逻辑放在 ```lib.rs``` 中
- 如果命令行参数处理逻辑很简单，则可以由 ```main.rs``` 来处理
- 如果命令行参数处理逻辑复杂，则放到 ```lib.rs``` 中处理

##### 保留在 ```main``` 中的功能

- 调用命令行参数的处理逻辑，来解析命令行参数
- 建立其它配置信息
- 调用 ```lib.rs``` 中的 ```run``` 函数
- 处理 ```run``` 函数的成功/错误情况

##### 可测试原则

- ```lib.rs``` 中的功能可以编写函数来直接测试
- 但是，```main``` 函数无法直接被测试
- 因此，按照上述划分原则，***```main``` 函数需要足够小，小到可以通过阅读代码来确认正确性***

### 步骤一：参数处理和抽象

原则：
1. ```main``` 函数只负责收集命令行参数
2. 而对命令行参数的处理和解析，交给独立的函数来完成
3. 最后，```main``` 函数只关心得到的最终参数和参数的意义，而不关于类似上面代码中的参数顺序，例如 ```args[1]``` 和 ```args[2]```

##### 独立的参数解析逻辑

- 将参数解析放到独立的函数中
- 使用 tuple 来存储所需的两个参数

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    let (query, filename) = parse_config(&args);
    println!("{} - {}", query, filename);
}

fn parse_config(args: &[String]) -> (&str, &str) {
    (&args[1], &args[2])
}
```

##### 整合配置信息

- 上面通过 parse_config 函数来返回一个 tuple，但紧接着在 main 函数中又被解构，变成了独立的变量，这说明我们还没有对这些配置数据进行正确的抽象和封装
- 这两个数据 query 和 filename 都属于配置信息的一部分，因此应当组合在一个 struct 中，这样代码维护者可以清晰的看到这些数据的关系，以及这些数据的作用是什么

> 对于某些场景，使用复杂类型（例如 struct ）是更合适的，但这个时候却使用大量的分散的原始数类型，从而导致数据分散，参数凌乱，这种行为就是 ***++anti-parttern++*** ，术语叫做 ***++primitive obsession++***

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let cfg = parse_config(&args);
    println!("{} - {}", cfg.query, cfg.filename);
}

struct Config {
    query: String,
    filename: String,
}

fn parse_config(args: &[String]) -> Config {
    Config {
        query: args[1].clone(),
        filename: args[2].clone(),
    }
}
```

对于使用 ```clone``` 的权衡：
- ```env::args().collect()``` 得到的是 collection ，因此，```args[1]``` 得到的 ```String``` 只是 borrow，无法 move 给 struct 中的变量
- 而如果将 struct 中的变量声明为引用，则需要管理 lifetime，对于本例子来说太过复杂
- 因此，对于本例来说，直接使用 ```clone``` 是最简单的方式，因为这两个数据的内容不会很长，且只需要 ```clone``` 一次，所以，牺牲一定的性能，但带来程序的简化，这样的取舍是值得的

##### 使用 Constructor 构建配置信息

- ```parse_config``` 函数的作用是创建 ```Config``` 这个 struct 的实例
- 因此，可以直接为 ```Config``` 创建一个 Constructor ，例如 ```new``` ，则可以使用 ```Config::new``` 的方式来创建，这样的代码更符合阅读习惯
- 但注意，虽然说是 Constructor ，本质上仍然是 struct 的 function

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let cfg = Config::new(&args);
    println!("{} - {}", cfg.query, cfg.filename);
}

struct Config {
    query: String,
    filename: String,
}

impl Config {
    fn new(args: &[String]) -> Config {
        Config {
            query: args[1].clone(),
            filename: args[2].clone(),
        }
    }
}
```

##### 优化错误提示

- 代码中我们直接使用了 ```args[1]``` 和 ```args[2]```
- 而如果命令行参数不够，则程序 panic
- 且提示的错误信息是 ```index out of bounds``` ，即下标越界
- 这样的错误提示是 rust 自身给出的，并不是我们自定义的，而且这样的提示信息会让用户很费解，无法理解真正的问题原因

```text
$ cargo run

thread 'main' panicked at 'index out of bounds ...'
```

因此需要对参数进行校验，并使用自定义的错误提示信息：

```rust
fn new(args: &[String]) -> Config {
    if args.len() < 3 {
        panic!("not enough args");
    }
}
```

此时错误提示如下：

```text
$ cargo run

thread 'main' panicked at 'not enough args' ...
```

##### 使用 ```Result``` 而不是 ```panic!```

- 在 ```new``` 中，使用 ```Result``` 来返回结果
- 而在 ```main``` 函数中来处理 ```Result``` ，从而由 ```main``` 函数决定如何处理错误
- 对应的，可以使用 ```process::exit()``` 来替代 ```panic!``` ，避免 rust 的一些额外的错误提示信息，例如 ```thread 'main' panicked at ...``` 这种内容

首先更改 ```new``` 函数：

```rust
fn new(args: &[String]) -> Result<Config, String> {
    if args.len() < 3 {
        return Err(String::from("not enough args"));
    }
    Ok(Config {
        query: args[1].clone(),
        filename: args[2].clone(),
    })
}
```

对于 ```Err``` 中的字符串，也可以使用 ```'static``` ：

```rust
fn new(args: &[String]) -> Result<Config, &'static str> {
    if args.len() < 3 {
        return Err("not enough args");
    }
}
```

最后，```main``` 函数中进行错误处理：

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let cfg = Config::new(&args).unwrap_or_else(|err| {
        println!("problem parsing args : {}", err);
        process::exit(1);
    });
    println!("{} - {}", cfg.query, cfg.filename);
}
```

> ```process::exit()``` 会立即停止程序，并返回参数指定的状态码，在该例子中我们传入的状态码是 1 。这与 ```panic!``` 类似，但区别是，```process::exit()``` 不会出现额外的 rust 的错误提示信息

此时运行程序得到的错误提示如下：

```text
$ cargo run

problem parsing args : not enough args
```

### 步骤二：将逻辑代码进行分离

目标：
1. 将逻辑代码分离到一个 ```run``` 函数中
2. 同时，```main``` 函数中只负责进行配置信息的构建和统一的错误处理
3. 从而，```main``` 的代码就变得很精简，所完成的功能也很明确
4. 因此，逻辑代码可以通过编写测试函数来进行验证，而 ```main``` 函数的代码则很容易通过阅读检查来确认正确性

##### 分离逻辑代码到 ```run```

```run``` 函数代码如下：
```rust
fn run(cfg: Config) {
    let contents = fs::read_to_string(cfg.filename)
        .expect("sth wrong reading file");
    println!("{}", contents);
}
```

对应的，```main``` 调用如下：
```rust
fn main() {
    //--snip--
    
    run(cfg);
}
```

##### 改进 ```run``` 的错误处理

- 目前在 ```run``` 中使用了 ```expect``` ，因此遇到错误时，程序会 panic
- 而我们希望错误处理统一集中在 main 函数中
- 因此， 当 ```run``` 遇到错误时，使用 ```Result``` 而不是 ```panic!```

更改 ```run``` 的返回值为 ```Result``` ：
```rust
fn run(cfg: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(cfg.filename)?;
    println!("{}", contents);

    Ok(())
}
```

代码剖析：
- ```run``` 成功时并需要返回数据，因此使用了 ```()``` 类型
- 因此成功时的返回值是 ```Ok(())```
- ```run``` 遇到错误时，使用了 ```Box<dyn Error>``` 类型，这表示 ```run``` 会返回一种错误类型，且这种错误类型实现了 ```Error``` 这个 trait ，但是不需要指定具体是哪种错误类型
- 另外，```Box<dyn Error>``` 就是 ***trait object*** ，在 Chapter17 讲解
- 最后，在 ```fs::read_to_string``` 时，我们不再使用 ```expect``` ，因为这会导致程序 panic ，而是直接使用 ```?``` 来返回对应的错误

然后在 ```main``` 函数中处理错误：

```rust
fn main() {
    //--snip--

    if let Err(e) = run(cfg) {
        println!("run error : {}", e);
        process::exit(1);
    }
}
```

代码剖析：
- 当 ```run``` 执行成功时，我们不需要关注其返回值
- 也就是说，我们仅仅关注 ```run``` 遇到错误时的处理
- 因此，不需要使用 ```unwrap_or_else``` ，而是使用更简便的 ```if let```
- 同时，与 ```Cofig::new``` 一样，对于 ```run``` 的错误，使用 ```process::exit()``` ，而不是 ```panic!```

### 步骤三：将逻辑代码放到 lib crate 中

目标：
- main 函数的内容放在 ```main.rs``` 中
- 逻辑代码分离到 ```lib.rs``` 中

```lib.rs``` 的内容：
1. ```run``` 函数的代码
2. ```run``` 函数涉及到的 ```use```
3. ```Config``` 的定义
4. ```Config``` 对应的方法，例如 ```Config::new```

> ```lib.rs```

```rust
use std::fs;
use std::error::Error;

pub struct Config {
    pub query: String,
    pub filename: String,
}

impl Config {
    pub fn new(args: &[String]) -> Result<Config, &'static str> {
        //--snip--
    }
}

pub fn run(cfg: Config) -> Result<(), Box<dyn Error>> {
    //--snip--
}
```

> ```main.rs```

```rust
use std::env;
use std::process;

fn main() {
    //--snip--

    let cfg = minigrep::Config::new(&args).unwrap_or_else(
        //--snip--
    });
    //--snip--

    if let Err(e) = minigrep::run(cfg) {
        //--snip--
    }
}
```

代码剖析：
- 由于逻辑代码放在 ```lib.rs``` 中，因此，```lib.rs``` 中的 item 就默认被 rust 理解为在 ```minigrep``` 这个 module 之中
- 因此，```Config , Config.query , Config.filename , Config::new , run``` 这些元素都必须使用 ```pub``` 修饰，否则在 main 函数中无法访问到这些 item
- 对应的，在 main 函数中，需要访问 ```lib.rs``` 中的 item 时，都需要使用 ```minigrep::``` 前缀，当然，也可以使用 ```use minigrep``` 来做一定的简化

### 总结：文件结构和代码逻辑结构

此时的文件结构是：

```
graph TD

PROJ{minigrep} --> SRC{/src}
SRC --> MN(main.rs)
SRC --> LB(lib.rs)
PROJ --> TGT{/target}
TGT --> DEBUG{/debug}
DEBUG --> EXE(minigrep)
PROJ --> TXT(test.txt)
```

而 module 及 item 结构是：

```
graph TD

MAIN(fn main) --> MG{mod minigrep}
MG --> CFG{pub struct Config}
MG --> RUN(pub fn run)
CFG --> FQ[pub fields]
CFG --> NEW(pub fn new)
```

查看错误提示：参数无效时
```text
$ cargo run

problem parsing args : not enough args
```

查看错误提示：文件不存在时
```text
$ cargo run sth test.txt.notexist

sth - test.txt.notexist
run error : No such file or directory (os error 2)
```

查看运行成功时的结果：
```text
$ cargo run sth test.txt

sth - test.txt
-- file content snip --
```
