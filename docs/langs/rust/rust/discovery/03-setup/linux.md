# Linux

> 源：[linux.md](https://github.com/rust-embedded/discovery/blob/master/src/03-setup/linux.md) &nbsp; Commit: 7a9500e0f525d76e1f0741ea912af9ca81d4eedd

以下是一些Linux发行版的安装命令。

## 需要的包

Ubuntu 16.04或更新版/ Debian Jessie或更新版本

$ sudo apt-get install \
  gdb-arm-none-eabi \
  minicom \
  openocd
Fedora 23或更新版本

$ sudo dnf install \
  arm-none-eabi-gdb \
  minicom \
  openocd
Arch Linux

$ sudo pacman -S \
  arm-none-eabi-gdb \
  minicom \
  openocd
arm-none-eabi-gdb 对于其他发行版
对于没有ARM预构建工具链包的发行版，请下载“Linux 64位”文件并将其bin目录放在路径上。这是一种方法：


$ mkdir -p ~/local && cd ~/local
$ tar xjf /path/to/downloaded/file/gcc-arm-none-eabi-7-2017-q4-major-linux.tar.bz2.tbz
然后，使用您选择的编辑器PATH在适当的shell init文件中附加到您的文件中（例如~/.zshrc或~/.bashrc）：


PATH=$PATH:$HOME/local/gcc-arm-none-eabi-7-2017-q4-major/bin

## 可选包

Ubuntu / Debian

$ sudo apt-get install \
  bluez \
  rfkill
Fedora的

$ sudo dnf install \
  bluez \
  rfkill
Arch Linux

$ sudo pacman -S \
  bluez \
  bluez-utils \
  rfkill

## udev规则

这些规则允许您使用没有root权限的F3和Serial模块等USB设备，即 sudo。

/etc/udev/rules.d使用下面显示的内容创建这两个文件。

```bash
$ cat /etc/udev/rules.d/99-ftdi.rules
```

```bash
# FT232 - USB <-> Serial Converter
ATTRS{idVendor}=="0403", ATTRS{idProduct}=="6001", MODE:="0666"
```

```bash
$ cat /etc/udev/rules.d/99-openocd.rules
```

```bash
# STM32F3DISCOVERY rev A/B - ST-LINK/V2
ATTRS{idVendor}=="0483", ATTRS{idProduct}=="3748", MODE:="0666"

# STM32F3DISCOVERY rev C+ - ST-LINK/V2-1
ATTRS{idVendor}=="0483", ATTRS{idProduct}=="374b", MODE:="0666"
```

然后使用以下命令重新加载udev规则：

```bash
$ sudo udevadm control --reload-rules
```

如果您的笔记本电脑上插有任何电路板，请将其拔下，然后重新插入。
