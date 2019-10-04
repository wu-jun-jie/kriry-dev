# Serde数据模型

serde数据模型就是一组数据结构和数据格式转换的api，你可以理解为serde的类型系统。

serde序列化的部分定义在[Serializer]的trait里。反序列化的部分定义在 [Deserializer]的trait里。Serde提供了一种方法，将任何Rust的数据类型映射成29种可能的类型。 `Serializer` trait的每一种方法都对应数据模型的每一种类型。

当将一个数据结构序列化成某一种数据格式时，该数据结构里[Serialize]的实现将数据结构通过Serializer方法精确的映射成Serde数据模型。而Serializer自己的实现再将Serde数据模型映射成输出的数据格式。

当从某一种数据格式反序列化成rust数据结构时，[Deserialize]自己的实现会把数据格式映射成Serde数据模型，再通过数据结构里Deserializer的实现，将Serde数据模型通过[Visitor]实现映射成rust数据结构。

[Serializer]: https://docs.serde.rs/serde/trait.Serializer.html
[Deserializer]: https://docs.serde.rs/serde/trait.Deserializer.html
[Serialize]: https://docs.serde.rs/serde/trait.Serialize.html
[Deserialize]: https://docs.serde.rs/serde/trait.Deserialize.html
[Visitor]: https://docs.serde.rs/serde/de/trait.Visitor.html

## Serde类型系统

serde数据模型是rust类型系统的一个简化版本。它包括以下29种类型。

- **14 primitive types**
  - bool
  - i8, i16, i32, i64, i128
  - u8, u16, u32, u64, u128
  - f32, f64
  - char
- **string**
  - UTF-8 bytes with a length and no null terminator. May contain 0-bytes.
  - When serializing, all strings are handled equally. When deserializing, there
    are three flavors of strings: transient, owned, and borrowed. This
    distinction is explained in **Understanding Deserializer lifetimes** and is a
    key way that Serde enabled efficient zero-copy deserialization.
- **byte array** - [u8]
  - Similar to strings, during deserialization byte arrays can be transient,
    owned, or borrowed.
- **option**
  - Either none or some value.
- **unit**
  - The type of `()` in Rust. It represents an anonymous value containing no
    data.
- **unit_struct**
  - For example `struct Unit` or `PhantomData<T>`. It represents a named value
    containing no data.
- **unit_variant**
  - For example the `E::A` and `E::B` in `enum E { A, B }`.
- **newtype_struct**
  - For example `struct Millimeters(u8)`.
- **newtype_variant**
  - For example the `E::N` in `enum E { N(u8) }`.
- **seq**
  - A variably sized heterogeneous sequence of values, for example `Vec<T>` or
    `HashSet<T>`. When serializing, the length may or may not be known before
    iterating through all the data. When deserializing, the length is determined
    by looking at the serialized data. Note that a homogeneous Rust collection
    like `vec![Value::Bool(true), Value::Char('c')]` may serialize as a
    heterogeneous Serde seq, in this case containing a Serde bool followed by a
    Serde char.
- **tuple**
  - A statically sized heterogeneous sequence of values for which the length
    will be known at deserialization time without looking at the serialized
    data, for example `(u8,)` or `(String, u64, Vec<T>)` or `[u64; 10]`.
- **tuple_struct**
  - A named tuple, for example `struct Rgb(u8, u8, u8)`.
- **tuple_variant**
  - For example the `E::T` in `enum E { T(u8, u8) }`.
- **map**
  - A variably sized heterogeneous key-value pairing, for example `BTreeMap<K,
    V>`. When serializing, the length may or may not be known before iterating
    through all the entries. When deserializing, the length is determined by
    looking at the serialized data.
- **struct**
  - A statically sized heterogeneous key-value pairing in which the keys are
    compile-time constant strings and will be known at deserialization time
    without looking at the serialized data, for example `struct S { r: u8, g:
    u8, b: u8 }`.
- **struct_variant**
  - For example the `E::S` in `enum E { S { r: u8, g: u8, b: u8 } }`.

## 数据模型映射

在很多场景下， 把rust数据结构映射成serde数据模型是非常快速的。例如rust的`bool`类型映射成serde的bool类型，rust的tuple struct `Rgb(u8, u8, u8)`映射成serde的tuple struct结构。

But there is no fundamental reason that these mappings need to be
straightforward. The [Serialize] and [Deserialize] traits can perform *any*
mapping between Rust type and Serde data model that is appropriate for the use
case.

As an example, consider Rust's [std::ffi::OsString] type. This type represents
a platform-native string. On Unix systems they are arbitrary non-zero bytes and
on Windows systems they are arbitrary non-zero 16-bit values. It may seem
natural to map `OsString` into the Serde data model as one of the following
types:

- As a Serde **string**. Unfortunately serialization would be brittle because an
  `OsString` is not guaranteed to be representable in UTF-8 and deserialization
  would be brittle because Serde strings are allowed to contain 0-bytes.
- As a Serde **byte array**. This fixes both problem with using string, but now
  if we serialize an `OsString` on Unix and deserialize it on Windows we end up
  with [the wrong string].

Instead the `Serialize` and `Deserialize` impls for `OsString` map into the
Serde data model by treating `OsString` as a Serde **enum**. Effectively it acts
as though `OsString` were defined as the following type, even though this does
not match its definition on any individual platform.

```rust
# #![allow(dead_code)]
#
enum OsString {
    Unix(Vec<u8>),
    Windows(Vec<u16>),
    // and other platforms
}
#
# fn main() {}
```

The flexibility around mapping into the Serde data model is profound and
powerful. When implementing `Serialize` and `Deserialize`, be aware of the
broader context of your type that may make the most instinctive mapping not the
best choice.

[std::ffi::OsString]: https://doc.rust-lang.org/std/ffi/struct.OsString.html
[the wrong string]: https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/