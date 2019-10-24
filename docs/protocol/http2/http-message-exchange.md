# HTTP消息交换

HTTP/2需要和当前使用的HTTP尽可能地兼容。这意味着，从应用程序的角度来看，大部分的协议特性不变。尽管表达这些语义的语法已经改变，为了达到这个目的，所有请求和响应的语义都被保留。

这样，HTTP/1.1的语义和内容 [*[RFC7231]*](http://httpwg.org/specs/rfc7540.html#RFC7231)、条件请求 [*[RFC7232]*](http://httpwg.org/specs/rfc7540.html#RFC7232)、范围请求 [*[RFC7233]*](http://httpwg.org/specs/rfc7540.html#RFC7233)、缓存 [*[RFC7234]*](http://httpwg.org/specs/rfc7540.html#RFC7234) 和 认证 [*[RFC7235]*](http://httpwg.org/specs/rfc7540.html#RFC7235) 的协议规范和要求也适用于HTTP/2。HTTP/1.1消息语法和路由 [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230) 选择的部分，如HTTP和HTTPS URI方案，也适用于HTTP/2，但是那些语义在HTTP/2协议中的表达在下面的章节有定义。

## HTTP Request/Response Exchange

客户端在一个新流上发送一个HTTP请求，该新流使用了先前未使用的流标识符( [5.1.1节](http://httpwg.org/specs/rfc7540.html#StreamIdentifiers) )。服务端在同样的流上发送一个HTTP响应。

一个HTTP消息(请求或响应)包括：

1. 仅仅对响应而言，零个或多个 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧(每个后面跟随零个或多个 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧)，这些帧包含信息性(1xx)HTTP响应的消息首部(参见 [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230)，[3.2节](http://httpwg.org/specs/rfc7230.html#header.fields)，和 [*[RFC7231]*](http://httpwg.org/specs/rfc7540.html#RFC7231)，[6.2节](http://httpwg.org/specs/rfc7231.html#status.1xx))，
2. 一个包含消息首部(参见 [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230), [3.2节](http://httpwg.org/specs/rfc7230.html#header.fields))的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧(后面跟随零个或多个 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧)，
3. 包含负载体(参见 [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230)，[3.3节](http://httpwg.org/specs/rfc7230.html#message.body))的零个或多个 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧，和
4. 可选地，一个 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧，后面跟随零个或多个 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧，如果有(参见 [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230)，[4.1.2节](http://httpwg.org/specs/rfc7230.html#chunked.trailer.part))，也包括拖挂部分。

序列的最后一帧带有END\_STREAM标志，注意带有END\_STREAM标志的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧后面可以跟装载首部块剩余部分的 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧。

无论是来自哪个流的其它的帧都不能出现在 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧和后面可能跟随的 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧之间。

HTTP/2使用DATA帧来传送消息负载。[*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230) [4.1节](http://httpwg.org/specs/rfc7230.html#chunked.encoding) 定义的分块传输编码不能在HTTP/2中使用。

拖尾首部字段在终结流的首部块里传送。这样的首部块是一个序列，从一个 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧开始，后跟零个或多个 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧，其中 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧携带一个END\_STREAM标志。没有终结流的首部块之后的首部块不属于HTTP请求或响应的一部分。

[HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧(和相关联的 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧)只能出现在流的开始或结束。如果端点在收到一个最终的(非信息性的)状态码以后又收到一个没有设置END\_STREAM标志的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧，必须将相应的请求或响应当做是有缺陷的( [8.1.2.6节](http://httpwg.org/specs/rfc7540.html#malformed) )。

一个完整的HTTP请求/响应交换流程需要消耗单独的一个流。请求从 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧开始，将流置于 打开(open) 状态。请求以携带END\_STREAM标志的帧结束，从而对客户端来说，流进入 半关闭(本地)(half-closed (local)) 状态，对服务端来说，流进入 半关闭(远端)(half-closed (remote)) 状态。响应从一个 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧开始，以一个携带END\_STREAM标志的帧结束，然后流进入 关闭(closed) 状态。

服务端发送或者客户端接收一个设置了END\_STREAM标志的帧(包括任何传送完成首部块的 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧)以后，HTTP响应结束。如果响应完全不依赖于还未发送和接收的请求，那么在客户端发送整个请求之前，服务端可以发送一个完整的响应。这种情况下，发送完一个完整的响应(即，携带END\_STREAM标志的帧)以后，通过发送一个错误码为 [NO\_ERROR](http://httpwg.org/specs/rfc7540.html#NO_ERROR) 的 [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 帧，服务端可以要求客户端取消传送请求。尽管客户端总是可以因为其它原因而按自己的意愿丢弃响应，但客户端不能因为收到了这样一个 [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 帧就丢弃响应。

## 从HTTP/2升级

HTTP/2移除了对101(Switching Protocols)信息性状态码( [*[RFC7231]*](http://httpwg.org/specs/rfc7540.html#RFC7231)，[6.2.2节](http://httpwg.org/specs/rfc7231.html#status.101) )的支持。

101(Switching Protocols)的语义不适用于多路复用的协议。替代协议可以使用跟HTTP/2相同的协商机制(参见 [第3章](http://httpwg.org/specs/rfc7540.html#starting))。

## HTTP首部字段

HTTP首部字段以一系列键值对的形式携带信息。登记的HTTP首部列表，可以参考在 <https://www.iana.org/assignments/message-headers> 处维护的"Message Header Field"记录。

像在HTTP/1.x中一样，首部字段名称是ASCII字符串，不区分大小写。但是，在被HTTP/2编码之前，必须将首部字段名称转换成小写的。必须将包含大写首部字段名称的请求或响应看做是畸形的( [8.1.2.6节](http://httpwg.org/specs/rfc7540.html#malformed) )。

## 伪首部字段

HTTP/1.x使用消息起始行( [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230)，[3.1节](http://httpwg.org/specs/rfc7230.html#start.line) )表达目标URI。对于同样的目的，HTTP/2使用以':'字符(ASCII 0x3a)开始的特殊的伪首部字段来表示请求的方法和响应的状态码。

伪首部字段不是HTTP首部字段。端点不能生成本文档定义之外的伪首部字段。

伪首部字段只在它们被定义的上下文中才有效。为请求定义的伪首部字段不能出现在响应中；为响应定义的伪首部字段不能出现在请求中。伪首部字段不能出现在拖尾中。如果请求或响应包含未定义的或无效的伪首部字段，端点必须将该请求或响应看做是有缺陷的( [8.1.2.6节](http://httpwg.org/specs/rfc7540.html#malformed) )。

在首部块中，所有的伪首部字段都必须出现在正常的首部字段之前。如果请求或响应包含的伪首部字段在首部块中位于正常的首部字段之后，必须将该请求或响应看作是有缺陷的( [8.1.2.6节](http://httpwg.org/specs/rfc7540.html#malformed) )。

## 连接专用的首部字段

HTTP/2不使用Connection首部字段来表示连接专用的首部字段；在本协议中，连接专用的元数据通过其他方式来表达。端点不能生成一个包含连接专用首部字段的HTTP/2消息；必须将任何包含连接专用首部字段的消息看做是有缺陷的( [8.1.2.6节](http://httpwg.org/specs/rfc7540.html#malformed) )。

唯一的例外是TE首部字段，它可以出现在HTTP/2请求里，但它的值只能是"trailers"。

这意味着中介将一个HTTP/1.x消息转换成HTTP/2消息时，需要将所有的连接首部字段随同Connection首部字段一起移除。这样的中介也应该移除其他的连接专用首部字段，例如`Keep-Alive`、`Proxy-Connection`、`Transfer-Encoding`和`Upgrade`，即使这些首部字段不是以Connection命名的字段。

注意：HTTP/2有意地不支持通过upgrade首部字段转换到其它协议。[第3章](http://httpwg.org/specs/rfc7540.html#starting) 描述的握手方法协商使用其它替代协议时足够用了。

## 请求的伪首部字段

HTTP/2请求定义了如下伪首部字段：

* `:method` 伪首部字段包含HTTP方法( [*[RFC7231]*](http://httpwg.org/specs/rfc7540.html#RFC7231)，[第4章](http://httpwg.org/specs/rfc7231.html#methods) )。
* `:scheme` 伪首部字段包含目标URI( [*[RFC3986]*](http://httpwg.org/specs/rfc7540.html#RFC3986)，[3.1节](https://tools.ietf.org/html/rfc3986#section-3.1) )的方案部分。

  `:scheme`并不局限于http和https URIs方案。代理或网关可以转化非HTTP方案的请求，从而可以使用HTTP和非HTTP的服务进行交互。

* `:authority`伪首部字段包含目标URI( [*[RFC3986]*](http://httpwg.org/specs/rfc7540.html#RFC3986)，[3.2节](https://tools.ietf.org/html/rfc3986#section-3.2) )的authority部分。authority不能包含http或https URIs方案废弃的用户信息的子组件。

  为了确保HTTP/1.1请求队列可以被精确地复制，当转换具有源或星号形式(参见 [ *[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230), [5.3节](http://httpwg.org/specs/rfc7230.html#request-target) )请求目标的HTTP/1.1请求时，该伪首部字段必须被忽略。直接生成HTTP/2请求的客户端应该使用`:authority`伪首部字段代替Host首部字段。中介将HTTP/2请求转换为HTTP/1.1请求时，如果通过拷贝`:authority`伪首部字段的值，请求里没有出现Host首部字段，就必须创建一个Host首部字段。

* `:path`伪首部字段包含目标URI的path和query部分(绝对路径部分和一个后跟query部分的可选的'?'字符(参见 [*[RFC3986]*](http://httpwg.org/specs/rfc7540.html#RFC3986) 的 [3.3节](https://tools.ietf.org/html/rfc3986#section-3.3) 和 [3.4节](https://tools.ietf.org/html/rfc3986#section-3.4) ))。星号形式的请求包含:path伪首部字段的'*'值。

  对于http或者https URIs，该伪首部字段不能为空。不包含path组件的http或https URIs必须包含一个'/'值。该规则的例外情况是OPTIONS请求，其http或https URI不包含path组件，此时必须包含一个值为'\*'的`:path`伪首部字段(参见 [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230)， [5.3.4节](http://httpwg.org/specs/rfc7230.html#asterisk-form) )。

除非是CONNECT请求( [8.3节](http://httpwg.org/specs/rfc7540.html#CONNECT) )，否则对于`:method`、`:scheme`和`:path`伪首部字段，所有的HTTP/2请求都必须只包含一个有效值。忽略了强制的伪首部字段的HTTP请求是有缺陷的( [8.1.2.6节](http://httpwg.org/specs/rfc7540.html#malformed) )。

HTTP/2没有定义携带HTTP/1.1请求行里包含的版本号的方法。

## 响应的伪首部字段

对于HTTP/2响应，只定义了一个`:status`伪首部字段，其携带了HTTP状态码(参见 [*[RFC7231]*](http://httpwg.org/specs/rfc7540.html#RFC7231)，[第6章](http://httpwg.org/specs/rfc7231.html#status.codes) )。所有的响应都必须包含该伪首部字段，否则，响应就是有缺陷的( [8.1.2.6节](http://httpwg.org/specs/rfc7540.html#malformed) )。

HTTP/2没有定义携带HTTP/1.1状态行里包含的版本或者原因短语的方法。

##  压缩Cookie首部字段

[Cookie首部字段](http://httpwg.org/specs/rfc7540.html#COOKIE) *[COOKIE]* 使用分号来分隔cookie对(或『面包屑』)。该首部字段没有遵循HTTP里的列表创建规则(参见 [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230)，[3.2.2节](http://httpwg.org/specs/rfc7230.html#field.order) )，这阻止了将cookie对分隔为不同的`名-值`对。这会极大地降低cookie对更新时的压缩效率。

为了更好的压缩效率，可以将Cookie首部字段拆分成单独的首部字段，每一个都有一个或多个cookie对。如果解压缩后有多个Cookie首部字段，在将其传入一个非HTTP/2的上下文(比如：HTTP/1.1连接，或者通用的HTTP服务器应用)之前，必须使用两个字节的分隔符0x3B，0x20(即ASCII字符串"; ")将这些Cookie首部字段连接成一个字符串。

因此，以下两个Cookie首部字段列表在语义上是等价的：

```text
cookie: a=b; c=d; e=f

cookie: a=b
cookie: c=d
cookie: e=f
```

## 有缺陷的请求和响应

请求或响应本来是有效的HTTP/2帧序列，但由于出现了无关的帧，禁止的首部字段，缺少了强制的首部字段，或者包含了大写的首部字段名，有缺陷的请求或响应就变成了无效的HTTP/2帧序列。

包含负载体的请求或响应可以包含一个`content-length`首部字段。如果`content-length`首部字段的值不等于组成负载体的 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧负载的长度之和，请求或响应也是有缺陷的。被定义为没有负载的响应(就像 [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230)，[3.3.2节](http://httpwg.org/specs/rfc7230.html#header.content-length) 里描述的那样)，即使 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧里没有内容，也可以有一个值为非零的`content-length`首部字段。

处理HTTP请求或响应的中介(即，任何不充当隧道的中介)不能转发有缺陷的请求或响应。必须把探测到的有缺陷的请求或响应当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的流错误( [5.4.2节](http://httpwg.org/specs/rfc7540.html#StreamErrorHandler) )。

对于有缺陷的请求，服务端可以在关闭或重置流之前发送一个HTTP响应。客户端不能接受有缺陷的响应。注意，这些要求的目的是为了免受针对HTTP的几种常见的攻击；这些规则有意地严格，是因为可以避免暴露这些脆弱点的实现细节。

## 示例

本节展示了HTTP/1.1请求和响应，及其等价的HTTP/2请求和响应实例。

HTTP GET请求包含请求首部字段，没有负载体，因此可以通过一个 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧来传输，后跟零个或多个包含序列化请求首部块的 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧。下面的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧包含END\_HEADERS和END\_STREAM标志，没有发送 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧。

```text
 GET /resource HTTP/1.1           HEADERS
 Host: example.org          ==>     + END_STREAM
 Accept: image/jpeg                 + END_HEADERS
                                      :method = GET
                                      :scheme = https
                                      :path = /resource
                                      host = example.org
                                      accept = image/jpeg
```

类似地，只包含响应首部字段的响应通过一个 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧(同样，后跟零个或多个 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧)来传输，其包含序列化的响应首部块。

```text
 HTTP/1.1 304 Not Modified        HEADERS
 ETag: "xyzzy"              ==>     + END_STREAM
 Expires: Thu, 23 Jan ...           + END_HEADERS
                                      :status = 304
                                      etag = "xyzzy"
                                      expires = Thu, 23 Jan ...
```

包含请求首部字段和负载数据的HTTP POST请求通过一个 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧传输，后跟零个或多个包含请求首部字段的 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧，后跟一个或多个 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧，最后的 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧(或者 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧)设置了END\_HEADERS标志，最后的 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧设置了END\_STREAM标志：

```text
 POST /resource HTTP/1.1          HEADERS
 Host: example.org          ==>     - END_STREAM
 Content-Type: image/jpeg           - END_HEADERS
 Content-Length: 123                  :method = POST
                                      :path = /resource
 {binary data}                        :scheme = https

                                  CONTINUATION
                                    + END_HEADERS
                                      content-type = image/jpeg
                                      host = example.org
                                      content-length = 123

                                  DATA
                                    + END_STREAM
                                  {binary data}
```

注意，组成任何给定首部字段的数据可以在首部块片段之间散布。本例帧中首部字段的分配仅仅是示例性的。

包含首部字段和负载数据的响应通过一个 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧传输，后跟零个或多个 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧，后跟一个或多个 [DATA](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧，序列的最后一个 [DATA](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧设置了END\_STREAM标志：

```text
 HTTP/1.1 200 OK                  HEADERS
 Content-Type: image/jpeg   ==>     - END_STREAM
 Content-Length: 123                + END_HEADERS
                                      :status = 200
 {binary data}                        content-type = image/jpeg
                                      content-length = 123

                                  DATA
                                   + END_STREAM
                                  {binary data}
```

一个使用除101之外的1xx状态码的信息性响应通过一个 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧传输，后跟零个或多个 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧。

请求或响应和所有的 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧被发送完之后，拖尾的首部字段被当做一个首部块发送。开始拖尾首部块的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧设置了 END\_STREAM 标志。

如果请求的Expect首部字段里包含一个"100-continue"标识，那么应在其响应里发送一个100(Continue)状态码，下面的示例就包括了一个这样的状态码，还包括了拖尾的首部字段：

```text
 HTTP/1.1 100 Continue            HEADERS
 Extension-Field: bar       ==>     - END_STREAM
                                    + END_HEADERS
                                      :status = 100
                                      extension-field = bar

 HTTP/1.1 200 OK                  HEADERS
 Content-Type: image/jpeg   ==>     - END_STREAM
 Transfer-Encoding: chunked         + END_HEADERS
 Trailer: Foo                         :status = 200
                                      content-length = 123
 123                                  content-type = image/jpeg
 {binary data}                        trailer = Foo
 0
 Foo: bar                         DATA
                                   - END_STREAM
                                  {binary data}

                                  HEADERS
                                    + END_STREAM
                                    + END_HEADERS
                                      foo = bar
```

## HTTP/2里的请求可靠机制

在HTTP/1.1里，发生错误时，HTTP客户端不能重试一个非幂等的请求，因为没有办法判定错误的性质。相比错误，一些服务端可能优先处理已经发生的请求，如果重试发生错误的请求，可能会导致不可预料的影响。

对于请求尚未被处理的客户端，HTTP/2提供了两种保障机制：

* [GOAWAY](http://httpwg.org/specs/rfc7540.html#GOAWAY) 帧指出了可能已被处理的最大流号。因此，在流号更大的流上发送请求时，可以保证重试安全。
* [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 帧可以包含 [REFUSED\_STREAM](http://httpwg.org/specs/rfc7540.html#REFUSED_STREAM) 错误码，表明未处理任何请求，流已被关闭。在已被重置的流上发送的任何请求都可以安全地重试。

未经处理的请求不算失败，客户端可以自动重试这些请求，即使其是非幂等的。

服务端不能说明某个流未被处理，除非它能保证这一事实。如果某个流上的帧被传给应用层的任意一个流，那么 [REFUSED\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 错误码不能用于该流，且 [GOAWAY](http://httpwg.org/specs/rfc7540.html#GOAWAY) 帧包含的流标识符必须大于等于该给定流的标识符。

除了这些机制之外，[PING](http://httpwg.org/specs/rfc7540.html#PING) 帧还提供了让客户端方便地测试连接的方法。空闲连接会由于一些中间设备(例如，网络地址转换器或者负载均衡器)默默地丢弃连接绑定而断掉。[PING](http://httpwg.org/specs/rfc7540.html#PING) 帧让客户端可以不用发送请求就能安全地测试连接是否仍然有效。

## 服务端推送

HTTP/2允许服务端抢先向客户端发送(或『推送』)响应(以及相应的『被允诺的』请求)，这些响应跟先前客户端发起的请求有关。为了完整地处理对最初请求的响应，客户端将需要服务端推送的响应，当服务端了解到这一点时，服务端推送功能就会是有用的。

客户端可以要求关闭服务端推送功能，但这是每一跳独立协商地。[SETTINGS\_ENABLE\_PUSH](http://httpwg.org/specs/rfc7540.html#SETTINGS_ENABLE_PUSH) 设置为0，表示关闭服务端推送功能。

被允诺的请求必须是可缓存的(参见 [*[RFC7231]*](http://httpwg.org/specs/rfc7540.html#RFC7231)，[4.2.3节](http://httpwg.org/specs/rfc7231.html#cacheable.methods) )，必须是安全的(参见 [*[RFC7231]*](http://httpwg.org/specs/rfc7540.html#RFC7231)，[4.2.1节](http://httpwg.org/specs/rfc7231.html#safe.methods) )，而且不能包含请求体。如果客户端收到的被允诺的请求是不可缓存的，不安全的，或者含有请求体，那么客户端必须使用类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的流错误( [5.4.2节](http://httpwg.org/specs/rfc7540.html#StreamErrorHandler) )来重置该被允诺的流。注意，如果客户端认为一个新定义的方法是不安全的，这将会导致被允诺的流被重置。

如果客户端实现了HTTP缓存功能，就可以存储被推送的、可缓存的(参见 [*[RFC7234]*](http://httpwg.org/specs/rfc7540.html#RFC7234)，[第3章](http://httpwg.org/specs/rfc7234.html#response.cacheability) )响应。被推送的响应被认为在源服务器上已被成功地验证过(例如，如果存在"no-cache"缓存响应指令( [*[RFC7234]*](http://httpwg.org/specs/rfc7540.html#RFC7234)，[5.2.2节](http://httpwg.org/specs/rfc7234.html#cache-response-directive) ))，而被允诺的流ID标识的流仍处于打开状态。

任何HTTP缓存都不能存储不可缓存的被推送响应。这些响应可以单独提供给应用程序。

服务端必须在`:authority`伪首部字段中包含一个值，以表明服务端是权威可信的(参见 [10.1节](http://httpwg.org/specs/rfc7540.html#authority) )。客户端必须将不可信的服务端的 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的流错误( [5.4.2节](http://httpwg.org/specs/rfc7540.html#StreamErrorHandler) )。

中介可以接收来自服务端的推送，并选择不向客户端转发这些推送。换句话说，怎样利用被推送来的信息取决于该中介。同样，中介可以选择向客户端做额外的推送，不需要服务端采取任何行动。

客户端不能推送。因此，如果服务端收到了 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧，必须将其当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。客户端必须拒绝任何将 [SETTING\_ENABLE\_PUSH](http://httpwg.org/specs/rfc7540.html#SETTINGS_ENABLE_PUSH) 改为非0值的行为，否则就将其当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

## 推送请求

服务端推送在语义上等价于服务端对请求的响应。但在本小节，请求也被服务端以 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧的形式发送。

[PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧包含一个首部块，该首部块包含完整的一套请求首部字段，服务端将这些字段归因于请求。不可能向包含请求体的请求推送响应。

被推送的响应总是和明显来自于客户端的请求有关联。服务端在该请求所在的流上发送 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧。[PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧也包含一个被允诺的流标识符，该流标识符是从服务端可用的流标识符里选出来的( [5.1.1节](http://httpwg.org/specs/rfc7540.html#StreamIdentifiers) )。

[PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#StreamIdentifiers) 帧和任何随后的 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧里的首部字段必须是完整有效的一套请求首部字段( [8.1.2.3节](http://httpwg.org/specs/rfc7540.html#HttpRequest) )。服务端必须在`:method`伪首部字段里包含一个安全的可缓存的方法。如果客户端收到了一个 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧，其没有包含完整有效的一套首部字段，或者`:method`伪首部字段标识了一个不安全的方法，就必须响应一个类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的流错误( [5.4.2节](http://httpwg.org/specs/rfc7540.html#StreamErrorHandler) )。

在发送任何跟被允诺的响应有关联的帧之前，服务端应该优先发送 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧( [6.6节](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) )。这就避免了一种竞态条件，即客户端在收到任何 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧之前就发送请求。

例如，如果服务端收到了一个对文档的请求，该文档包含内嵌的指向多个图片文件的链接，且服务端选择向客户端推送那些额外的图片，那么在发送包含图片链接的 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧之前发送 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧可以确保客户端在发现内嵌的链接之前，能够知道有一个资源将要被推送过来。同样地，如果服务端推送被首部块引用的响应(比如，在链接的首部字段里)，在发送首部块之前发送一个 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧，可以确保客户端不再请求那些资源。

客户端不能发送 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧。

服务端可以发送 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧，以响应任何客户端发起的流，但是相对于服务端该流必须处于 打开(open) 或者 半关闭(远端)(half-closed(remote)) 状态。[PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧之间夹杂着包含响应的帧，但不能夹杂着包含一个单独的首部块的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧 和 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧。

发送一个 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧会创建一个新流。在服务端，该流会进入 被保留的(本地)(reserved (local)) 状态；在客户端，该流会进入 被保留的(远端)(reserved (remote)) 状态。

## 推送响应

在发送 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧以后，在一个服务端发起的、使用被允诺的流标识符的流上，服务端可以开始将被推送的响应( [8.1.2.4节](http://httpwg.org/specs/rfc7540.html#HttpResponse) )当做响应传送。服务端使用该流传送HTTP响应，帧顺序跟 [8.1节](http://httpwg.org/specs/rfc7540.html#HttpSequence) 定义的相同。在初始 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧被发送以后，对客户端( [5.1节](http://httpwg.org/specs/rfc7540.html#StreamStates) )来说，该流变为 半关闭(half-closed) 状态。

一旦客户端收到了 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧，并选择接收被推送的响应，客户端就不应该为被允诺的响应发送任何请求，直到被允诺的流被关闭以后。

不管出于什么原因，如果客户端决定不再从服务端接收被推送的响应，或者如果服务端花费了太长时间准备发送被允诺的响应，客户端可以发送一个 [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 帧，该帧可以使用 [CANCEL](http://httpwg.org/specs/rfc7540.html#CANCEL) 或者 [REFUSED\_STEAM](http://httpwg.org/specs/rfc7540.html#REFUSED_STREAM) 码，并引用被推送的流标识符。

客户端可以使用 [SETTINGS\_MAX\_CONCURRENT\_STREAMS](http://httpwg.org/specs/rfc7540.html#SETTINGS_MAX_CONCURRENT_STREAMS) 设置项来限制服务端并行推送响应的数量。通告 [SETTINGS\_MAX\_CONCURRENT\_STREAMS](http://httpwg.org/specs/rfc7540.html#SETTINGS_MAX_CONCURRENT_STREAMS) 的值为零，会通过阻止服务端创建必要的流的方式来关闭服务端推送功能。这不会阻止服务端发送 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧；客户端需要重置任何不想要的被允诺的流。

收到被推送响应的客户端必须确认，要么服务端是可信的(参见 [10.1节](http://httpwg.org/specs/rfc7540.html#authority) )，要么提供被推送响应的代理为相应的请求做了配置。例如，只为 example.com 的DNS-ID或者域名提供证书的服务端不准向<https://www.example.org/doc>推送响应。

[PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 流的响应以 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧开始，这会立即将流在服务端置于 半关闭(远端)(half-closed(remote)) 状态，在客户端置于 半关闭(本地)(half-closed(local)) 状态，最后以携带 END\_STREAM 的帧结束，这会将流置于 关闭(closed) 状态。

注意：客户端从来不会为服务端推送发送带有 END\_STREAM 标志的帧。

## CONNECT 方法

在HTTP/1.x里，CONNECT( [*[RFC7231]*](http://httpwg.org/specs/rfc7540.html#RFC7231), [4.3.6节](http://httpwg.org/specs/rfc7231.html#CONNECT) ) 伪方法用于将和远端主机的HTTP连接转换为隧道。CONNECT 主要用于HTTP代理和源服务器建立TLS会话，其目的是和https资源交互。

在HTTP/2中, CONNECT 方法用于在一个到远端主机的单独的HTTP/2流之上建立隧道。HTTP首部字段映射以像在 [8.1.2.3节](http://httpwg.org/specs/rfc7540.html#HttpRequest)( [请求的伪首部字段](http://httpwg.org/specs/rfc7540.html#HttpRequest) ) 定义的那样起作用，但有一些不同，即：

* `:method` 伪首部字段设置为 CONNECT。
* 必须忽略`:scheme` 和 `:path`伪首部字段。
* `:authority`伪首部字段包含要连接的主机和端口(等价于 CONNECT 请求目标的 authority形式( [*[RFC7230]*](http://httpwg.org/specs/rfc7540.html#RFC7230), [5.3节](http://httpwg.org/specs/rfc7230.html#request-target) ))。

不符合这些限制的 CONNECT 请求是有缺陷的( [8.1.2.6节](http://httpwg.org/specs/rfc7540.html#malformed) )。

支持 CONNECT 的代理建立到服务端的 [TCP连接](http://httpwg.org/specs/rfc7540.html#TCP) *[TCP]*，连接靠`：authority`伪首部字段进行区分。一旦连接成功建立，代理就向客户端发送一个包含2xx系列状态码的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧，正如 [*[RFC7231]*](http://httpwg.org/specs/rfc7540.html#RFC7231) 的 [4.3.6节](http://httpwg.org/specs/rfc7231.html#CONNECT) 定义的那样。

两端发送完初始的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧以后，所有随后的 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧就对应于在TCP连接上发送的数据。客户端发送的任意 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧的负载通过代理传送给TCP服务器；从TCP服务器收到的数据被代理组装成 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧。不能在处于连接状态的流上发送除 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧或流管理帧([RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM), [WINDOW_UPDATE](http://httpwg.org/specs/rfc7540.html#WINDOW_UPDATE), 和 [PRIORITY](http://httpwg.org/specs/rfc7540.html#PRIORITY))之外的帧类型，如果收到了这样的帧，必须将其当做流错误( [5.4.2节](http://httpwg.org/specs/rfc7540.html#StreamErrorHandler) )。

TCP连接可以由任意一端关闭。[DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧上的 END\_STREAM 标志被当做等价于TCP的FIN比特。收到一个带有 END\_STREAM 标志的帧以后，客户端应该发送一个设置了 END\_STREAM 标志的 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧。如果代理收到了设置有 END\_STREAM 标志的 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧，就发送附加的数据，并在最后一个TCP片段上设置了 FIN 标志位。如果代理收到了一个设置了 FIN 标志位的TCP片段，就发送一个设置了 END\_STREAM 标志的 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧。注意，最后的TCP片段或者 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧可以为空。

TCP连接错误用 [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 帧表示。代理将TCP连接中的任意错误，包括收到设置了RST标志位的TCP片段，都当做类型为 [CONNECT_ERROR](http://httpwg.org/specs/rfc7540.html#CONNECT_ERROR) 的流错误( [5.4.2节](http://httpwg.org/specs/rfc7540.html#StreamErrorHandler) )。相应地，如果代理探测到了流错误或者HTTP/2连接错误，就必须发送一个设置了RST标志位的TCP片段.
