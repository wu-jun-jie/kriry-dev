# 使用结构体的示例

*源码：[cal_rect](https://gitee.com/A1G2G1/Rust_The_Book/tree/master/cal_rect)*

## 要点

- 封装一个函数来计算一个矩形的面积
- 矩形的长和宽参数可以作为两个参数传入，也可以封装为 tuple ，或者 struct
- 对于 struct ，可以使用 rust 提供的 derive 特性来进行 debug
- 使用该特性的语法是对 struct 声明相关 trait：#[derive(Debug)]
- 而 debug 输出的语法是：:? 或者 :#?

源码片段：
```rust
// 为struct增加调试信息
#[derive(Debug)]
struct Rect {
    width : u32,
    height : u32,
}
// 通过struct来传递长和宽
fn cal_struct(rect : &Rect) -> u32 {
    rect.width * rect.height
}

fn main() {
    // struct
    let rect = Rect {
        width : 80,
        height : 90,
    };
    println!("cal_struct = {}", cal_struct(&rect));
    
    // debug struct
    println!("rect is {:#?}", rect);
}
```