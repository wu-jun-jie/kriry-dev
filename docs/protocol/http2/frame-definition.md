# 帧定义

该规范定义了若干帧类型，每种帧类型由唯一的8bit类型码标识。在建立和管理整个连接或者单独一个流时，每种帧类型都服务于特定的目的。

传送特定的帧类型可以改变连接的状态。如果两端不能保持同步的连接状态，就不可能再成功地进行通信。因此，对给定的帧怎样影响连接的状态，两端的理解应该保持一致。

## DATA帧

DATA帧(type=0x0)用于传送某一个流的任意的、可变长度的字节序列。比如：用一个或多个DATA帧来携带HTTP请求或响应的载荷。

DATA帧也可以包含填充数。为了模糊消息的大小，可以在DATA帧里加入填充数。填充数是一种安全特性，参见 [10.7节](https://httpwg.github.io/specs/rfc7540.html#padding)。

```text
+---------------+
|Pad Length? (8)|
+---------------+-----------------------------------------------+
|                            Data (*)                         ...
+---------------------------------------------------------------+
|                           Padding (*)                       ...
+---------------------------------------------------------------+
                         图 6：DATA帧载荷
```

DATA帧包含如下域：

* **填充长度(Pad Length)**：一个8bit的域，包含帧填充数据的字节长度。该域是可选的(正如框图中的"?"所示)，只有当设置了PADDED标识时，才会有该域。
* **数据(Data)**：应用数据。数据量等于帧载荷减去其它域的长度。
* **填充数据(Padding)**：不包含应用语义值的填充字节。当发送的时候，必须将填充数设置为0。接收方不必非得校验填充数据，但是可能会把非零的填充数当做 [PROTOCOL_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR) 类型的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html%23ConnectionErrorHandler) )。

DATA帧定义了如下标识：

