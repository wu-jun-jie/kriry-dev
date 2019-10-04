# `Actor`选拔

与actor交互的主要方法是通过它的actor引用（ActorRef）。 由于每个 `Actor`都有一条路径，因此可以通过该路径“查找” `Actor`。 它也可以与作为路径一部分的所有参与者进行交互。

例如，如果已知某个actor位于/ user / comms / high_gain_1，但我们没有此actor的actor引用，我们可以执行选择：

```rust
let hga = ctx.selection("/user/comms/high_gain_1").unwrap();
```

这将返回一个ActorSelection。 在某些方面，ActorSelection的行为类似于ActorRef，但具有关键区别。 最突出的相似之处在于ActorSelection实现了Tell，这意味着可以将消息发送给选择，例如：

```rust
let hga = ctx.selection("/user/comms/high_gain_1").unwrap();
hga.tell("I've arrived safely".into(), None);
```

虽然这个例子强调了如何根据实际的路径向 `Actor`发送消息，但应该仔细考虑。 ActorRef几乎总是更好的 `Actor`互动选择，因为消息直接发送到 `Actor`的邮箱而无需任何预处理或克隆。 但是有几个用例，其中ActorSelection是有意义的：

你知道一个 `Actor`的路径，但由于设计你没有它的ActorRef
您希望向路径中的所有actor广播消息
ActorSelection的一个关键区别是它可以代表多个actor。 可以选择actor路径下的所有actor。 例如，可以将相同的消息发送给特定 `Actor`的所有 子`Actor`。

```rust
let sel = ctx.selection("/user/home-control/lighting/*").unwrap();
sel.tell(Protocol::Off, None);
```

在该示例中，负责家中照明的 `Actor`具有针对每个单独灯的儿童 `Actor`。 如果我们想要关闭所有灯光，可以将控制消息（Protocol :: Off）发送到`/ user / home-control / lighting / *`。 每个儿童 `Actor`都会收到相同的消息

> 注意 : 路径相对于进行选择的位置。 例如。 从actor照明的上下文中，可以使用`ctx.selection（“*”）`选择所有子项。

我们已经看到ActorSelection为某些用例提供了灵活性，例如在编译时不知道ActorRef，但更具体地说是为多个actor发送消息。 这是以遍历部分actor层次结构和克隆消息为代价的。

接下来，我们将看到`Channels`如何提供发布/订阅功能以启用`actor`编排。