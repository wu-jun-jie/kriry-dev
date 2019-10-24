# HTTP2

HTTP/2是运行于TCP连接( [*[TCP]*](https://httpwg.github.io/specs/rfc7540.html#TCP) )之上的应用层协议。客户端是TCP连接的发起者。

HTTP/2使用与HTTP/1.1相同的URI方案"http"和"https"，共享同样的默认端口号："http"的80端口和"https"的443端口。因此，在处理对例如http://example.org/foo 或 https://example.com/bar 目标资源URIs的请求前，需要首先确定上游服务端(当前客户端希望直接与之建立连接的对端)是否支持HTTP/2。

检测"http"和"https"的URIs是否支持HTTP/2的方法是不一样的。检测"http"的URIs在3.2节中描述。检测"https"的URIs在3.3节中描述。

## HTTP/2版本标识

本文档定义的协议有两个标识符：

* 字符串"h2"表示HTTP/2协议使用了 [安全传输层协议(TLS)](https://httpwg.github.io/specs/rfc7540.html#TLS12) *[TLS12]*。该标识符用在 [TLS应用层协议协商(ALPN)扩展](https://httpwg.github.io/specs/rfc7540.html#TLS-ALPN) *[TLS-ALPN]*字段，以及任何在TLS之上运行HTTP/2的场合。

  "h2"字符串被序列化成一个ALPN协议标识符，其形式是两个字节的序列：0x68，0x32。

* 字符串"h2c"表示HTTP/2协议运行在明文TCP上。该标识符用在HTTP/1.1的Upgrade首部字段，以及任何在TCP之上运行HTTP/2的场合。

  "h2c"字符串是ALPN标识符空间预留的，但是用来表示不使用TLS的协议。

"h2"或"h2c"协商需要用到本文档里描述的传输层、安全、帧和消息语义等概念。

## 为"http" URIs启用HTTP/2协议

事先不知道下一跳是否支持HTTP/2的客户端，使用HTTP的Upgrade机制( [*[RFC7230]*](https://httpwg.github.io/specs/rfc7540.html#RFC7230) 的 [6.7节](https://httpwg.github.io/specs/rfc7230.html#header.upgrade) )发起"http"URI请求。其做法是：客户端先发起HTTP/1.1请求，该请求包含值为"h2c"的Upgrade首部字段，还必须包含一个HTTP2-Settings( [3.2.1节](https://httpwg.github.io/specs/rfc7540.html#Http2SettingsHeader) )首部字段。

例如：

```text
GET / HTTP/1.1
Host: server.example.com
Connection: Upgrade, HTTP2-Settings
Upgrade: h2c
HTTP2-Settings: <base64url encoding of HTTP/2 SETTINGS payload>
```

在客户端能发送HTTP/2帧之前，包含负载的请求必须全部被发送。这意味着一个大的请求能阻塞连接的使用，直到其全部被发送完毕。

如果一个初始请求的后续并发请求很重要，那么可以使用OPTIONS请求来执行升级到HTTP/2的操作，代价是一个额外的往返。

不支持HTTP/2的服务端对请求进行响应时可以忽略Upgrade首部字段：

```text
HTTP/1.1 200 OK
Content-Length: 243
Content-Type: text/html
...
```

服务端必须忽略值为"h2"的Upgrade首部字段。"h2"字段表示HTTP/2使用了TLS，其协商方法在 [3.3节](https://httpwg.github.io/specs/rfc7540.html#discover-https) 中描述。

支持HTTP/2的服务端返回101(Switching Protocols)响应，表示接受升级协议的请求。在结束101响应的空行之后，服务端可以开始发送HTTP/2帧。这些帧必须包含一个对升级请求的响应。

例如：

```text
HTTP/1.1 101 Switching Protocols
Connection: Upgrade
Upgrade: h2c

[ HTTP/2 connection ...
```

服务端发送的第一个HTTP/2帧必须是由一个 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) 帧( [6.5节](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) )组成的服务端连接前奏( [3.5节](https://httpwg.github.io/specs/rfc7540.html#ConnectionHeader) )。客户端一收到101响应，也必须发送一个包含 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) 帧的连接前奏( [3.5节](https://httpwg.github.io/specs/rfc7540.html#ConnectionHeader) )。

升级之前发送的HTTP/1.1请求被分配一个流标识符1 (参见 [5.1.1节](https://httpwg.github.io/specs/rfc7540.html#StreamIdentifiers) )，并被赋予默认优先级值( [5.3.5节](https://httpwg.github.io/specs/rfc7540.html#pri-default) )。流1暗示从客户端到服务端(参见 [5.1节](https://httpwg.github.io/specs/rfc7540.html#StreamStates) )是半关闭的，因为作为HTTP/1.1请求它已经完成了。HTTP/2连接开始后，流1用于响应。

## HTTP2-Settings首部字段

从HTTP/1.1升级到HTTP/2的请求必须确切地包含一个HTTP2-Settings首部字段。HTTP2-Settings首部字段是一个专用于连接的首部字段，它包含管理HTTP/2连接的参数，其前提是假设服务端会接受升级请求。

```text
HTTP2-Settings    = token68
```

如果该首部字段没有出现，或者出现了不止一个，那么服务端一定不要把连接升级到HTTP/2。服务端一定不要发送该首部字段。

HTTP2-Settings首部字段的值是 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) 帧 ([6.5节](https://httpwg.github.io/specs/rfc7540.html#SETTINGS)) 的有效载荷被编码成的base64url串(即，[*[RFC4648]*](https://httpwg.github.io/specs/rfc7540.html#RFC4648) 的 [第5节](https://tools.ietf.org/html/rfc4648#section-5) 描述的URL-和文件名安全Base64编码，忽略任何拖尾'='字符)。[ABNF](https://httpwg.github.io/specs/rfc7540.html#RFC5234) *[RFC5234]* 产生token68在 [*[RFC7235]*](https://httpwg.github.io/specs/rfc7540.html#RFC7235) 的 [2.1节](https://httpwg.github.io/specs/rfc7235.html#challenge.and.response)有定义。

因为升级操作只适用于相邻端点的直连，发送HTTP2-Settings首部字段的客户端也必须在发送的Connection首部字段值里加上HTTP2-Settings选项，以阻止它被转发(参见 [*[RFC7230]*](https://httpwg.github.io/specs/rfc7540.html#RFC7230) 的 [6.1节](https://httpwg.github.io/specs/rfc7230.html%23header.connection) )。

就像对其他的 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) 帧那样，服务端对这些值进行解码和解释。没有必要对这些设置( [6.5.3节](https://httpwg.github.io/specs/rfc7540.html#SettingsSync) )进行显示的确认，因为101响应就相当于隐式的确认。在收到服务端发送的帧之前，客户端有机会在升级请求的这些值里提供一些参数。

## 为 https, URIs启用HTTP/2协议

客户端对"https" URI发起请求时使用带有 [应用层协议协商(ALPN)扩展](https://httpwg.github.io/specs/rfc7540.html#TLS-ALPN) 的 [TLS](https://httpwg.github.io/specs/rfc7540.html#TLS12) *[TLS12]*。

运行在TLS之上的HTTP/2使用"h2"协议标识符。此时，客户端不能发送"h2c"协议标识符，服务端也不能选择"h2c"协议标识符；"h2c"协议标识符表示HTTP/2不使用TLS。

一旦TLS协商完成，客户端和服务端都必须发送一个连接前奏( [3.5节](https://httpwg.github.io/specs/rfc7540.html#ConnectionHeader) )。

## 先知情况下启用HTTP/2

客户端可以通过其他方式了解服务端是否支持HTTP/2。例如，[*[ALT-SVC]*](https://httpwg.github.io/specs/rfc7540.html#ALT-SVC) 描述了一种通知支持HTTP/2的机制。

客户端必须先向这种服务端发送连接前奏( [3.5节](https://httpwg.github.io/specs/rfc7540.html#ConnectionHeader) )，然后可以立即发送HTTP/2帧。服务端能通过连接前奏识别出这种连接。这只影响基于明文TCP建立的HTTP/2连接。基于TLS的HTTP/2实现必须使用TLS中的协议协商*[TLS-ALPN]*。

同样，服务端也必须发送一个连接前奏( [3.5节](https://httpwg.github.io/specs/rfc7540.html#ConnectionHeader) )。

没有额外的参考信息，某个服务端先前支持HTTP/2并不能表明它在以后的连接中仍会支持HTTP/2。例如，可能服务端配置改变了，或者集群中不同服务器的配置有差异，或者网络状况改变了。

##  HTTP/2连接前奏

在HTTP/2中，要求两端都要发送一个连接前奏，作为对所使用协议的最终确认，并确定HTTP/2连接的初始设置。客户端和服务端各自发送不同的连接前奏。

客户端连接前奏以一个24字节的序列开始，用十六进制表示为：

```text
0x505249202a20485454502f322e300d0a0d0a534d0d0a0d0a
```

即，连接前奏以字符串"PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n"开始。这个序列后面必须跟一个可以为空的 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) 帧( [6.5节](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) )。客户端一收到101(Switching Protocols)响应(表示成功升级)后，就立即发送客户端连接前奏，或者将其作为TLS连接的第一批应用程序数据字节。如果在预先知道服务端支持HTTP/2的情况下启用HTTP/2连接，客户端连接前奏在连接建立时发送。

注意：客户端连接前奏是专门挑选的，目的是为了让大部分HTTP/1.1或HTTP/1.0服务器和中介不会试图处理后面的帧，但这并没有解决在 [*[TALKING]*](https://httpwg.github.io/specs/rfc7540.html#TALKING) 中提出的问题。

服务端连接前奏包含一个可能为空的 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) 帧( [6.5节](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) )，它必须由服务端在HTTP/2连接中首先发送。

在发送完本端的连接前奏之后，必须对收到的作为对端连接前奏一部分的 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html%23SETTINGS) 帧进行确认(参见 [6.5.3节](https://httpwg.github.io/specs/rfc7540.html#SettingsSync) )。

为了避免不必要的延迟，允许客户端发送完连接前奏后就立即向服务端发送其他的帧，而不必等待服务端的连接前奏。不过需要注意的是，服务端连接前奏的 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html%23SETTINGS) 帧中可能包含一些期望客户端如何与服务端进行通信所必须修改的参数。在收到这些 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html%23SETTINGS) 帧以后，客户端应当遵守所有设置的参数。在某些配置中，服务端是可以在客户端发送额外的帧之前传送 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html%23SETTINGS) 帧的，这样就避免前边所说的问题。

客户端和服务端都必须将无效的连接前奏处理为连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )，错误类型为 [PROTOCOL_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR) 。在这种情况下，可以忽略 [GOAWAY](https://httpwg.github.io/specs/rfc7540.html#GOAWAY) 帧( [6.8节](https://httpwg.github.io/specs/rfc7540.html#GOAWAY) )，因为无效的连接前奏表示对端并没有使用HTTP/2。