# 概述

针对HTTP语义，HTTP/2提供了一种优化的传输机制。HTTP/2支持HTTP/1.1所有的核心特性，但在一下几个方面更有效率。

帧( [4.1节](https://httpwg.github.io/specs/rfc7540.html#FrameHeader) )是HTTP/2里基本的协议单元。每个类型的帧都服务于不同的目的。例如：[HEADERS](https://httpwg.github.io/specs/rfc7540.html#HEADERS) 帧和 [DATA](https://httpwg.github.io/specs/rfc7540.html#DATA) 帧形成了HTTP请求和响应( [8.1节](https://httpwg.github.io/specs/rfc7540.html#HttpSequence) )的主体；其他的诸如 [SETTINGS](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) 、 [WINDOW_UPDATE](https://httpwg.github.io/specs/rfc7540.html#WINDOW_UPDATE) 和 [PUSH_PROMISE](https://httpwg.github.io/specs/rfc7540.html#PUSH_PROMISE) 等帧类型，用来支持HTTP/2的其他特性。

每对HTTP请求/响应的交换都和自己的流( [第5章](https://httpwg.github.io/specs/rfc7540.html#StreamsLayer) )相关联，从而实现了请求的多路复用。流之间是相互独立的，所以阻塞或停止请求或响应不会中断其他的流。

流量控制和优先级机制确保能够高效地利用多路复用的流。流量控制( [5.2节](https://httpwg.github.io/specs/rfc7540.html#FlowControl) )有助于确保只传输接收方能够使用的数据。优先级机制( [5.3节](https://httpwg.github.io/specs/rfc7540.html#StreamPriority) )确保有限的资源首先被用于最重要的流。

HTTP/2增加了一种新的交互模式，即服务器能向客户端推送响应( [8.2节](https://httpwg.github.io/specs/rfc7540.html#PushResources) )。服务器推送功能允许服务器自主地向客户端发送它预期客户端会需要的数据，从而消耗一些网络带宽来取代潜在的网络延迟。服务器先综合一个PUSH\_PROMISE帧携带的请求，然后在一个独立的流上发送响应。

因为连接中使用的HTTP首部字段包含了大量的冗余数据，所以包含这些首部的帧都被压缩了( [4.3节](https://httpwg.github.io/specs/rfc7540.html#HeaderBlock) )。一般情况下，请求能显著地被压缩，从而允许多个请求被压缩到一个包里.

## 文档结构

HTTP/2规范分为四个部分：

* 开始HTTP/2一节( [第3章](https://httpwg.github.io/specs/rfc7540.html#starting) )涵盖了怎样初始化一个HTTP/2连接。
* 帧层( [第4章](https://httpwg.github.io/specs/rfc7540.html#FramingLayer) )和流层( [第5章](https://httpwg.github.io/specs/rfc7540.html#StreamsLayer) )两章描述了HTTP/2帧怎样被构造并形成多路复用的流。
* 帧定义( [第6章](https://httpwg.github.io/specs/rfc7540.html#FrameTypes) )和错误定义( [第7章](https://httpwg.github.io/specs/rfc7540.html#ErrorCodes) )包含了HTTP/2的帧和错误类型的细节。
* HTTP映射( [第8章](https://httpwg.github.io/specs/rfc7540.html#HTTPLayer) )与附加要求( [第9章](https://httpwg.github.io/specs/rfc7540.html#HttpExtra) )描述了HTTP语义是怎样用帧和流来表达的。

尽管一些帧和流层的概念与HTTP是相脱离的，但本规范没有定义一个完全通用的帧层。这些帧和流层是根据HTTP协议和服务端推送的需求量身定制的。

## 约定和术语

本文档中出现的关键词"MUST","MUST NOT","REQUIRED","SHALL","SHALL NOT","SHOULD","SHOULD NOT","RECOMMENDED","MAY",和"OPTIONAL"在RFC 2119 [ *[RFC2119]*](https://httpwg.github.io/specs/rfc7540.html#RFC2119) 中有解释。

所有数值都以网络字节序表示。除非另有说明，否则数值都是无符号的。视情况以十进制或十六进制表示字面值。十六进制值带有0x前缀，以和十进制值区分开。

文中使用的术语包括：

* **客户端：** 发起HTTP/2连接的端点。客户端发送HTTP请求，并接收HTTP响应。
* **连接：** 两个端点之间的传输层连接。
* **连接错误：** 影响整个HTTP/2连接的错误。
* **端点：** 连接中的客户端或服务器。
* **帧：** HTTP/2连接中的最小通信单元，由首部和可变长度的字节序列组成，其结构取决于帧类型。
* **对端：** 一个端点。当讨论一个特定的端点时，『对端』指的是其远程端点。
* **接收端：** 接收帧的端点。
* **发送端：** 发送帧的端点。
* **服务端：** 接受HTTP/2连接请求的端点。服务端接收HTTP请求，并发送HTTP响应。
* **流：** HTTP/2连接中的双向帧传输流。
* **流错误：** 发生在单独的HTTP/2流上的错误。

最后，『网关』、『中介』、『代理』和『隧道』等术语都在 [*[RFC 7230]*](https://httpwg.github.io/specs/rfc7540.html#RFC7230) 的 [2.3节](https://httpwg.github.io/specs/rfc7230.html#intermediaries) 中有定义。在不同的时候，中介既可以是客户端，又可以是服务端。

术语『有效载荷体』在 [*[RFC 7230]*](https://httpwg.github.io/specs/rfc7540.html#RFC7230) 的 [3.3节](https://httpwg.github.io/specs/rfc7230.html#message.body) 中有定义。