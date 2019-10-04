
# 见识硬件

让我们熟悉一下我们将要使用的硬件。

## STM32F3DISCOVERY（“F3”）
![F3](https://rust-embedded.github.io/discovery/assets/f3.jpg)

我们在本书中将此板称为“F3”。

这块板包含什么？

- 一个STM32F303VCT6微控制器。这个微控制器有

 + 单核ARM Cortex-M4F处理器，支持单精度浮点运算，最大时钟频率为72 MHz。
 + 256 KiB的“闪存”存储。 （1 KiB = 1024字节）
 + 内存48 KiB。
 + 许多“外设”：定时器，GPIO，I2C，SPI，USART等。
 + 许多“引脚”暴露在两个横向边沿处。
 + **重要事项** 该微控制器工作在（大约）3.3V。

- 加速度计和磁力计。
- 陀螺仪。
- 8个LED以罗盘的形状排列
- 第二个微控制器：STM32F103CBT。该微控制器实际上是一个名为ST-LINK的板载编程器和调试器的一部分，并连接到名为“USB ST-LINK”的USB端口。
- 还有第二个USB端口，标记为“USB USER”，连接到主微控制器STM32F303VCT6，可用于应用程序。

## 串行模块
![串口模块](https://rust-embedded.github.io/discovery/assets/serial.jpg)

我们将使用此模块在F3中的微控制器和笔记本电脑之间交换数据。此模块将使用USB电缆连接到您的笔记本电脑。在这一点上我不会多说。

## 蓝牙模块
![HC-05蓝牙模块](https://rust-embedded.github.io/discovery/assets/bluetooth.jpg)

该模块与串行模块的用途完全相同，但它通过蓝牙而不是USB发送数据。

> 源：[README.md](https://github.com/rust-embedded/discovery/blob/master/src/04-meet-your-hardware/README.md) &nbsp; Commit: f7537ca4e0390df871086ada001b7d1804db3c0b
