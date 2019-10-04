# HashMap

说明：
- 关键字 ```HashMap<K, V>```
- 需要 ```use std::collections::HashMap```
- 之所以需要显式的 use ，是因为 HashMap 并没有被 rust 自动的引入到 scope 中
- 但本章中 Vec 和 String 是被自动引入的，所以不需要 use
- 与 Vec 一样，HashMap 的所有 Key 都只能是同一种类型，所以 V 也只能同一种类型
- 但 K 和 V 可以是不同的类型

### Creating a New HashMap

有多种方式可以创建 HashMap，下面分别说明：

##### 使用 ```new``` 和 ```insert```

举例：
```rust
let mut t_s = HashMap::new();

// 根据insert的数据来确定K/V类型
t_s.insert(String::from("Blue"), 10);
t_s.insert(String::from("Yellow"), 50);
```

剖析：
- 通过 ```new()``` 来创建一个空的 HashMap
- 通过 ```insert()``` 来加入 K/V 对
- 根据 insert 的数据类型自动推断出 K/V 的类型

##### 使用 ```collect```

举例：
```rust
let teams = vec![
    String::from("A"),
    String::from("B"),
    String::from("C"),
    String::from("D")];
let scores = vec![10, 20, 30];

// 此时需要指定数据类型是HashMap
// 但K/V类型可以用_,_
// 从而编译器自行确定K/V类型
let t_s: HashMap<_, _> =
    teams.iter()
    .zip(scores.iter())
    .collect();
```

剖析：
- ```teams``` 是一个 Vec，元素类型是 String
- ```scores``` 是一个 Vec，元素类型是 i32
- ```zip``` 方法的作用是，将两个 Vec 压缩成另一个新的 Vec，元素类型是 tuple(String, i32)，对该例子来说，例如 tuple("A", 10)
- 此时 ```t_s``` 变量需要指定类型是 HashMap，因为 ```collect``` 方法可以收集为多种数据结构，但是 HashMap 中的 K/V 用 ```_, _``` 替代，让编译器自动推断
- 因此，```collect``` 方法的作用是，将新的 Vec 收集到 HashMap 中，也就是说，将 新的 Vec 中的一个个的 tuple(String, i32) 分别转换为 K/V 对，每个 tuple 是一个 K/V ，其中 K 是 String，V 是 i32
- 额外再说明一下 ```zip``` 方法，该例子中 teams 和 scores 两个 Vec 的元素个数是不一样的，所以 ```zip``` 方法会以较少的元素个数为标准，所以该例子中实际是 zip 了 3个元素

### HashMap and Ownership

ownership 与 HashMap 的创建方式有关系，先分别总结规则：

##### ```insert``` 方式

规则：
1. 对于 Copy 类型，数据会被拷贝
2. 对于 Move 类型，ownership 会被 Move
3. ==但 HashMap 也支持引用，且这就涉及到引用本身与 HashMap 本身的有效性关联，详细在 Chapter10 中讨论==

举例：
```rust
let s1 = String::from("A");
let i1 = 1;

let mut map = HashMap::new();
map.insert(s1, i1);

/*
s1 被 move 到 map 中，
i1 被 copy 到 map 中，
因此，此时 s1 已不可用，但 i1 可用。
*/
```

##### ```zip``` 和 ```collect``` 方式

1. ```zip``` 是将两个 Vec 压缩到一个元素类型为 tuple 的新 Vec 中，因此并不会对原来的两个 Vec 的 ownership 产生任何影响
2. ```collect``` 将新的 Vec 收集为一个 HashMap
3. 因此使用该方式创建 HashMap 时，不会对原来的 Vec 的 ownership 产生任何影响，即使原来 Vec 的数据类型是 String

举例：
```rust
let teams = vec![String::from("A"), String::from("B")];
let scores = vec![10, 20];

let t_s: HashMap<_, _> = 
    teams.iter()
    .zip(scores.iter())
    .collect();

// 此时teams仍然可用
for s in teams.iter() {
    println!("{}", s);
}
```

### Accessing HashMap

有几种方式可以访问 HashMap ，可以按 K 来获取，也可以遍历：

##### 使用 ```get``` 方法

说明：
- get 方法需要传入 K
- 得到的结果是 Option<&V>
- 因此，如果 K 存在，得到的就是 Some(&V)，否则，得到的就是 None
- 通过 Option<&V>，也就可以判断 K 是否存在
- 或者说，get 方法也具备了查找的功能

举例：
```rust
let mut t_s = HashMap::new();

t_s.insert(String::from("Blue"), 10);
t_s.insert(String::from("Yellow"), 50);

// 判断 Option<&V> 是否有效
match t_s.get(&String::from("Blue")) {
    Some(i) => println!("{}", i),
    None => println!("not exist"),
}
```

##### 使用 ```for``` 遍历

举例：
```rust
let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

// 遍历得到 K/V
for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

### Updating a HashMap

前面讲到的 ```get``` 方法是查找某个 K ，得到 ```Option<&V>``` ，但其实 HashMap 还有更简单的方法来直接替换现有的 V ，或者只当 K 不存在时才插入 V ：

##### 直接覆盖已有的 V

规则：
- K 不存在时，插入 V
- K 已存在时，覆盖 V

举例：
```rust
let mut scores = HashMap::new();

// 重复添加 K 时，会自动被覆盖
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25);
```

##### K 不存在时才 Insert

说明：
- 通过 K 得到 ```Entry```
- 使用 ```Entry``` 的 ```or_insert``` 方法
- ```or_insert``` 会自动进行判断，若 K 存在，则返回原值的 &mut ，若 K 不存在，则插入新值，并返回新值的 &mut

举例：
```rust
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

// 插入 Yellow-50 这个键值对
scores.entry(String::from("Yellow")).or_insert(50);
// 返回 Blue-10 这个已有的键值对
scores.entry(String::from("Blue")).or_insert(50);
```

##### 更新现有的 V

说明：
- 基于 ```or_insert``` 方法返回的 &mut
- 通过 &mut 来更新现有的 V
- 但注意需通过 ```*``` 来 dereference

举例：
```rust
let text = "hello world wonderful world";

let mut map = HashMap::new();

for word in text.split_whitespace() {
    // word 存在时得到现有count
    // word 不存在时得到初始 count(0)
    let count = map.entry(word).or_insert(0);
    // 通过 * 来 dereference 并更新
    *count += 1;
}
```

### Hashing Functions

说明：
- Hash 函数或算法叫做 hasher
- hasher 是一种实现了 ```BuildHasher``` trait 的类型，在 Chapter10 中讨论
- HashMap 使用的 hasher 具备加密安全性，能够防止 DoS 攻击，这带来的缺点是性能有所损耗，但为了安全性，这个性能上的损耗是值得的
- 根据自己的程序需求，若默认的 hasher 不满足性能需求，可以更换其它的 hasher
- 不需要自行实现 hasher ，因为 crate.io 中有很多已经实现好的 hasher
