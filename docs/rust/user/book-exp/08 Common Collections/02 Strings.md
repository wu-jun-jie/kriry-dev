# String

```str```
- UTF-8 编码
- 硬编码的方式编译到程序中
- 程序运行时存储在栈上某个位置

```String```
- UTF-8 编码
- 存储在 heap，空间可以运行时变化

### 创建 String

创建空的String：
```rust
let mut s = String::new();
```

根据现有字符串创建，下面几种方式都是等价的：
```rust
// 方法一
let data = "initial contents";
let s = data.to_string();

// 方法二
let s = "initial contents".to_string();

// 方法三
let s = String::from("initial contents");
```

> 注意：因为 String 和 str 都是 UTF-8 编码，所以可以识别多种文字，比如下面的例子。

```rust
let hello = String::from("السلام عليكم");
let hello = String::from("Dobrý den");
let hello = String::from("Hello");
let hello = String::from("שָׁלוֹם");
let hello = String::from("नमस्ते");
let hello = String::from("こんにちは");
let hello = String::from("안녕하세요");
let hello = String::from("你好");
let hello = String::from("Olá");
let hello = String::from("Здравствуйте");
let hello = String::from("Hola");
```

### Appending to String

使用 ```push_str``` ：
- 参数是 str
- 不会获得 str 参数的 ownership
- str 被 append 到 String 末尾
```rust
// 例一
let mut s = String::from("foo");
s.push_str("bar");

// 例二：s2的ownership不会被转移
let mut s1 = String::from("foo");
let s2 = "bar";
s1.push_str(s2);
println!("s2 is {}", s2);
```

使用 ```push``` ：
- 参数是一个字符
- 字符被 append 到 String 末尾
```rust
let mut s = String::from("lo");
s.push('l');
```

### 使用 ```+``` Operator

先看下面的例子：
```rust
let s1 = String::from("Hello, ");
let s2 = String::from("world!");

// 注意：s1 已被 Move
let s3 = s1 + &s2;
```

注意，```+``` 类似于下面的方法：
```rust
fn add(self, s: &str) -> String {
```

详细剖析：
1. s2 形参是 &str
2. 但是该例子是直接传入了实参 &String
3. 这是编译器自动做的强制转换
4. 也就是说，编译器自动强制将 ```&s2``` 转换为 ```&s2[..]```
5. s1 形参 是 self ，而不是 &self
6. 所以 s1 被 move 到 add 中
7. 最后 add 返回一个新的 String
8. 因此，执行了 ```+``` 以后，s1 已经不可用，但 s2 仍然可用

多次使用 ```+``` 的例子，注意看注释：
```rust
let s1 = String::from("s1");
let s2 = String::from("s2");
let s3 = String::from("s3");

// 注意 s1 是 self
// 而 s2 要传入 &s2
// 且 s3 也要传入 &s3
let s = s1 + "-" + &s2 + "-" + &s3;

/*
此时 s1 已被 move，
但 s2 和 s3 仍然可用，
得到的新 String 是 s
*/

// 编译错误，s1 已不可用
println!("s1 = {}", s1);

// 编译正常，s2/s3/s 都可用
println!("s2 = {}", s2);
println!("s3 = {}", s3);
println!("s = {}", s);
```

### 使用 ```format!```

说明：
- 多次使用 ```+``` 时，代码不易阅读
- 且 ```+``` 会影响 ownership
- ```format!``` 可以拼接多个 String ，并返回新的 String ，而且不会影响原来任何 String 的 ownership

举例：
```rust
let s1 = String::from("s1");
let s2 = String::from("s2");
let s3 = String::from("s3");

// format! 不影响任何String的ownership
let s = format!("{}-{}-{}", s1, s2, s3);

// 编译正常，s1/s2/s3/s 都可用
println!("s1 = {}", s1);
println!("s2 = {}", s2);
println!("s3 = {}", s3);
println!("s = {}", s);
```

### Indexing into Strings

通过 index 的方式去获取 String 的部分内容，不管是一个字符还是一个片段，对 rust 来说都不是最好的方式。下面分别说明。

##### 不支持 Index 的方式
举例：
```rust
let s1 = String::from("hello");
let h = s1[0];
```

剖析：
- 该代码会编译错误
- 编译器提示不支持 index 来获取某个字符

原因：
- String 是用 UTF-8 来存储的
- 所以一个字面意义上的字符，实际在 String 中可能是多个 byte 来存储的
- 所以用 index 可能会得到这些多个 byte 里的某个字节
- 因此 rust 不允许这样的方式

##### String 的内部存储

说明：
- String 的本质是 ```Vec<u8>```
- 在 Vector 内，使用 UTF-8 存储各个 byte
- String 有方法 ```len()``` ，该方法得到的是 byte 的个数
- 所以，字面意义上的字符个数与 byte 个数是不一定一样的

举例：
```rust
// 结果是3
let len = String::from("abc").len();

// 结果也是3
let len = String::from("我").len();
```

##### 对 String 使用 Slice

说明：
- 可以用 slice 来获得 String 片段
- 但这是很危险的方式
- 因为需要自行确保该片段是完整的字符，而不是字符里的部分字节
- 若不是部分字节，则 rust 会 panic

举例：运行正常
```rust
let s1 = String::from("a我");
let s = &s1[..1];
let s = &s1[..4];
```

举例：程序 panic
```rust
let s1 = String::from("a我");
let s = &s1[..3];
```

##### 总结

1. String 内部是用 UTF-8 存储的
2. 因此字面意义上的字符个数，与 String 的 byte 数很可能是不一致的
3. 因此 rust 不允许直接使用 ```[index]``` 的方式来索引字符
4. 一般来说，```[index]``` 的时间复杂度都被期望为 O(1)，但 String 是无法做到的，因为 String 需要从开始的第一个 byte 进行计算，来判断实际到底有多少个字面意义上的字符，所以 rust 直接屏蔽了这种用法
5. 但 slice 是允许的，但必须程序员自行确保 slice 的有效性，否则程序 panic

### Iterating Over Strings

讲了这么多，终于说到重点，iterating 才是正确的使用方式：
- ```bytes()``` 得到 UTF-8 编码的各个 byte
- ```chars()``` 得到字面意义上的各个字符

举例：
```rust
// 长度是 6
let s1 = String::from("我们");
println!("len = {}", s1.len());

// 打印了两个字符：我 / 们
println!("chars() :");
for c in s1.chars() {
    println!("  {}", c);
}

// 打印了6个u8的byte
// 230 136 145 228 187 172
println!("bytes() :");
for b in s1.bytes() {
    println!("  {}", b);
}
```
