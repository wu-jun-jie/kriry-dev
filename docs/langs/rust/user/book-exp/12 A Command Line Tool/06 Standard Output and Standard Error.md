# stdout & stderr

##### 原理

1. rust 终端有两种输出：standard output (***stdout***) 和 standard error (***stderr***)
2. ***stdout*** 对应的是 ```println!```
3. ***stderr*** 对应的是 ```eprintln!```
4. ***stderr*** 总是输出到控制台并显示
5. ***stdout*** 有两种选择，一种是输出到控制台显示，另一种是重定向到文件
6. ***stdout*** 默认是输出到控制台显示，而要重定向到文件，则需要使用 ```> filename``` ，例如 ```cargo run > output.txt```

##### 进行重定向

- 成功的信息重定向到文件中
- 错误的信息输出到控制台显示
- 在我们的程序中，错误处理都集中在 ```main``` 函数中，因此统一在 ```main``` 中将 ```println!``` 更改为 ```eprintln!``` 即可
- 这也呼应了本章开头提到的改进点：我们应当遵循 ++将错误集中到一个地方统一处理++ 的原则
- 然后对 ***stdout*** 进行重定向，例如：```cargo run > output.txt```

进行上述修改后，测试失败的情况：
> 控制台输出错误信息，output.txt 文件内容为空

```text
$ cargo run > output.txt

problem parsing args : not enough args
```

然后测试成功的情况：
> 控制台输出信息为空，output.txt 中保存了查找结果

```text
$ CASE_INS=1 cargo run line test.txt > output.txt
```
