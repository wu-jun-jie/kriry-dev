# 流程控制

代码实现流程控制的方式有：
1. if
2. loop

## if Expression

语法：
```rust
if condition1 {

} else if condition2 {

} else if condition3 {

} else {

}
```

要点：
- condition不用括号
- 每个condition后的代码必须有大括号，即使只有一句代码
- condition必须是bool类型
- 例如condition是i32类型则编译报错
- Rust不像其它语言一样，会自动将非bool转为bool处理

处理顺序：
- 按照代码顺序来判断所符合的条件
- 执行第一个符合条件的代码块
- 因此，如果存在多个符合的条件，但也只会执行第一个符合的条件

if 作为expression
- if是expression，因此可以用于let语句
- if的返回值取决于满足条件的那个代码块的返回值
- 因此每个代码块里需通过最后一个expression来得到返回值
- 所以，用于返回值的expression不能用分号结尾
- 对应的，每个条件的代码块的返回值必须是同一个类型

举例：无返回值
```rust
fn main() {
    let number = 3;
    
    if number < 5 {
        println!("condition was true");
    } else {
        println!("condition was false");
    }
}
```

举例：有返回值且存在多个符合的条件，但只执行第一个符合的条件
```rust
fn main() {
    let number = 6;
    
    let result = if number % 4 == 0 {
        4
    } else if number % 3 == 0 {
        3
    } else if number % 2 == 0 {
        2
    } else {
        1
    };

    println!("The value of result is: {}", result);
}
```

错误举例：出现不同类型的返回值
```rust
fn main() {
    let condition = true;

    let number = if condition {
        5
    } else {
        "six"
    };

    println!("The value of number is: {}", number);
}
```

## Repetition with loop

Rust有几种循环方式：
1. loop
2. while
3. for

### loop

语法：
```rust
loop {
    if condition {
        break;
    } else {
        continue;
    }
}
```

可以从loop得到返回值：
- 在loop退出时给出返回值
- 退出的方式是break
- 因此通过break来给出返回值
- 语法是 break value;
- 要注意的是，虽然break可以得到返回值，但break语句仍然是需要分号结尾的
- 对应的，可以将loop使用到let语法中

loop无返回值的举例：
```rust
fn main() {
    loop {
        println!("again!");
    }
}
```

loop有返回值的举例：
```rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2;
        }
    };
}
```

### while

语法：
```rust
while condition1 {
    if condition2 {
        break;
    } else {
        continue;
    }
}
```

举例：
```rust
fn main() {
    let mut number = 3;

    while number != 0 {
        println!("{}!", number);
        number = number - 1;
    }
}
```

### for

语法：
```rust
for elem in Array/Range {
    println!("{}", elem);
}
```

先用while做一个数组循环的例子：
```rust
fn main() {
    let a = [10, 20, 30, 40, 50];
    
    let mut index = 0;
    while index < 5 {
        println!("{}", a[index]);
        index = index + 1;
    }
}
```

用while做这种数组循环的缺点是：
1. 如果数组下标控制出错，会引起程序panic
2. 如果数组大小发生了变化，很容易忘记更改while的条件，即 index 的上限值，进而导致程序panic
3. 程序运行效率低，因为每次循环都要重复的进行条件判断

上述例子改为用 for 实现：
```rust
fn main() {
    let a = [10, 20, 30, 40, 50];

    for elem in a.iter() {
        println!("{}", elem);
    }
}
```

举例:打印数字从1到3
```rust
fn main() {
    for num in 1..4 {
        println!("{}", num);
    }
}
```

此处涉及到 Range：
- 语法是 a..b
- 例如 1..4 ，表示从1开始，但不包含4，即 1,2,3
- 如果要使用Range的方法，则需要先用括号括起来，再调用其方法
- 例如反转元素：(1..4).rev()

举例:打印数字从3到1
```rust
fn main() {
    for num in (1..4).rev() {
        println!("{}", num);
    }
}
```