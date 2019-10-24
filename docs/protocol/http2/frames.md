# HTTP帧

一旦建立了HTTP/2连接，端点之间就能开始交换帧了。

## 帧格式

所有的帧都以固定的9字节的首部开始，后面接可变长度的有效载荷。

```text
 +-----------------------------------------------+
 |                 Length (24)                   |
 +---------------+---------------+---------------+
 |   Type (8)    |   Flags (8)   |
 +-+-------------+---------------+-------------------------------+
 |R|                 Stream Identifier (31)                      |
 +=+=============================================================+
 |                   Frame Payload (0...)                      ...
 +---------------------------------------------------------------+
                        图 1：帧格式
```

帧首部字段定义如下：

* **Length:** 帧有效载荷的长度，以24位无符号整数表示。除非接收端通过SETTINGS\_MAX\_FRAME\_SIZE设置了更大的值，否则不能发送Length值大于2^14 (16,384)的帧。

  帧首部的9字节长度不计入该值。

* **Type:** 8bit的帧类型。帧类型决定了帧的格式和语义。必须忽略和丢弃任何未知的帧类型。
* **Flags:** 为帧类型保留的8bit布尔标识字段。

    针对确定的帧类型赋予标识特定的语义。与确定的帧类型语义不相符的标识必须被忽略，并且在发送时必须是未设置的(0x0)。

