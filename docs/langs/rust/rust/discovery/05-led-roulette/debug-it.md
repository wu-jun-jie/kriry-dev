# 调试

我们已经在调试会话中，所以让我们调试我们的程序。

在load命令之后，我们的程序在其入口点停止。这由GDB输出的“起始地址0x8000XXX”部分指示。入口点是处理器/CPU首先执行的程序的一部分。

我提供给你的初学者项目有一些在main函数之前运行的额外代码。这时，我们对“pre-main”部分不感兴趣，所以让我们直接跳到main函数的开头。我们将使用断点来做到这一点：

```bash
(gdb) break main
Breakpoint 1 at 0x800018c: file src/05-led-roulette/src/main.rs, line 10.

(gdb) continue
Continuing.
Note: automatically using hardware breakpoints for read-only addresses.

Breakpoint 1, main () at src/05-led-roulette/src/main.rs:10
10          let x = 42;
```


断点可用于停止程序的正常流程。 continue命令将让程序自由运行，直到到达断点。在这种情况下，直到它到达 `main` 函数，因为那里有一个断点。

请注意，GDB输出显示"Breakpoint 1"。请记住，我们的处理器只能使用其中的六个断点，因此最好注意这些消息。

为了获得更好的调试体验，我们将使用GDB的文本用户界面（TUI, Text User Interface）。要进入该模式，请在GDB shell上输入以下命令：

```bash
(gdb) layout src
```


> **注意** 致歉Windows用户。 GNU ARM嵌入式工具链附带的GDB不支持此TUI模式:-(。

![GDB会话](https://rust-embedded.github.io/discovery/assets/gdb-layout-src.png)

您可以随时使用以下命令退出TUI模式：

```bash
(gdb) tui disable
```

好。我们现在处于 `main` 的开端。我们可以使用 `step` 命令按语句推进程序语句。所以让我们两次使用它来达到 `_y = x` 语句。一旦你输入了 `step`，你就可以按Enter键再次运行它。

```bash
(gdb) step
14           _y = x;
```

如果您没有使用TUI模式，则在每个步骤调用GDB将打印当前语句及其行号。

我们现在“在” `_y = x` 语句上;该语句尚未执行。这意味着 `x` 被初始化但 `_y` 不是。让我们使用 `print` 命令检查这些堆栈/局部变量：

```bash
(gdb) print x
$1 = 42

(gdb) print &x
$2 = (i32 *) 0x10001ff4

(gdb) print _y
$3 = -536810104

(gdb) print &_y
$4 = (i32 *) 0x10001ff0
```

正如所料，`x` 包含值 `42`. 但是 `_y` 包含值 `-536810104`（？）。因为 `_y` 尚未初始化，它包含一些垃圾值。

命令 `print ＆x` 打印变量`x`的地址。有趣的是这里GDB输出显示了引用的类型：`i32*`，指向`i32`值的指针。另一个有趣的事情是`x`和`_y`的地址彼此非常接近：它们的地址相差仅4个字节。

您可以使用 `info locals` 命令，而不是逐个打印局部变量：

```bash
(gdb) info locals
x = 42
_y = -536810104
```

好。通过另一个 `step`，我们将处于 `loop{}` 语句之上：

```bash
(gdb) step
17          loop {}
```

现在`_y`应该已经初始化了。

```bash
(gdb) print _y
$5 = 42
```

如果我们在 `loop{}` 语句之上再次使用 `step`，我们就会卡住，因为程序永远不会通过该语句。相反，我们将使用 `layout asm` 命令切换到反汇编视图，并使用`stepi`一次前进一条指令。您可以随后通过再次发出 `layout src` 命令切换回Rust源代码视图。

> **注意** 如果你错误地使用了 `step` 命令并且GDB卡住了，你可以通过按 `Ctrl + C` 来解锁。

```bash
(gdb) layout asm
```

![GDB会话](https://rust-embedded.github.io/discovery/assets/gdb-layout-asm.png)

如果您没有使用TUI模式，可以使用 `disassemble /m` 命令反汇编您当前所在行的程序。

```bash
(gdb) disassemble /m
Dump of assembler code for function main:
7       #[entry]
   0x08000188 <+0>:     sub     sp, #8
   0x0800018a <+2>:     movs    r0, #42 ; 0x2a

8       fn main() -> ! {
9           let _y;
10          let x = 42;
   0x0800018c <+4>:     str     r0, [sp, #4]

11          _y = x;
   0x0800018e <+6>:     ldr     r0, [sp, #4]
   0x08000190 <+8>:     str     r0, [sp, #0]

12
13          // infinite loop; just so we don't leave this stack frame
14          loop {}
=> 0x08000192 <+10>:    b.n     0x8000194 <main+12>
   0x08000194 <+12>:    b.n     0x8000194 <main+12>

End of assembler dump.
```

看到左侧的胖箭头 `=>` 了吗？它显示了处理器接下来要执行的指令。

如果不在TUI模式内，每个`stepi`命令GDB将打印语句、行号和处理器接下来将执行的指令的地址。

```bash
(gdb) stepi
0x08000194      14          loop {}

(gdb) stepi
0x08000194      14          loop {}
```

在我们转向更有趣的事情之前的最后一招。在GDB中输入以下命令：


```bash
(gdb) monitor reset halt
Unable to match requested speed 1000 kHz, using 950 kHz
Unable to match requested speed 1000 kHz, using 950 kHz
adapter speed: 950 kHz
target halted due to debug-request, current mode: Thread
xPSR: 0x01000000 pc: 0x08000196 msp: 0x10002000

(gdb) continue
Continuing.

Breakpoint 1, main () at src/05-led-roulette/src/main.rs:10
10          let x = 42;
```

我们现在回到 `main` 的开始！

`monitor reset halt` 将会复位微控制器并在程序入口点处将其停止。接下来的 `continue` 命令将让程序自由运行，直到它到达具有断点的`main`函数。

当你错误地跳过了你有兴趣检查的程序的一部分时，这个组合很方便。您可以轻松地将程序状态回滚到最开始状态。

> **精细说明**：此`reset`命令不会清除或接触RAM。该内存将保留其上一次运行的值。这应该不是问题，除非您的程序行为取决于未初始化变量的值，但这是未定义行为（UB，Undefined Behavior）的定义。

我们完成了这个调试会话。您可以使用`quit`命令结束它。

```bash
(gdb) quit
A debugging session is active.

        Inferior 1 [Remote target] will be detached.

Quit anyway? (y or n) y
Detaching from program: $PWD/target/thumbv7em-none-eabihf/debug/led-roulette, Remote target
Ending remote debugging.
```

> **注意** 如果您不喜欢默认的GDB CLI，请查看[gdb-dashboard](https://github.com/cyrus-and/gdb-dashboard#gdb-dashboard)。它使用Python将默认的GDB CLI转换为显示寄存器、源视图、汇编视图和其他内容的仪表板。

不要关闭OpenOCD！我们稍后会一次又一次地使用它。最好让它继续运行。

下一步是什么？我承诺的高级API。
