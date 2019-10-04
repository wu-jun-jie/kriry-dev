# 日志

Riker提供开箱即用的日志记录，它构建在Log crate日志记录外观之上。 记录器模块在actor系统启动期间启动，制作日志宏，例如info！，debug！，错误！ 在ActorSystem :: new之后立即可用：

```rust
#[macro_use]
extern crate log;

let sys = ActorSystem::new().unwrap();
info!("My first log message!");
```

唯一的要求是将Log crate导入您的应用程序。

## 基本日志级别

基本日志级别是日志包的宏确定是忽略消息还是将其转发到记录器模块的级别。 这是在riker.toml中配置的：

```toml
[log]
level = "debug"
```

## 默认日志

日志消息将路由到模型中配置的日志记录模块。 本页的其余部分主要是指默认的Riker记录器，即riker-logger crate。

由于默认记录器是一个actor，因此日志消息以非阻塞方式同时处理。 这意味着减少了登录应用程序响应时间的影响。

默认记录器具有以下功能：

* 日志条目格式可使用命名参数进行配置
* 可以配置日期和时间格式
* 可以在模块级别进一步过滤日志条目
* 可以配置可选过滤器以省略某些模块的日志

我们来看看riker.toml中的示例日志配置：

```toml
[log]
# max level to log
level = "debug"

# Uncomment this to enable filters on the logger.  The {module} field
# of every log line will be checked, and if the {module} field contains
# any item in this list, the entire log line will be omitted from the
# logging output.
#
# This example will omit any logging output from any module with
# "test" in the name and any module whose name contains "debug".
#
filter = [ "test", "debug" ]

# log format to use
# correlates to format!(log_format, date=, time=, level=, module=, body=);
# since named parameters are used the order of the fields is flexible
# the formatting of each field can be changed also
# e.g. to completely hide a field: {module:.0}
# See: https://doc.rust-lang.org/std/fmt/#syntax

# {date}    the calendar day
# {time}    the calendar time
# {level}   the level for the entry
# {module}  the module path originating the entry
# {body}    the message body
log_format = "{date} {time} {level} [{module}] {body}"
date_format = "%Y-%m-%d"
time_format = "%H:%M:%S%:z"
```

此配置将生成格式为的日志条目：

```ruat
2018-06-11 08:31:58+00:00 DEBUG [riker::system::system] Actor system started
2018-06-11 08:31:58+00:00 DEBUG [main] My first log message!
```

以及原本打印的日志行：

```text
2018-06-11 08:31:58+00:00 DEBUG [testSystem] A test line which should be filtered out!
2018-06-11 08:31:58+00:00 DEBUG [debug] A debugger module's log message
```

将从日志输出中省略.