# 配置

## 基本

Riker使用两个配置文件使配置变得简单：

* 可以修改riker.toml来改变Riker和各种模块的行为
* app。*，例如app.toml或app.yml，用于特定于应用程序的设置

配置基于`Config` crate，意味着该crate支持的任何格式都可用于应用程序设置。

当系统启动时，riker.toml被加载，如果存在应用程序配置文件，它将合并到一个Config实例中。 这样可以将设置与维护和CI / CD分开，但可以在运行时统一使用。

可以通过ActorSystem实例访问Config实例，例如：

```rust
let myval = sys.config().get_str("app.myval").unwrap();
```

```rust
[app]
myval = "five by five"
```

## 文件路径

默认情况下，Riker在config目录中查找相对于当前执行目录的riker.toml和app。*。

将config目录放在Rust应用程序的根目录中，即与src处于同一级别，这是标准做法。 这样，货物运行和货物测试将使用位于配置中的文件。

## 最佳实践

### 默认值

不鼓励使用默认值。如果配置文件中缺少某个设置，最好让.unwrap（）发生恐慌而不是在代码中使用隐藏的默认设置。这清楚地说明了正在使用的设置以及运行时没有意外行为。最好不要运行，而不是使用可能很危险的设置运行。

### 使用.config（）

在功能签名方面，强烈建议不要传递Config实例。它不仅速度慢，而且能够理解功能难以实现的功能。最好在应用程序的早期从配置中提取值，然后将它们传递给函数。如果要将许多设置传递给函数，则可以使用专用设置结构。

### 模块设置

建议重用模块的标准节名称。例如，如果您有自定义日志记录模块，则在riker.toml中使用[log]。这使人们更容易根据模块行为找到这些设置。

```toml
[persistence]
redis_url = "tcp://127.0.0.1"
resis_pwd = "password123"
```

或者

```toml
[persistence]
redis = { url = "tcp://127.0.0.1", pwd = "password123" }
```