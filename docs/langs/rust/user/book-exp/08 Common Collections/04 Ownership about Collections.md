# 关于集合的所有权

概述：
1. 该部分不是 The Book 的内容，而是在学习本章的过程中自行总结的
2. 由于本章介绍的几种类型的数据都是存储在 heap，总是会涉及 ownership 的概念，因此在此处稍微拓展总结一下
3. 本章中的 Vector/String/HashMap，都存在两种 ownership 的变化：一是整个类型本身，例如 HashMap 这整个类型；二是里面的某个元素，例如 Vector 里的某个元素
4. 不管是整个类型本身，还是里面的某个元素，都遵循 Move/Copy 规则

##### 整个类型本身

说明：
- 主要发生在遍历元素的时候
- String的遍历使用的是 &self ，所以不存在该问题
- 而对于 Vector/HashMap ，如果我们使用 ```&``` ，则不会影响 ownership，否则，ownership 就被 move 到 ```for``` 中
- 这就是为何使用 ```for``` 来遍历时，一般都使用 ```&```

举例：
```rust
let teams = vec![String::from("A"), String::from("B")];
let scores = vec![10, 20];

let t_s: HashMap<_, _> = 
    teams.iter()
    .zip(scores.iter())
    .collect();

/*
如果使用 &t_s，则只是 borrow ，
但如果使用 t_s，则是 move，
而一旦 move ，遍历之后 t_s 就不再可用。
*/
for (k, v) in &t_s {
    println!("{}: {}", k, v);
}

/*
此处遍历 Vector 也是如此，
如果使用 scores ，则被 move 到 for 中，
遍历之后 sores 就不再可用。
*/
for i in &scores {
    println!("{}", i);
}
```

##### 类型中的元素

说明：
- 主要发生在获取某个元素的时候
- 对 String/HashMap 来说，获取元素都被方法包装过了，例如 HashMap 的 ```get``` 方法，得到的是 Option<&V> ，不存在该问题
- 但对于 Vector 来说，支持通过索引的方式获取元素，所以，也存在元素的 ownership 问题，但这就与元素的类型有关
- 如果元素类型是 Copy 类型，例如 int ，则可以 borrow ，也可以 copy
- 如果元素类型是 Move 类型，例如 String ，则只能 borrow ，不能 move ，因为 Vector 内部就是按照 ```&``` 方式来存储的

举例：
```rust
let scores = vec![10, 20];
// 此时是 copy ，ft1 是 i32 类型
let ft1 = scores[0];
// 此时是 borrow ，ft1 是 &i32 类型
let ft1 = &scores[0];

let teams = vec![String::from("A"), String::from("B")];
// 此时是 borrow ，ft1 是 &String 类型
let ft1 = &teams[0];
// 编译报错，不允许 move
let ft1 = teams[0];
```
