# 额外的HTTP要求考虑

该部分概述的HTTP协议特性，有助于改善互操作性，减少曝光已知的安全薄弱点，或者减少潜在的实施变量。

## 连接管理

HTTP/2连接是持久连接。为了获得最佳性能，人们期望客户端不要关闭连接，直到确定不需要再继续和服务端进行通信(例如，当用户离开一个特定的web页面时)，或者直到服务端关闭连接。

对于给定的一对主机和端口，客户端应该只打开一个 HTTP/2 连接，其中主机或者来自于一个 URI ，一种选定的 [可替换的服务](http://httpwg.org/specs/rfc7540.html#ALT-SVC) *[ALT-SVC]* ，或者来自于一个已配置的代理。

客户端可以创建额外的连接作为替补，或者用来替换将要耗尽可用流标识符空间( [5.1.1节](http://httpwg.org/specs/rfc7540.html#StreamIdentifiers) )的连接，为一个 TLS 连接刷新关键资料，或者用来替换遇到错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )的连接。

客户端可以和相同的 IP 地址和 TCP 端口建立多个连接，这些地址和端口使用不同的[服务器名称指示](http://httpwg.org/specs/rfc7540.html#TLS-EXT) *[TLS-EXT]* 值，或者提供不同的 TLS 客户端证书。但是应该避免使用相同的配置创建多个连接。

鼓励服务端尽可能长地维持打开的连接，但是准许服务端在必要时可以关闭空闲的连接。当任何一端选择关闭传输层 TCP 连接时，主动关闭的一端应该先发送一个 [GOAWAY](http://httpwg.org/specs/rfc7540.html#GOAWAY) 帧( [6.8节](http://httpwg.org/specs/rfc7540.html#GOAWAY) )，这样两端都可以确定地知道先前发送的帧是否已被处理，并且优雅地完成或者终结任何剩下的必要任务.
