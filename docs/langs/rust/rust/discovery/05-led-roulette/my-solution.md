# 解决方案

你想出了什么解决方案？

这是我的：

```rust
#![deny(unsafe_code)]
#![no_main]
#![no_std]

use aux5::{entry, prelude::*, Delay, Leds};

#[entry]
fn main() -> ! {
    let (mut delay, mut leds): (Delay, Leds) = aux5::init();

    let ms = 50_u8;
    loop {
        for curr in 0..8 {
            let next = (curr + 1) % 8;

            leds[next].on();
            delay.delay_ms(ms);
            leds[curr].off();
            delay.delay_ms(ms);
        }
    }
}
```

还有一件事！在“发布”模式下编译时，检查您的解决方案是否也有效：

```bash
$ cargo build --target thumbv7em-none-eabihf --release
```

您可以使用此`gdb`命令对其进行测试：

```bash
$ # or, you could simply call `cargo run --target thumbv7em-none-eabihf --release`
$ arm-none-eabi-gdb target/thumbv7em-none-eabihf/release/led-roulette
$ #                                              ~~~~~~~
```

二进制大小是我们应该始终关注的事情！你的解决方案有多大？您可以使用发布二进制文件上的`size`命令检查：

```bash
$ # equivalent to size target/thumbv7em-none-eabihf/debug/led-roulette
$ cargo size --target thumbv7em-none-eabihf --bin led-roulette -- -A
led-roulette  :
section               size        addr
.vector_table          392   0x8000000
.text                16404   0x8000188
.rodata               2924   0x80041a0
.data                    0  0x20000000
.bss                     4  0x20000000
.debug_str          602185         0x0
.debug_abbrev        24134         0x0
.debug_info         553143         0x0
.debug_ranges       112744         0x0
.debug_macinfo          86         0x0
.debug_pubnames      56467         0x0
.debug_pubtypes      94866         0x0
.ARM.attributes         58         0x0
.debug_frame        174812         0x0
.debug_line         354866         0x0
.debug_loc             534         0x0
.comment                75         0x0
Total              1993694

$ cargo size --target thumbv7em-none-eabihf --bin led-roulette --release -- -A
led-roulette  :
section              size        addr
.vector_table         392   0x8000000
.text                1826   0x8000188
.rodata                84   0x80008ac
.data                   0  0x20000000
.bss                    4  0x20000000
.debug_str          23334         0x0
.debug_loc           6964         0x0
.debug_abbrev        1337         0x0
.debug_info         40582         0x0
.debug_ranges        2936         0x0
.debug_macinfo          1         0x0
.debug_pubnames      5470         0x0
.debug_pubtypes     10016         0x0
.ARM.attributes        58         0x0
.debug_frame          164         0x0
.debug_line          9081         0x0
.comment               18         0x0
Total              102267
```

> **注意** Cargo项目已配置为使用LTO构建发布二进制文件。

知道如何阅读此输出？`text`部分包含程序指令。在我的情况下，它大约是2KB。另一方面，`data`和`bss`部分包含在RAM中静态分配的变量（`static`变量）。一个`static`变量在`aux5::init`中使用;这就是它显示4个字节的`bss`的原因。

最后一件事！我们一直在GDB中运行我们的程序，但我们的程序根本不依赖于GDB。你可以确认关闭GDB和OpenOCD，然后按下电路板上的黑色按钮重置电路板。 LED轮盘应用程序将在没有GDB干预的情况下运行。
