# public & private

继续上一节的例子：
1. 在 lib 工程中再创建一个 binary crate
2. 方法是直接创建 ```src/main.rs``` 即可
3. 在 ```src/main.rs``` 中使用我们的 lib crate

> src/main.rs

```rust
extern crate communicator;

fn main() {
    communicator::client::connect();
}
```

说明：
- 此时工程有两个 create，一个是 lib，一个是 binary
- 虽然这两个 crate 都在一个工程中，但 仍然需要 ```extern crate```
- 这种模式对可执行程序的工程来说很常见，将功能放到 lib crate 中，然后 binary crate 来使用它们
- 需要注意的是，```extern crate``` 要放在 root module 中，即 ```src/main.rs``` 或者 ```src/lib.rs``` ，从而在程序中任意位置都可以直接使用这些 crate

### Making a Function Public

规则：
1. 若要允许 crate 中的方法被外部使用，需要使用 ```pub``` 关键字
2. 首先是 module 声明为 pub，其次是该 module 中的 function 声明为 pub
3. 所以，如果 module 是 private，而该 module 内的 function 是 public，那么外部仍然是无法使用该 function 的
4. module 内的 function 根据程序需要，要对外公开的就声明为 pub，否则就默认为 private
6. 对于声明为 pub 的 function ，编译器不会再警告 ```function is never used``` ，因为该 function 只是对外使用，所以程序内部可能不会使用它，自然也就不会有该警告
7. 但是对于 private 的 function，如果程序内部没有使用过它，编译器是会提出警告的，因为这可能有几种情况：
    - 也许使用该 function 的代码被误删除了，需要检查
    - 该 function 已经是冗余的，可以被删除

> src/lib.rs

```rust
pub mod client;

mod network;
```

> src/client.rs

```rust
pub fn connect() {
}
```

### Privacy Rules

> 注：下面的几方面规律是我个人总结出来的，所以描述看起来比较民间，但比官方文档上的规律要更容易理解一些。

##### 访问路径
1. 访问一个 item 只能沿路径从外往内访问
2. ```super``` 表示上一级目录
3. ```::``` 表示顶层目录

##### 内与外
1. 内：当前 module 内部任意位置，包括 sub module
2. 外：当前 module 外部任意位置

##### 可见规则
1. 如果一个 item 是 private，则只对内可见
2. 如果一个 item 是 pub，则对内对外都可见

##### 路径与可见
1. ++可见性++ 限制的是 ++访问者++ 的位置
2. ++路径++ 指的是访达 item 的方式
3. 所以，++访问者++ 的位置决定了能否访问一个 item

##### 不穿透
1. 访问规则只是针对 item 本身
2. 所以 item 能被访问，不表示 item 内部的 item 就能被访问
3. 例如，某个 module 能被访问，不表示该 module 内的 function 就可以被访问

> 下面用例子来详细阐述该规律

```rust
mod outermost {
    pub fn middle_function() {}
    fn middle_secret_function() {}

    mod inside {
        pub fn inner_function() {}
        fn secret_function() {
           /*
           [OK]
           middle_secret_function方法
           在super(即outermost)内部都是可见的
           */
           super::middle_secret_function();
        }
    }
}

/*
该方法与outermost这个module都在同一个范围内，
因此该方法能访问到outermost这个item，
但不代表该方法一定能访问到outermost内部的item。
*/
fn try_me() {

    /*
    [OK]
    middle_function是pub
    */
    outermost::middle_function();
    
    /*
    [ERROR]
    middle_secret_function是private
    */
    outermost::middle_secret_function();
    
    /*
    [ERROR]
    访问不到inside，
    虽然inside内的item可能是pub。
    因此如果inside是pub，
    则可访问到inner_function
    */
    outermost::inside::inner_function();
    
    /*
    [ERROR]
    访问不到inside。
    此时如果inside是pub也不行，
    因为secret_function是private。
    */
    outermost::inside::secret_function();

}
```
