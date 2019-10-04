# module 结构

#### 创建 lib 工程
```shell
$ cargo new communicator --lib
```

#### 何为 module
1. module 是一个 namespace，包含了函数和数据类型的定义
2. 同时可决定这些定义是否对外可见

#### module 语法
- 关键字 ```mod``` 定义一个 module，对应代码可以在紧接其后的 {} 内出现，也可以在其它文件出现
- 默认情况下，module 都是对外不可见的，即 private，通过关键字 ```pub``` 设置为对外可见
- 通过关键字 ```use``` 来使用一个 module

### Module Definitions

可以定义多个 module ：
```rust
mod network {
    fn connect() {
    }
}

mod client {
    fn connect() {
    }
}
```

注意：
- 虽然都有同名的 connect 方法，但它们并不会冲突，因为在两个 module 中
- 访问方法的语法是：```network::connect()``` 或者 ```client::connect()```

module 可以嵌套：
```rust
mod network {
    fn connect() {
    }

    mod client {
        fn connect() {
        }
    }
}
```

注意：
- module 要如何组织、是否嵌套，取决于程序的设计
- 本例中，访问方法的语法是：```network::connect()``` 或者 ```network::client::connect()```

### Moving Modules to Other Files

如果所有 module 和代码都在一个文件中的话，代码会变得很长，不好维护，因此可以将 module 移到不同的文件中，先看下面的例子，逐步来移动各个 module 的代码：

> src/lib.rs

```rust
mod client {
    fn connect() {
    }
}

mod network {
    fn connect() {
    }

    mod server {
        fn connect() {
        }
    }
}
```

那么该工程的 module 结构如下：
```
graph TD
    A{src/lib.rs} --> B(client)
    A --> C(network)
    C --> D(server)
```

移动 client ，先只声明该 module ：

> src/lib.rs

```rust
mod client;

mod network {
    fn connect() {
    }

    mod server {
        fn connect() {
        }
    }
}
```

注意：```mod client;``` 等价于：
```rust
mod client {
    // contents of client.rs
}
```

然后新建文件 ```client.rs``` 并在其中增加代码：
```rust
fn connect() {
}
```

注意：
- 此时不能再增加 mod 关键字
- 否则 rust 会认为这是一个子模块，即 client::client

同样的，移动 network，对应的代码类似如下：

> src/lib.rs

```rust
mod client;

mod network;
```

> src/network.rs

```rust
fn connect() {
}

mod server {
    fn connect() {
    }
}
```

> - 此时若不移动 network::server ，则程序到此为止都可以工作
> - 若还要移动 network::server ，上述方式就不可行，需要下面的方式

移动 network::server 需要按照下面的步骤：
1. 创建子目录 ```network```
2. 在子目录下创建 ```mod.rs```
3. 在 ```mod.rs``` 中加入相关代码以及子模块声明
4. 在子目录下创建 ```server.rs``` ，并加入该子模块的代码

此时的目录结构如下：
```
graph TD
    A{project} --> B(src)
    B --> C[lib.rs]
    B --> D[client.rs]
    B --> E(network)
    E --> F[mod.rs]
    E --> G[server.rs]
```

总结：
1. 工程代码默认在 ```/src``` 目录中
2. rust 默认寻找 ```/src/lib.rs```
3. 在 ```/src/lib.rs``` 中加入相关代码和模块声明，例如 ```mod sub_a```
4. 模块代码可独立到与模块同名的文件中，例如 ```/src/sub_a.rs``` ，并在该文件中加入对应的模块代码
5. 如果模块中还有子模块，且都需要模块代码分离，则需要建立文件夹 ```/src/sub_b```
6. 对应的，代码和模块声明加入到 ```/src/sub_b/mod.rs``` 中
7. 子模块代码则独立到 ```/src/sub_b/sub_c.rs``` 中

原则：
- 子模块的声明必须放在父模块中
- 子模块的代码可放在独立的同名文件中
- 该规律是递归的
