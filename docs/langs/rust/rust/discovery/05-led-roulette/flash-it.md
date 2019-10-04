# Flash

刷写是将程序移动到微控制器的（持久性）内存的过程。一旦刷写，微控制器将在每次上电时执行刷写的程序。

在这种情况下，我们的 led 轮盘程序将是微控制器内存中唯一的程序。我的意思是说微控制器上没有其他东西运行：没有操作系统，没有“守护进程”，没有任何东西。 led 轮盘程序可以完全控制设备。

在实际的刷写中。我们需要做的第一件事就是启动OpenOCD。我们在上一节中做了这个，但是这次我们将在一个临时目录中运行命令 (`/tmp` on *nix; `%TEMP%` on Windows)。

确保F3已连接到笔记本电脑，并在新终端上运行以下命令。

```bash
$ # *nix
$ cd /tmp

$ # Windows
$ cd %TEMP%

$ # Windows: remember that you need an extra `-s %PATH_TO_OPENOCD%\share\scripts`
$ openocd \
  -f interface/stlink-v2-1.cfg \
  -f target/stm32f3x.cfg
```

> **注意** 旧版本的板子需要传递给 openocd 略有不同的参数。查看 [此部分](https://rust-embedded.github.io/discovery/03-setup/verify.html#first-openocd-connection) 了解详细信息。

该程序将会阻塞;保持终端打开。

现在是解释这个命令实际做什么的好时机。

我提到 F3 实际上有两个微控制器。其中一个用作编程器/调试器。用作编程器的电路板部分称为ST-LINK（这是STMicroelectronics决定称之为的）。该ST-LINK使用串行线调试（SWD，Serial Wire Debug）接口连接到目标微控制器（该接口是ARM标准，因此在处理其他基于 Cortex-M 的微控制器时会遇到它）。该SWD接口可用于刷写和调试微控制器。 ST-LINK连接到“USB ST-LINK”端口，当您将 F3 连接到笔记本电脑时，它将显示为USB设备。

![板载ST-LINK](https://rust-embedded.github.io/discovery/assets/st-link.png)

至于OpenOCD，它是可以在USB设备之上提供像 *GDB server* 这样的服务的软件，这些服务对外暴露调试协议，如SWD或JTAG。

对于实际的命令：我们使用的这些 `.cfg` 文件指示 OpenOCD 寻找 ST-LINK USB设备（`interface/stlink-v2-1.cfg`）并期望 STM32F3XX 微控制器（`target/stm32f3x.cfg`）连接到ST-LINK。

OpenOCD输出如下所示：

```bash
Open On-Chip Debugger 0.9.0 (2016-04-27-23:18)
Licensed under GNU GPL v2
For bug reports, read
        http://openocd.org/doc/doxygen/bugs.html
Info : auto-selecting first available session transport "hla_swd". To override use 'transport select <transport>'.
adapter speed: 1000 kHz
adapter_nsrst_delay: 100
Info : The selected transport took over low-level target control. The results might differ compared to plain JTAG/SWD
none separate
Info : Unable to match requested speed 1000 kHz, using 950 kHz
Info : Unable to match requested speed 1000 kHz, using 950 kHz
Info : clock speed 950 kHz
Info : STLINK v2 JTAG v27 API v2 SWIM v15 VID 0x0483 PID 0x374B
Info : using stlink api v2
Info : Target voltage: 2.919073
Info : stm32f3x.cpu: hardware has 6 breakpoints, 4 watchpoints
```

“6个断点，4个观察点”部分表示处理器可用的调试功能。

我提到 OpenOCD 提供了一个 GDB server，所以我们现在就连接到它：

```bash
$ <gdb> -q target/thumbv7em-none-eabihf/debug/led-roulette
Reading symbols from target/thumbv7em-none-eabihf/debug/led-roulette...done.
(gdb)
```

> **注意**：<gdb> 表示能够调试 ARM 二进制文件的 GDB 程序。这可能是 `arm-none-eabi-gdb`，`gdb-multiarch` 或 `gdb`，具体取决于您的系统 - 您可能需要尝试这三种方法。

这只会打开一个 GDB shell。要实际连接到 OpenOCD GDB 服务器，请在 GDB shell 中使用以下命令：

```bash
(gdb) target remote :3333
Remote debugging using :3333
0x00000000 in ?? ()
```

默认情况下，OpenOCD 的 GDB server 侦听 TCP 端口 3333（localhost）。此命令正是连接到该端口。

输入此命令后，您将在 OpenOCD 终端中看到新输出：

```bash
 Info : stm32f3x.cpu: hardware has 6 breakpoints, 4 watchpoints
+Info : accepting 'gdb' connection on tcp/3333
+Info : device id = 0x10036422
+Info : flash size = 256kbytes
```

差不多了。要刷写设备，我们将在 GDB shell 中使用 `load` 命令：

```bash
(gdb) load
Loading section .vector_table, size 0x188 lma 0x8000000
Loading section .text, size 0x38a lma 0x8000188
Loading section .rodata, size 0x8 lma 0x8000514
Start address 0x8000188, load size 1306
Transfer rate: 6 KB/sec, 435 bytes/write.
```

就是这样。您还将在 OpenOCD 终端中看到新输出。

```bash
 Info : flash size = 256kbytes
+Info : Unable to match requested speed 1000 kHz, using 950 kHz
+Info : Unable to match requested speed 1000 kHz, using 950 kHz
+adapter speed: 950 kHz
+target state: halted
+target halted due to debug-request, current mode: Thread
+xPSR: 0x01000000 pc: 0x08000194 msp: 0x2000a000
+Info : Unable to match requested speed 8000 kHz, using 4000 kHz
+Info : Unable to match requested speed 8000 kHz, using 4000 kHz
+adapter speed: 4000 kHz
+target state: halted
+target halted due to breakpoint, current mode: Thread
+xPSR: 0x61000000 pc: 0x2000003a msp: 0x2000a000
+Info : Unable to match requested speed 1000 kHz, using 950 kHz
+Info : Unable to match requested speed 1000 kHz, using 950 kHz
+adapter speed: 950 kHz
+target state: halted
+target halted due to debug-request, current mode: Thread
+xPSR: 0x01000000 pc: 0x08000194 msp: 0x2000a000
```

我们的程序加载了，让我们调试吧！