*  **END_STREAM(0x1)**：当设置了该标识，第0位就指明了该帧是端点在指定流上发送的最后一帧。设置该标识会使流进入半关闭状态之一或者关闭状态( [5.1节](https://httpwg.github.io/specs/rfc7540.html#StreamStates) )。
*  **PADDED(0x8)**：当设置了该标识，第3位表示存在填充长度域和相应的填充数据。

DATA帧必须和某一个流相关联。如果收到一个流标识符域为0x0的DATA帧，接收方必须响应一个 [PROTOCOL_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR) 类型的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )。

DATA帧受流量控制限制，并且只能在流处于 打开(open) 或者 半关闭(远端)(half-closed (remote)) 状态时发送。整个DATA帧载荷都受流量控制限制，如果有的话，也包括 填充长度(Pad Length) 域和 填充数据(Padding) 域。如果流不是 打开(open) 或者 半关闭(本地)(half-closed (local)) 状态时收到了DATA帧，接收方必须响应一个 [STREAM_CLOSED](https://httpwg.github.io/specs/rfc7540.html#STREAM_CLOSED) 类型的流错误( [5.4.2节](https://httpwg.github.io/specs/rfc7540.html#StreamErrorHandler) )。


填充长度(Pad Length) 域的值决定了填充数据的字节总数。如果填充数据的长度大于等于帧载荷的长度，接收方必须把这种情况当做 [PROTOCOL_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR) 类型的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )。

注意：通过包含一个值为零的 填充长度(Pad Length) 域，帧大小可以增加一个字节。

## HEADERS帧

HEADERS帧(type=0x1)用来打开一个流( [5.1节](https://httpwg.github.io/specs/rfc7540.html#StreamStates) )，再额外地携带一个 首部块片段(Header Block Fragment)。HEADERS帧可以在一个流处于 空闲(idle)、保留(本地)(reserved (local))、打开(open)、或者 半关闭(远端)(half-closed (remote)) 状态时被发送。

```text
+---------------+
|Pad Length? (8)|
+-+-------------+-----------------------------------------------+
|E|                 Stream Dependency? (31)                     |
+-+-------------+-----------------------------------------------+
|  Weight? (8)  |
+-+-------------+-----------------------------------------------+
|                   Header Block Fragment (*)                 ...
+---------------------------------------------------------------+
|                           Padding (*)                       ...
+---------------------------------------------------------------+
                        图 7：HEADERS帧载荷
```

HEADERS帧载荷包含如下域：

* **填充长度(Pad Length)**：一个8bit的域，包含帧填充数据的字节长度。只有当设置了PADDED标识时，才会有该域。
* **E标识**：1bit标识，表示流依赖是否是专用的(参见 [5.3节](https://httpwg.github.io/specs/rfc7540.html#StreamPriority) )。只有当设置了PRIORITY标识，才会有该域。
* **流依赖(Stream Dependency)**：该流所依赖的流(参见 [5.3节](https://httpwg.github.io/specs/rfc7540.html#StreamPriority) )的31bit标识符。只有当设置了PRIORITY标识，才会有该域。
* **权重(Weight)**：一个8bit的无符号整数，表示该流的优先级权重(参见 [5.3节](https://httpwg.github.io/specs/rfc7540.html#StreamPriority) )。范围是1到255。只有当设置了PRIORITY标识，才会有该域。
* **首部块片段(Header Block Fragment)**：一个首部块片段(参见 [4.3节](https://httpwg.github.io/specs/rfc7540.html#HeaderBlock) )。
* **填充数据(Padding)**：填充字节。

HEADERS帧定义了如下标识：

* **END_STREAM(0x1)**：当设置了该标识，第0 bit位就指明了该首部块是端点在指定流上发送的最后一帧( [4.3节](https://httpwg.github.io/specs/rfc7540.html#HeaderBlock) )。

    HEADERS帧携带的END\_STREAM标识指明流要结束了。但是，在同一个流上，设置了END\_STREAM标识的HEADERS帧后面还可以有 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) 帧。从逻辑上来说，[CONTINUATION](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) 帧也是HEADERS帧的一部分。

* **END_HEADERS(0x4)**：当设置了该标识，第2 bit位表示该帧包含整个首部块( [4.3节](https://httpwg.github.io/specs/rfc7540.html#HeaderBlock) )，后面不会有任何 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) 帧。

    对于同一个流，没有设置END\_HEADERS标识的HEADERS帧后面必须跟一个 [CONTINUATION](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) 帧。如果接收到任何其他类型的帧，或者其他流上的帧，接收方必须将其看做 [PROTOCOL\_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR) 类型的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )。

* **PADDED(0x8)**：当设置了该标识，第3 bit位表示存在 填充长度(Pad Length) 域和 填充数据(padding)。
* **PRIORITY(0x20)**：当设置了该标识，第5 bit位表示存在 独占标识(E)(Exclusive Flag (E))、流依赖(Stream Dependency) 和 权重(Weight) 域。参加 [5.3节](https://httpwg.github.io/specs/rfc7540.html#StreamPriority)

HEADERS帧的载荷包含一个首部块片段( [4.3节](https://httpwg.github.io/specs/rfc7540.html#HeaderBlock) )。同一个首部块在一个HEADERS帧里装不下就继续装入CONTINUATION帧( [6.10节](https://httpwg.github.io/specs/rfc7540.html#CONTINUATION) )。

HEADERS帧必须与某一个流相关联。如果收到一个流标识符域为0x0的HEADERS帧，接收方必须响应一个 [PROTOCOL_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR) 类型的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )。

HEADERS帧改变连接状态在 [4.3节](https://httpwg.github.io/specs/rfc7540.html#HeaderBlock) 中有表述。

HEADERS帧可以包含填充数据。填充数据域和填充标识与DATA帧( [6.1节](https://httpwg.github.io/specs/rfc7540.html#DATA) )中定义的一样。如果填充数据量超出了为首部块片段预留的大小，必须将其处理为 [PROTOCOL_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR)。

HEADERS帧里的优先级信息逻辑上等价于一个单独的 [PRIORITY](https://httpwg.github.io/specs/rfc7540.html#PRIORITY) 帧，但是包含在HEADERS帧里可以避免创建新流时对流优先级潜在的扰动。一个流上第一个HEADERS帧之后的HEADERS帧里的优先级域会变更该流的优先级顺序( [5.3.3节](https://httpwg.github.io/specs/rfc7540.html#reprioritize) ).

## PRIORITY帧

PRIORITY帧(type=0x2)指定了发送者建议的流优先级( [5.3节](https://httpwg.github.io/specs/rfc7540.html#StreamPriority) )。可以在任何流状态下发送PRIORITY帧，包括空闲(idle)的 和 关闭(closed) 的流。

```text
+-+-------------------------------------------------------------+
|E|                  Stream Dependency (31)                     |
+-+-------------+-----------------------------------------------+
|   Weight (8)  |
+-+-------------+
                       图 8: PRIORITY帧载荷
```
 
PRIORITY帧的载荷包含以下域：

* **E标识(E):** 1bit标识，指明流依赖(Stream Dependency)是否是专用的(参见 [5.3节](https://httpwg.github.io/specs/rfc7540.html#StreamPriority) )。
* **流依赖(Stream Dependency):** 该流所依赖的流(参见 [5.3节](https://httpwg.github.io/specs/rfc7540.html#StreamPriority) )的31bit标识符。
* **权重(Weight):** 一个8bit的无符号整数，表示该流的优先级权重(参见 [5.3节](https://httpwg.github.io/specs/rfc7540.html#StreamPriority) )。范围是1到255。

PRIORITY帧没有定义任何标识。 

PRIORITY帧总是标识出了某一个流。如果收到一个流标识符为0x0的PRIORITY帧，接收方必须响应一个 [PROTOCOL_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR) 类型的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )。

可以在处于任意状态的流上发送PRIORITY帧，但却不能在包含同一个首部块[4.3节](https://httpwg.github.io/specs/rfc7540.html#HeaderBlock)的连续帧之间发送。需要注意的是，PRIORITY帧可能会在处理或发送帧完成后到达，这会导致PRIORITY帧在特定的流上不起作用。对处于 半关闭(远端)(half-closed (remote)) 或者 关闭(closed) 状态的流来说，PRIORITY帧只能影响对该特定流及其从属流的处理，而不会影响在该流上的帧传送。

可以在处于 空闲(idle) 或者 关闭(closed) 状态的流上发送PRIORITY帧，从而可以通过改变一个未使用的或者关闭的母流的优先级，来改变其从属流的优先级顺序。

必须将不是5字节长度的PRIORITY帧当做一个类型为 [FRAME\_SIZE\_ERROR](https://httpwg.github.io/specs/rfc7540.html#FRAME_SIZE_ERROR) 的流错误 [5.4.2节](https://httpwg.github.io/specs/rfc7540.html#StreamErrorHandler)。

## RST_STREAM帧

RST\_STREAM帧(type=0x3)可以立即终结一个流。RST\_STREAM用来请求取消一个流，或者表示发生了一个错误。

> ```text
> +---------------------------------------------------------------+
> |                        Error Code (32)                        |
> +---------------------------------------------------------------+
>                    图 9：RST_STREAM帧负载
> ```

RST\_STREAM帧包含一个32bit的无符号整数表示的错误码( [第7章](https://httpwg.github.io/specs/rfc7540.html#ErrorCodes) )。错误码指明了流为什么被终结。

RST_STREAM帧没有定义任何特征位标记。

RST\_STREAM帧完全终结了其所在的流，并且促使该流进入 关闭(closed) 状态。当在某一个流上收到一个RST\_STREAM帧以后，除了 [PRIORITY](https://httpwg.github.io/specs/rfc7540.html#PRIORITY) 帧，接收端不能在该流上发送任何其他的帧。但是，在发送完RST\_STREAM帧以后，发送端必须准备好接收并处理该流上的其他帧，这些帧可能是在RST\_STREAM帧到达前由对端所发送。

RST\_STREAM帧必须和一个流相关联。如果收到一个流标识符为0x0的RST\_STREAM帧，接收端必须将其处理为类型为 [PROTOCOL_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )。

不能在处于 空闲(idle) 状态的流上发送RST\_STREAM帧。如果收到一个空闲流上的RST\_STREAM帧，接收方必须将其处理为类型为 [PROTOCOL_ERROR](https://httpwg.github.io/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler) )。

必须将不是4字节长度的RST\_STREAM帧当做一个类型为 [FRAME\_SIZE\_ERROR](https://httpwg.github.io/specs/rfc7540.html#FRAME_SIZE_ERROR) 的连接错误 [5.4.1节](https://httpwg.github.io/specs/rfc7540.html#ConnectionErrorHandler)。

## SETTINGS帧

SETTINGS帧(type=0x4)用来传送影响两端通信的配置参数，比如：对对端行为的偏好与约束等。SETTINGS帧也用于通知对端自己收到了这些参数。特别地，SETTIGNS参数也可以被称做 设置参数(setting)。

SETTINGS参数不是靠协商得来的。这些参数描述了发送端的特性，并被接收端所使用。对于相同的参数，两端可以使用不同的值。例如，客户端可以设置一个较大的流量控制窗口 (flow-control window) 值，而服务端为了保存资源，可以设置一个较小的值。

在连接建立的时候两端必须发送SETTIGNS帧，也可以在连接的整个生命周期内由任何一端在任意时间发送SETTIGNS帧。实现必须支持本规范文档定义的所有参数。

SETTIGNS帧里的参数会各自替换该参数已存在的值。以参数出现的顺序来处理参数，除了参数的当前值，SETTIGNS帧的接收方不需要维护任何状态。因此，接收方看到的最后的值就是SETTIGNS帧的参数值。

SETTINGS帧携带的参数会被接收方确认。为了做到这个，SETTINGS帧定义了如下标识：

* **ACK (0x1):** 当设置了该标识，bit 0表示该帧确认收到并应用了对端的SETTIGNS帧。当设置了该bit，SETTIGNS帧的负载必须为空。如果收到了设置了ACK标识，并且长度域的值不为0的SETTIGNS帧，必须将其当做类型为[FRAME\_SIZE_ERROR](http://httpwg.org/specs/rfc7540.html#FRAME_SIZE_ERROR)的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。更多信息，参见 [6.5.3节](http://httpwg.org/specs/rfc7540.html#SettingsSync) ( "[Settings Synchronization](http://httpwg.org/specs/rfc7540.html#SettingsSync)" )。

SETTIGNS帧总是作用于连接，而不是一个流。SETTIGNS帧的流标识符必须为0(0x0)。如果一端收到了流标识符不是0x0的SETTIGNS帧，该端点必须响应一个类型为 [PROTOCOL_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [Section 5.4.1](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

SETTINGS帧影响连接状态。必须将损坏的或者不完整的SETTIGNS帧当做类型为 [PROTOCOL_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

必须将长度不是6的倍数的SETTINGS帧当做类型为 [FRAME\_SIZE_ERROR](http://httpwg.org/specs/rfc7540.html#FRAME_SIZE_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

## SETTINGS帧格式

SETTIGNS帧的负载包含零个或者多个参数，每个参数包含一个16bit的无符号设置标识符 (setting identifier) 和一个32bit的无符号值。

``` text
+-------------------------------+
|       Identifier (16)         |
+-------------------------------+-------------------------------+
|                        Value (32)                             |
+---------------------------------------------------------------+
                    图 10: Setting帧格式
```

## 已定义的SETTINGS帧参数

定义了如下参数：

* **SETTINGS\_HEADER\_TABLE_SIZE (0x1):** 允许发送方通知远端用于解码首部块的首部压缩表的最大字节值。通过使用特定于首部块( 参见 [*[COMPRESSION]*](http://httpwg.org/specs/rfc7540.html#COMPRESSION) )内部的首部压缩格式的信令，编码器可以选择任何小于等于该值的大小。其初始值是4096字节。
* **SETTINGS\_ENABLE_PUSH (0x2):** 该设置用于关闭服务端推送( [8.2节](http://httpwg.org/specs/rfc7540.html#PushResources) )。如果一端收到了该参数值为0，该端点不能发送 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧。如果一端把该参数设置为0，并且收到了确认，当它收到了 [PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧时，它必须将其当做类型 [PROTOCOL_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

  该值初始为1，表示允许服务端推送功能。如果该值不是0或者1，必须将其当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

* **SETTINGS\_MAX\_CONCURRENT_STREAMS (0x3):** 指明发送端允许的最大并发流数。该值是有方向性的：它适用于发送端允许接收端创建的流数目。最初，对该值是没有限制的。为了不是非必要地限制并发，推荐该值不小于100。

  端点不应该特殊对待SETTINGS\_MAX\_CONCURRENT_STREAMS为0的值。该值为0的确会阻止创建新流，但是，对任何耗尽限制数内活跃流的情况，也会发生阻止新流的创建。服务端应该只能在短期内设置该值为0。如果服务端不想接收请求，关闭连接更合适。

* **SETTINGS\_INITIAL\_WINDOW_SIZE (0x4):** 指明发送端流级别的流量控制窗口的初始字节大小。该初始值是2^16 - 1 (65,535)字节。
  
  该设置会影响所有流的窗口大小(参见 [6.9.2节](http://httpwg.org/specs/rfc7540.html#InitialWindowSize) )。
  
  如果该值大于流量控制窗口的最大值2^31 - 1，必须将其当做类型为 [FLOW\_CONTROL_ERROR](http://httpwg.org/specs/rfc7540.html#FLOW_CONTROL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。
* **SETTINGS\_MAX\_FRAME_SIZE (0x5):** 指明发送端希望接收的最大帧负载的字节值。
  
  初始值是2^14 (16,384)字节。一端告知的该值必须介于初始值和允许的最大帧大小(2^24 - 1 或者 16,777,215字节 )之间，包括该最大值。必须将超出该范围的值当做类型为 [PROTOCOL_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的 连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。
* **SETTINGS\_MAX\_HEADER\_LIST_SIZE (0x6):** 该建议设置通知对端发送端准备接收的首部列表大小的最大字节值。该值是基于未压缩的首部域大小，包括名称和值的字节长度，外加每个首部域的32字节的开销。

  对于任何给定的请求，其大小必须低于告知的值。该设置的初始值大小是没有限制的。

如果一端收到了带有任何未知的或不支持的标识符的SETTIGNS帧，必须忽略该设置参数。

## 设置同步

SETTINGS帧里的大部分值都受益于或者要求理解对端什么时候收到并且应用了已改变的参数值。为了提供这样的同步时间点，接收方必须一收到没有设置ACK标识的SETTINGS帧就尽快应用更新后的参数值。

SETTINGS帧里的值必须以其出现的顺序进行处理，而不能在值之间加入对其它帧的处理。不支持的参数必须被忽略。一旦所有的值都被处理完毕，接收方必须立即发送一个设置了ACK标识的SETTIGNS帧。一收到设置了ACK标识的SETTIGNS帧，已改变的参数的发送方就可以信赖已被应用的这些设置。

如果SETTINGS帧的发送方在一个合理的时间内没有收到确认，它可以发送一个类型为 [SETTINGS_TIMEOUT](http://httpwg.org/specs/rfc7540.html#SETTINGS_TIMEOUT) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

## PUSH_PROMISE帧

在发送端准备初始化流之前，要发送PUSH\_PROMISE(type=0x5)帧来通知对端。PUSH\_PROMISE帧包含31位的无符号流标识符，该流标识符和为流提供额外的上下文的首部集一起由端点创建的。[8.2节](http://httpwg.org/specs/rfc7540.html#PushResources) 详细描述了PUSH_PROMISE帧的使用。

``` text
+---------------+
|Pad Length? (8)|
+-+-------------+-----------------------------------------------+
|R|                  Promised Stream ID (31)                    |
+-+-----------------------------+-------------------------------+
|                   Header Block Fragment (*)                 ...
+---------------------------------------------------------------+
|                           Padding (*)                       ...
+---------------------------------------------------------------+
                     图 11: PUSH_PROMISE帧负载的格式
```

PUSH\_PROMISE帧负载具有以下域：

* **Pad Length:** 一个8bit的域，包含帧填充数据的字节长度。只有当设置了PADDED标识时，该域才会出现。
* **R:** 保留的1bit位。
* **Promised Stream ID:** 31bit的无符号整数，标记PUSH\_PROMISE帧保留的流。对于发送端来说，该标识符必须是可用于下一个流的有效值(参见 [5.1.1节](http://httpwg.org/specs/rfc7540.html#StreamIdentifiers) 的创建流标识符)。
* **Header Block Fragment:** 包含请求首部域的首部块片段( [4.3节](http://httpwg.org/specs/rfc7540.html#HeaderBlock) )。
* **Padding:** 填充字节。

PUSH\_PROMISE帧定义了如下标识符：

* **END_HEADERS (0x4):** 当设置了该标识符，第二个bit位表示这个帧包含整个首部块( [4.3节](http://httpwg.org/specs/rfc7540.html#HeaderBlock) )，并且后面没有跟随任何 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧。

  对于同一个流，没有设置END\_HEADERS标识的PUSH\_PROMISE帧后面必须跟随有CONTINUATION帧。如果接收端收到了其他类型的帧，或者是其他流上的帧，接收端必须将其当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的流错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

* **PADDED (0x8):** 当设置了该标识符，第3个bit位表示出现了填充长度(Pad Length)域和它所描述的填充字节。

只能在处于 打开(open) 或者 半关闭(远端)(half-closed (remote)) 状态的对等初始化的流上发送PUSH\_PROMISE帧。PUSH\_PROMISE帧的流标识符指明其所关联的流。如果流标识符域的值是0x0，接收方必须响应一个类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

不要求被允诺的流以他们被允诺的顺序来被使用。PUSH\_PROMISE帧只保留用于以后的流标识符。


> PUSH\_PROMISE MUST NOT be sent if the SETTINGS\_ENABLE\_PUSH setting of the peer endpoint is set to 0. An endpoint that has set this setting and has received acknowledgement MUST treat the receipt of a PUSH\_PROMISE frame as a connection error ([Section 5.4.1](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler)) of type [PROTOCOL_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR).

如果对端的SETTINGS\_ENABLE\_PUSH被设置为0，不能发送PUSH\_PROMISE帧。如果一端已经设置了该设置项，并且收到了确认，当它收到了PUSH\_PROMISE帧时，必须将其当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。


> Recipients of PUSH\_PROMISE frames can choose to reject promised streams by returning a [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) referencing the promised stream identifier back to the sender of the PUSH_PROMISE.

PUSH\_PROMISE帧的接收方可以通过给PUSH\_PROMISE帧的发送方返回一个 [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 帧来选择拒绝被允诺的流，该RST\_STREAM帧包含被允诺的流的标识符。


> A PUSH\_PROMISE frame modifies the connection state in two ways. First, the inclusion of a header block ([Section 4.3](http://httpwg.org/specs/rfc7540.html#HeaderBlock)) potentially modifies the state maintained for header compression. Second, PUSH\_PROMISE also reserves a stream for later use, causing the promised stream to enter the "reserved" state. A sender MUST NOT send a PUSH_PROMISE on a stream unless that stream is either "open" or "half-closed (remote)"; the sender MUST ensure that the promised stream is a valid choice for a new stream identifier ([Section 5.1.1](http://httpwg.org/specs/rfc7540.html#StreamIdentifiers)) (that is, the promised stream MUST be in the "idle" state).

PUSH\_PROMISE帧有两种方式来修改连接状态。首先，包含一个首部块( [4.3节](http://httpwg.org/specs/rfc7540.html#HeaderBlock) )会潜在地修改为首部压缩维护的状态。其次，PUSH\_PROMISE帧也会为以后的使用保留一个流，从而使被允诺的流进入 保留(reserved) 状态。只有当流处于 打开(open) 或者 半关闭(远端)(half-closed (remote)) 状态时，发送方才能在该流上发送PUSH\_PROMISE帧；发送方必须确保被允诺的流对一个新的流标识符([ 5.1.1节](http://httpwg.org/specs/rfc7540.html#StreamIdentifiers) )是有效的(即，被允诺的流必须处于 空闲(idle) 状态)。


> Since PUSH\_PROMISE reserves a stream, ignoring a PUSH\_PROMISE frame causes the stream state to become indeterminate. A receiver MUST treat the receipt of a PUSH\_PROMISE on a stream that is neither "open" nor "half-closed (local)" as a connection error ([Section 5.4.1](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler)) of type [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR). However, an endpoint that has sent [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) on the associated stream MUST handle PUSH_PROMISE frames that might have been created before the [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) frame is received and processed.

因为PUSH\_PROMISE帧会保留一个流，所以忽略PUSH\_PROMISE帧会导致该流的状态变成不确定的。如果在既不是 打开(open) 也不是 半关闭(half-closed(local)) 状态的流上收到了PUSH\_PROMISE帧，接收方必须将其当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。但是，在关联流上发送了 [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 帧的端点必须能处理PUSH\_PROMISE帧，该PUSH\_PROMISE帧可能在收到并处理 [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 帧之前就已经被创建了。


> A receiver MUST treat the receipt of a PUSH\_PROMISE that promises an illegal stream identifier ([Section 5.1.1](http://httpwg.org/specs/rfc7540.html#StreamIdentifiers)) as a connection error ([Section 5.4.1](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler)) of type [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR). Note that an illegal stream identifier is an identifier for a stream that is not currently in the "idle" state.

如果接收端收到允诺了一个非法的流标识符( [5.1.1节](http://httpwg.org/specs/rfc7540.html#StreamIdentifiers) )的PUSH\_PROMISE帧，必须将其当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。注意，非法的流标识符是当前状态不是 空闲(idle) 状态的流的标识符。


> The PUSH\_PROMISE frame can include padding. Padding fields and flags are identical to those defined for DATA frames ([Section 6.1](http://httpwg.org/specs/rfc7540.html#DATA)).

PUSH\_PROMISE帧可以包含填充数据。填充数据域和标识符跟为DATA帧( [6.1节](http://httpwg.org/specs/rfc7540.html#DATA) )定义的相同。

## PING帧

除了判断一个空闲的连接是否仍然可用之外，PING帧(type=0x6)还是发送端测量最小往返时间的一种机制。任何端点都可以发送PING帧。

```text
+---------------------------------------------------------------+
|                                                               |
|                      Opaque Data (64)                         |
|                                                               |
+---------------------------------------------------------------+
                       图 12: PING帧的负载格式
```

除了帧首部，PING帧还必须在负载中包含8字节的不透明数据。发送端可以选择任意值，而且可以以任意形式使用这些值。

如果接收端收到了不包含ACK标识的PING帧，必须响应一个设置了ACK标识的PING帧，其负载与收到的PING帧的负载相同。PING帧的响应应该被赋予最高优先级。

PING帧定义了如下标识符：

* **ACK (0x1):** 当设置了该标识符，第0位表示该PING帧是一个PING帧的响应。端点必须在PING帧的响应里设置该标识符。端点不能响应包含该标识符的PING帧。

PING帧不能与任何流相关联。如果收到了流标识符域的值不是0x0的PING帧，接收端必须响应一个类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

如果收到了长度域的值不是8的PING帧，必须将其当做类型为 [FRAME\_SIZE\_ERROR](http://httpwg.org/specs/rfc7540.html#FRAME_SIZE_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

## GOAWAY帧

GOAWAY帧(type=0x7)用于发起关闭连接，或者警示严重错误。GOAWAY帧能让端点优雅地停止接受新流，同时仍然能处理完先前建立的流。这使类似于服务端维护的管理行为成为可能。

在发起新流的端点和发送GOAWAY帧的远端之间，内在地存在着竞争条件。为了解决这个问题，GOAWAY帧包含对端最后初始创建的流的标识符，该流被或者可能被连接的发送端处理。例如，如果服务端发送一个GOAWAY帧，被标识的流就是由客户端初始创建的最大标号的流。

一旦GOAWAY帧被发送，如果接收端初始创建的流的标识符大于GOAWAY帧携带的最后的流标识符，发送端将会忽略在这些流上发送的帧。尽管可以在新的连接上创建新的流，但是GOAWAY帧的接收端不能在原有的连接上再打开其他的流。

如果GOAWAY帧的接收端在流上发送数据，这些流的流标识符比GOAWAY帧里携带的流标识符大，那么这些流将不会被处理。GOAWAY帧的接收端可以将这些流看做从来没有创建过一样，因此，这些流随后可以在一个新的连接上重新被创建。

在关闭连接之前，端点应该总是发送一个GOAWAY帧，从而可以让远端知道流是否被部分地处理了。例如，假设在服务端关闭连接的同时，HTTP客户端发送了一个POST请求，如果服务端没有发送GOAWAY帧来指明关闭连接影响到了哪些流，客户端不可能知道服务端是否开始处理该POST请求。

如果对端出错了，一端可以不用发送一个GOAWAY帧而关闭连接。

GOAWAY帧之后可能不会立即关闭连接。GOAWAY帧的接收端应该在关闭连接之前仍然发送一个GOAWAY帧。

```text
+-+-------------------------------------------------------------+
|R|                  Last-Stream-ID (31)                        |
+-+-------------------------------------------------------------+
|                      Error Code (32)                          |
+---------------------------------------------------------------+
|                  Additional Debug Data (*)                    |
+---------------------------------------------------------------+
                   图 13: GOAWAY帧负载格式
```

GOAWAY帧没有定义任何标志。

GOAWAY帧作用于连接，而不是流。如果GOAWAY帧的流标识符不是0x0，一端必须将其当做类型为 [PROTOCOL_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

GOAWAY帧里最后的流标识符包含最大数字的流标识符，GOAWAY帧的发送者可能已经、或者仍然在作用于该流。小于等于该标识符的流以某种方式被处理。如果没有流被处理，最后的流标识符可以被设置为0。

注意：在这个上下文里，『被处理』表示该流传送的一些数据被传递给软件的更高层，结果导致了采取了一些行动。

如果没有GOAWAY帧就关闭连接，最后的流标识符实际上就是最大可能的流标识符。

连接关闭之前，在没有完全关闭的、流标识符小于等于最大值的流上，重新尝试请求、事务，或者任何协议行为是不可能的，但诸如HTTP GET、PUT、或者DELETE等幂等动作除外。在流标识符大于最大值的流上的任何协议动作都可以在一个新连接上安全地重试。

在小于等于最后的流标识符的流上的行为可能仍然能成功地完成。GOAWAY帧的发送端可能会通过发送一个GOAWAY帧来优雅地关闭连接，同时保持连接在 打开(open) 状态，直到所有的流都完成。

如果环境变化了，一端可能会发送多个GOAWAY帧。例如，在优雅地关闭期间，发送带有 [NO_ERROR](http://httpwg.org/specs/rfc7540.html#NO_ERROR) 的GOAWAY帧的端点可能随后就会遭遇需要立即关闭连接的情况。收到的最后的GOAWAY帧上最后的流标识符指明哪些流受影响了。端点不能增加它们发送的最后的流标识符的值，因为对端可能已经在另外一个连接上重试未处理的请求了。

当服务端关闭连接时，不能重试请求的客户端会丢失所有传输途中的请求。这对不向客户端提供HTTP/2服务的中介来说尤其正确。试图优雅地关闭连接的服务端应该发送一个初始GOAWAY帧，其 最后的流标识符(last stream identifier) 设置为2^31 - 1，并且带有一个 [NO_ERROR](http://httpwg.org/specs/rfc7540.html#NO_ERROR) 码。这会通知客户端，连接即将关闭，禁止再发起新的请求。一段可以让传输途中的流创建完成的时间(至少一个往返时间)过后，服务端可以发送其它的GOAWAY帧，携带更新的 最后流标识符(last time identifier) 。这样可以确保干净地关闭连接，不会丢失请求。

发送了GOAWAY帧以后，发送端可以丢弃接收端初始创建的、其标识符大于最后的流标识符的流上的帧。但是，改变连接状态的帧不能被完全忽略。例如，[HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧，[PUSH_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧，和 [CONTINUATION](http://httpwg.org/specs/rfc7540.html#CONTINUATION) 帧，必须至少被处理，以确保为首部压缩维护的状态是一致(参见 [4.3节](http://httpwg.org/specs/rfc7540.html#HeaderBlock) )。类似地，必须将DATA帧计入连接的流量控制窗口。对这些帧的处理失败会导致流量控制或者首部压缩状态变得不同步。

GOAWAY帧还包含一个32bit的错误码( [第7章](http://httpwg.org/specs/rfc7540.html#ErrorCodes) )，该错误码包含了关闭连接的原因。

端点可以在任何GOAWAY帧的负载上附加不透明的数据。额外的调试数据只用于诊断目的，并且不携带语义值。调试信息可以包含安全相关的、或者隐私敏感的数据。登陆相关的、或者其他持久存储的调试数据必须具备足够的安全措施，以阻止未授权访问。

## WINDOW_UPDATE帧

WINDOW_UPDATE帧(type=0x8)用于执行流量控制功能；参见 [5.2节](http://httpwg.org/specs/rfc7540.html#FlowControl) 的概述。

流量控制操作有两个层次：在每一个单独的流上和在整个连接上。

这两种流量控制都是逐跳的，即，只在两个端点之间。中介不会两个独立的连接之间转发WINDOW_UPDATE帧。但是，任何接收端对数据传输的遏制都会间接地导致流量控制信息向源发送端传播。

流量控制功能只适用于被标识的、受流量控制影响的帧。本文档定义的帧类型里，只有 [DATA](http://httpwg.org/specs/rfc7540.html#DATA)帧 受流量控制影响。除非接收端不能再分配资源去处理这些帧，否则不受流量控制影响的帧必须被接收并处理。如果接收端不能再接收帧了，它可以响应一个 [FLOW\_CONTROL\_ERROR](http://httpwg.org/specs/rfc7540.html#FLOW_CONTROL_ERROR) 类型的 流错误( [5.4.2节](http://httpwg.org/specs/rfc7540.html#StreamErrorHandler) ) 或者 连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

```text
+-+-------------------------------------------------------------+
|R|              Window Size Increment (31)                     |
+-+-------------------------------------------------------------+
                   图 14: WINDOW_UPDATE帧负载格式
```

WINDOW_UPDTAE帧的负载由保留的1bit位，加上一个31bit的无符号整数组成，该整数表示除了现有的流量控制窗口之外，发送端还可以传送的字节数。流量控制窗口增长的合法范围是1到2^31 - 1(2,147,483,647)字节。

WINDOW_UPDATE帧没有定义任何标志。

WINDOW\_UPDATE帧可以是针对一个流的，或者是针对整个连接的。如果是前者，WINDOW\_UPDATE帧的流标识符指明了受影响的流；如果是后者，值为0表示整个连接都受WINDOW\_UPDATE帧的影响。

如果收到了 流量控制窗口增量(flow-control window increment) 为0的WINDOW\_UPDATE帧，接收端必须将其当做类型为 [PROTOCOL_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的流错误( [5.4.2节](http://httpwg.org/specs/rfc7540.html#StreamErrorHandler) )；发生在连接上的流量控制窗口错误必须被当做连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

WINDOW\_UPDATE可以由发送过携带有END\_STREAM标志的帧的对端发送。这意味着接收端可能会在 半关闭(远端)(half-closed (remote)) 或者 关闭(closed) 状态的流上收到WINDOW_UPDATE帧。接收端不能将其当做错误(参加 [5.1节](http://httpwg.org/specs/rfc7540.html#StreamStates) )。

除非将其当做连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )，否则当接收端收到被流量控制影响的帧时，必须总是将其从流量控制窗口中减掉。即使帧有错误，这也是有必要的。发送端将该帧计入流量控制窗口，但是如果接收端没有这样做，发送端和接收端的流量控制窗口就会变得不同。

如果WINDOW\_UPDATE帧的长度不是4字节，必须将其当做类型为 [FRAME\_SIZE\_ERROR](http://httpwg.org/specs/rfc7540.html#FRAME_SIZE_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

## 流量控制窗口

HTTP/2中的流量控制功能通过每个流上的发送端各自维持的窗口来实现。流量控制窗口是一个简单的整数值，指出了准许发送端传送的数据的字节数。这样，窗口值衡量了接收端的缓存能力。

有两种流量控制窗口：流的流量控制窗口和连接的流量控制窗口。发送端不能发送受流量控制影响的、其长度超出接收端告知的这两种流量控制窗口可用空间的帧。即使这两种流量控制窗口都没有可用空间了，也可以发送长度为0、设置了END\_STREAM标志的帧(即，空的 [DATA](http://httpwg.org/specs/rfc7540.html#DATA) 帧)。

9字节的帧首部不计入流量控制的计算。

发送了一个受流量控制影响的帧以后，发送端减少两个窗口的可用空间，减少量为已经发送的帧的长度大小。

当帧的接收端消耗了数据并释放了流量控制窗口的空间时，它发送一个WINDOW\_UPDATE帧。对于流级别和连接级别的流量控制窗口，需要分别发送WINDOW\_UPDATE帧。

收到WINDOW\_UPDATE帧的发送端要更新相应的窗口，更新量已在WINDOW\_UPDATE帧里指定。

发送端不能让流量控制窗口超出 2^31 - 1 字节。如果发送端收到一个WINDOW\_UPDATE帧使流量控制窗口超出该最大值，它必须终止相应的流或连接。对于流，发送端发送一个 [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 帧，错误码为 [FLOW\_CONTROL\_ERROR](http://httpwg.org/specs/rfc7540.html#FLOW_CONTROL_ERROR) ；对于连接，发送一个[GOAWAY](http://httpwg.org/specs/rfc7540.html#GOAWAY)帧，错误码为 [FLOW\_CONTROL\_ERROR](http://httpwg.org/specs/rfc7540.html#FLOW_CONTROL_ERROR) 。

发送端发送的受流量控制影响的帧和来自于接收端的WINDOW\_UPDATE帧之间彼此完全异步。这个属性允许接收端剧烈地更新发送端维持的窗口大小，以防止流中止。

## 初始化流量控制窗口大小

当HTTP/2连接首次被建立时，新创建流的初始流量控制窗口大小为65，535字节。连接的流量控制窗口也是65，535字节。两端都可以通过组成连接序幕的 [SETTING](http://httpwg.org/specs/rfc7540.html#SETTINGS) 帧里的 [SETTINGS\_INITIAL\_WINDOW\_SIZE](http://httpwg.org/specs/rfc7540.html#SETTINGS_INITIAL_WINDOW_SIZE) 来调整新流的初始流量控制窗口的大小。连接的流量控制窗口只能通过WINDOW\_UPDATE帧来改变。

在收到设置了 [SETTINGS\_INITIAL\_WINDOW\_SIZE](http://httpwg.org/specs/rfc7540.html#SETTINGS_INITIAL_WINDOW_SIZE) 的 [SETTIGNS](http://httpwg.org/specs/rfc7540.html#SETTINGS) 帧之前，当一端发送受流量控制影响的帧时，只能使用默认的初始窗口大小。相似地，直到收到了 WINDOW_UPDATE 帧之前，连接的流量控制窗口都设置为默认的初始窗口大小。

除了改变还未激活的流的流量控制窗口，[SETTIGNS](http://httpwg.org/specs/rfc7540.html#SETTINGS) 帧还可以用激活的流量控制窗口改变流(即，处于 打开(open) 或者 半关闭(远端)(half-closed (remote)) 状态的流)的初始流量控制窗口的大小。当 [SETTINGS\_INITIAL\_WINDOW_SIZE](http://httpwg.org/specs/rfc7540.html#SETTINGS_INITIAL_WINDOW_SIZE) 的值变化了，接收端必须调整它所维护的所有流的流量控制窗口的值。

改变 [SETTINGS\_INITIAL\_WINDOW\_SIZE](http://httpwg.org/specs/rfc7540.html#SETTINGS_INITIAL_WINDOW_SIZE) 可以引发流量控制窗口的可用空间变成负值。发送端必须追踪负的流量控制窗口，并且直到它收到了使流量控制窗口变成正值的 WINDOW_UPDATE 帧，才能发送新的受流量控制影响的帧。

例如，如果连接一建立客户端就立即发送60KB的数据，而服务端却将初始窗口大小设置为16KB，那么客户端一收到 [SETTINGS](http://httpwg.org/specs/rfc7540.html#SETTINGS) 帧，就会将可用的流量控制窗口重新计算为-44KB。客户端保持负的流量控制窗口，直到WINDOW_UPDATE帧将窗口值恢复为正值，这之后，客户端才可以继续发送数据。

[SETTINGS](http://httpwg.org/specs/rfc7540.html#SETTINGS) 帧不能改变连接的流量控制窗口值。

如果改变 [SETTINGS\_INITIAL\_WINDOW\_SIZE](http://httpwg.org/specs/rfc7540.html#SETTINGS_INITIAL_WINDOW_SIZE) 导致流量控制窗口超出了最大值，一端必须将其当做类型为 [FLOW\_CONTROL\_ERROR](http://httpwg.org/specs/rfc7540.html#FLOW_CONTROL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

## 减小流的窗口大小

如果接收端希望使用比当前值小的流量控制窗口，可以发送一个新的 [SETTINGS](http://httpwg.org/specs/rfc7540.html#SETTINGS) 帧。但是，接收端必须准备好接收超出该窗口值的数据，因为可能在处理 [SETTIGNS](http://httpwg.org/specs/rfc7540.html#SETTINGS) 帧之前，发送端已经发送了超出该较小窗口值的数据。

发送了可以减小初始流量控制窗口大小的 SETTIGNS 帧以后，接收端可以继续处理超出流量控制限制的流。允许流继续意味着不允许接收端立即减小它为流量控制窗口保留的空间。因为需要 [WINDOW\_UPDATE](http://httpwg.org/specs/rfc7540.html#WINDOW_UPDATE) 帧允许发送端重新开始发送数据，对这些流的处理也可以中止。对于受影响的流，接收端可以代替发送一个 [RST\_STREAM](http://httpwg.org/specs/rfc7540.html#RST_STREAM) 帧，携带错误码 [FLOW\_CONTROL\_ERROR](http://httpwg.org/specs/rfc7540.html#FLOW_CONTROL_ERROR)。

## CONTINUATION帧

CONTINUATION帧(type=0x9)用于继续传送首部块片段序列( [4.3节](http://httpwg.org/specs/rfc7540.html#HeaderBlock) )。只要前面的帧在同一个流上，而且是一个没有设置END\_HEADERS标志的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧，[PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE)帧，或者CONTINUATION帧，就可以发送任意数量的CONTINUATION帧。

```text
+---------------------------------------------------------------+
|                   Header Block Fragment (*)                 ...
+---------------------------------------------------------------+
                    图 15: CONTINUATION帧负载
```

CONTINUATION帧的负载包含一个首部块片段( [4.3节](http://httpwg.org/specs/rfc7540.html#HeaderBlock) )。

CONTINUATION帧定义了如下标志：

* **END_HEADERS (0x4):** 当设置了该标志，第2个bit位表示该帧是一个首部块的结束( [4.3节](http://httpwg.org/specs/rfc7540.html#HeaderBlock) )。

  如果没有设置 END_HEADERS bit位，该帧的后面必须跟有其他的CONTINUATION帧。如果接收端收到了任何其他类型的帧，或者另外一条流上的帧，必须将其当做类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

CONTINUATION帧改变了 [4.3节](http://httpwg.org/specs/rfc7540.html#HeaderBlock) 定义的连接状态。

CONTINUATION帧必须和一个流相关联。如果收到了流标识符域的值为0x0的CONTINUATION帧，接收端必须响应一个类型为PROTOCOL\_ERROR的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) )。

CONTINUATION帧之前必须是一个没有设置END\_HEADERS标志的 [HEADERS](http://httpwg.org/specs/rfc7540.html#HEADERS) 帧，[PUSH\_PROMISE](http://httpwg.org/specs/rfc7540.html#PUSH_PROMISE) 帧，或者CONTINUATION帧。如果接收端发现违反该规则了，必须响应一个类型为 [PROTOCOL\_ERROR](http://httpwg.org/specs/rfc7540.html#PROTOCOL_ERROR) 的连接错误( [5.4.1节](http://httpwg.org/specs/rfc7540.html#ConnectionErrorHandler) ).
