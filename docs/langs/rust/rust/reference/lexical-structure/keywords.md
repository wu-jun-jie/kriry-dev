# 关键词

>源 [keywords](https://github.com/rust-lang-nursery/reference/blob/master/src/keywords.md) Commit: eb02dd5194a747277bfa46b0185d1f5c248f177b

Rust将关键字分为三类：

- [严格关键字](#严格关键字)
- [保留关键字](#保留关键字)
- [弱关键字](#弱关键字)

## 严格关键字

这些关键字只能在正确的上下文中使用。 它们不能用作以下名称：

- [Items]
- Variables and function parameters
- Fields and [variants]
- [Type parameters]
- Lifetime parameters or [loop labels]
- [Macros] or [attributes]
- [Macro placeholders]
- [Crates]

> **<sup>Lexer:<sup>**\
> KW_AS             : `as`\
> KW_BREAK          : `break`\
> KW_CONST          : `const`\
> KW_CONTINUE       : `continue`\
> KW_CRATE          : `crate`\
> KW_ELSE           : `else`\
> KW_ENUM           : `enum`\
> KW_EXTERN         : `extern`\
> KW_FALSE          : `false`\
> KW_FN             : `fn`\
> KW_FOR            : `for`\
> KW_IF             : `if`\
> KW_IMPL           : `impl`\
> KW_IN             : `in`\
> KW_LET            : `let`\
> KW_LOOP           : `loop`\
> KW_MATCH          : `match`\
> KW_MOD            : `mod`\
> KW_MOVE           : `move`\
> KW_MUT            : `mut`\
> KW_PUB            : `pub`\
> KW_REF            : `ref`\
> KW_RETURN         : `return`\
> KW_SELFVALUE      : `self`\
> KW_SELFTYPE       : `Self`\
> KW_STATIC         : `static`\
> KW_STRUCT         : `struct`\
> KW_SUPER          : `super`\
> KW_TRAIT          : `trait`\
> KW_TRUE           : `true`\
> KW_TYPE           : `type`\
> KW_UNSAFE         : `unsafe`\
> KW_USE            : `use`\
> KW_WHERE          : `where`\
> KW_WHILE          : `while`

从2018年版开始添加了以下关键字。

> **<sup>Lexer 2018+</sup>**\
> KW_DYN            : `dyn`

## 保留关键字

这些关键字尚未使用，但保留供将来使用。 他们有与严格关键字相同的限制。 这背后的原因是要当前程序通过禁止向前兼容Rust的未来版本
他们使用这些关键字。

> **<sup>Lexer</sup>**\
> KW_ABSTRACT       : `abstract`\
> KW_BECOME         : `become`\
> KW_BOX            : `box`\
> KW_DO             : `do`\
> KW_FINAL          : `final`\
> KW_MACRO          : `macro`\
> KW_OVERRIDE       : `override`\
> KW_PRIV           : `priv`\
> KW_TYPEOF         : `typeof`\
> KW_UNSIZED        : `unsized`\
> KW_VIRTUAL        : `virtual`\
> KW_YIELD          : `yield`

从2018年版开始保留以下关键字

> **<sup>Lexer 2018+</sup>**\
> KW_ASYNC : `async`\
> KW_AWAIT : `await`\
> KW_TRY   : `try`

## 弱关键字

这些关键字仅在某些情况下具有特殊含义。 例如，它可以声明一个名为`union`的变量或方法。

- `union`用于声明[union]，只在`union`声明使用时是一个关键字
- `'static`用于静态生命周期，不能用作泛型生命周期参数

    ```compile_fail
    // error[E0262]: invalid lifetime parameter name: 'static
    fn invalid_lifetime_parameter<'static>(s: &'static str) -> &'static str { s }
    ```

- 在2015版中，[`dyn`]是在类型位置后跟一个不以`::`开头的路径使用时为关键字。

   从2018年版开始，`dyn`已被提升为严格关键字。

> **<sup>Lexer</sup>**\
> KW_UNION          : `union`\
> KW_STATICLIFETIME : `'static`
>
> **<sup>Lexer 2015</sup>**\
> KW_DYN            : `dyn`

[items]: https://rustlang-cn.org/office/rust/reference/items-and-attributes/items.html
[Type parameters]: https://rustlang-cn.org/office/rust/reference/type-system/types/parameters.html
[loop labels]: https://rustlang-cn.org/office/rust/reference/statements-and-expressions/expressions/loop-expr.html#loop-labels
[Macros]: https://rustlang-cn.org/office/rust/reference/macros/macros.html
[attributes]: https://rustlang-cn.org/office/rust/reference/items-and-attributes/attributes.html
[Macro placeholders]: https://rustlang-cn.org/office/rust/reference/macros/macros-by-example.html
[Crates]: https://rustlang-cn.org/office/rust/reference/crates-and-source-files.html
[union]: https://rustlang-cn.org/office/rust/reference/items-and-attributes/items/unions.html
[variants]: https://rustlang-cn.org/office/rust/reference/items-and-attributes/items/enumerations.html
[`dyn`]: https://rustlang-cn.org/office/rust/reference/type-system/types/trait-object.html