* **R:** 1bit的保留字段。未定义该bit的语义。当发送时，该bit必须是未设置的(0x0)；当接收时，必须忽略该bit。
* **Stream Identifier:** 流标识符(参见 [5.1.1节](https://httpwg.github.io/specs/rfc7540.html#StreamIdentifiers) )是一个31bit的无符号整数。值0x0是保留的，表明帧是与整体的连接相关的，而不是和单独的流相关。

帧有效载荷结构和内容完全取决于帧类型。

## 帧大小

帧有效载荷的大小不能超过接收端通过 [SETTINGS\_MAX\_FRAME\_SIZE](https://httpwg.github.io/specs/rfc7540.html#SETTINGS_MAX_FRAME_SIZE) 所告知的值。该值可以取2^14 (16,384)和2^24-1 (16,777,215)之间的任何值，包括2^24-1 (16,777,215)。

所有的实现都必须能接收，并且处理最小长度为2^14 字节、外加9字节帧首部( [4.1节](https://httpwg.github.io/specs/rfc7540.html#FrameHeader) )的帧。当描述帧大小时，不包括帧首部的大小。

注意：某些帧类型，如PING( [6.7节](https://httpwg.github.io/specs/rfc7540.html#PING) )帧，对允许的有效载荷数据量强加了额外的限制。

如果一个帧超出了 [SETTINGS\_MAX\_FRAME\_SIZE](https://httpwg.github.io/specs/rfc7540.html#SETTINGS_MAX_FRAME_SIZE) 设置的大小，或者超出了任何为该帧类型设定的限制，或者帧太小而无法包含强制性的帧数据，端点必须发送一个 [FRAME\_SIZE\_ERROR](https://httpwg.github.io/specs/rfc7540.html#FRAME_SIZE_ERROR) 错误码。必须将可以改变整个连接状态的帧大小错误处理为连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )，这包括所有携带首部块( [4.3节](https://httpwg.github.io/specs/rfc7540.html#HeaderBlock) )的帧(即，[HEADERS](https://httpwg.github.io/specs/rfc7540.html%23HEADERS) ，[PUSH\_PROMISE](https://httpwg.github.io/specs/rfc7540.html%23PUSH_PROMISE) 和 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html%23CONTINUATION) ) ，[SETTINGS](https://httpwg.github.io/specs/rfc7540.html#SETTINGS) 帧，和所有流标识符为0的帧。

端点不必用掉帧的所有可用空间。如果帧大小小于允许的最大值，可以改善响应性能。发送大的帧会导致时间敏感的帧(如，[RST\_STREAM](https://httpwg.github.io/specs/rfc7540.html%23RST_STREAM) ，[WINDOW\_UPDATE](https://httpwg.github.io/specs/rfc7540.html%23WINDOW_UPDATE) ，或 [PRIORITY](https://httpwg.github.io/specs/rfc7540.html#PRIORITY) )发送延迟，这些帧如果被大帧阻塞住了，会影响性能。

## 首部压缩与解压缩

正如在HTTP/1里那样，HTTP/2里的首部字段也是一个键具有一个或多个值。这些首部字段用于HTTP请求和响应消息，也用于服务端推送操作( [8.2节](https://httpwg.github.io/specs/rfc7540.html#PushResources) )。

首部列表是零个或多个首部字段的集合。当通过连接传送时，首部列表被 [HTTP首部压缩](https://httpwg.github.io/specs/rfc7540.html#COMPRESSION) *[COMPRESSION]*序列化成首部块。然后，序列化的首部块又被划分成一个或多个叫做首部块片段的字节序列，并通过HEADERS( [6.2节](https://httpwg.github.io/specs/rfc7540.html#HEADERS) )、PUSH\_PROMISE( [6.6节](https://httpwg.github.io/specs/rfc7540.html#PUSH_PROMISE) )，或者CONTINUATION( [6.10节](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) )帧的有效负载传送。

[Cookie首部字段](https://httpwg.github.io/specs/rfc7540.html#COOKIE) *[COOKIE]* 需要HTTP映射特殊对待(参见 [8.1.2.5节](https://httpwg.github.io/specs/rfc7540.html#CompressCookie) )。

接收端连接片段重组首部块，然后解压首部块重建首部列表。

一个完整的首部块包括以下二者之一：

* 一个单独的、设置了END\_HEADERS标识的 [HEADERS](https://httpwg.github.io/specs/rfc7540.html#HEADERS) 或 [PUSH\_PROMISE](https://httpwg.github.io/specs/rfc7540.html#PUSH_PROMISE) 帧，或者
* 一个单独的、清除了END\_HEADERS标识的 [HEADERS](https://httpwg.github.io/specs/rfc7540.html#HEADERS) 或 [PUSH\_PROMISE](https://httpwg.github.io/specs/rfc7540.html#PUSH_PROMISE) 帧，并有一个或多个 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) 帧，且最后一个 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) 帧设置了END\_HEADERS标识。

首部压缩是有状态的。一个连接具有一个压缩上下文和一个解压缩上下文。必须将首部块解码错误当做类型为 [COMPRESSION\_ERROR](https://httpwg.github.io/specs/rfc7540.html#COMPRESSION_ERROR) 的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )处理。

将每个首部块当做离散的单元处理。必须将首部块作为连续的帧序列传送，而没有交错任何其他类型或其他流的帧。[HEADERS](https://httpwg.github.io/specs/rfc7540.html#HEADERS) 或 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) 帧序列的最后一个帧设置END\_HEADERS标识。[PUSH_PROMISE](https://httpwg.github.io/specs/rfc7540.html#PUSH_PROMISE) 或 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) 帧序列的最后一个帧设置END\_HEADERS标识。这让首部块在逻辑上等价于一个单独的帧。

首部块片段只能作为 [HEADERS](https://httpwg.github.io/specs/rfc7540.html%23HEADERS) 、[PUSH\_PROMISE](https://httpwg.github.io/specs/rfc7540.html#PUSH_PROMISE) ，或 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html%23CONTINUATION) 帧的有效载荷进行传送，因为这些帧携带的数据能修改接收端维护的压缩上下文。即使收到要被丢弃的 [HEADERS](https://httpwg.github.io/specs/rfc7540.html%23HEADERS) 、[PUSH\_PROMISE](https://httpwg.github.io/specs/rfc7540.html#PUSH_PROMISE) ，或 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html%23CONTINUATION) 帧，接收端点也需要重组首部块并解压。如果接收端不解压首部块，它必须用类型为 [COMPRESSION\_ERROR](https://httpwg.github.io/specs/rfc7540.html#COMPRESSION_ERROR) 的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )终止连接。
