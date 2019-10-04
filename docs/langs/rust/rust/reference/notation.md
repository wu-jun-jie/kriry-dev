# 符号

> 源 [notation](https://github.com/rust-lang-nursery/reference/blob/master/src/notation.md) Commit: a2405b970b7c8222a483b82213adcb17d646c75d

## 语法

Lexer和Syntax语法片段使用以下符号表示法：

| 符号               |     示例                      |     意义                                   |
|-------------------|-------------------------------|-------------------------------------------|
| CAPITAL           | KW_IF, INTEGER_LITERAL        | 词法分析器生成的标记                         |
| _ItalicCamelCase_ | _LetStatement_, _Item_        | 语法产生                                   |
| `string`          | `x`, `while`, `*`             | 确切的字符                                 |
| \\x               | \\n, \\r, \\t, \\0            | 此字符的转义表示                            |
| x<sup>?</sup>     | `pub`<sup>?</sup>             | 可选项                                     |
| x<sup>\*</sup>    | _OuterAttribute_<sup>\*</sup> | 0或多个                                    |
| x<sup>+</sup>     |  _MacroMatch_<sup>+</sup>     | 1或多个                                    |
| x<sup>a..b</sup>  | HEX_DIGIT<sup>1..6</sup>      | a to b repetitions of x                   |
| \|                | `u8` \| `u16`, Block \| Item  | Either one or another                     |
| [ ]               | [`b` `B`]                     | Any of the characters listed              |
| [ - ]             | [`a`-`z`]                     | Any of the characters in the range        |
| ~[ ]              | ~[`b` `B`]                    | Any characters, except those listed       |
| ~`string`         | ~`\n`, ~`*/`                  | Any characters, except this sequence      |
| ( )               | (`,` _Parameter_)<sup>?</sup> | Groups items                              |

## String table productions

语法中的一些规则 - 特别是[一元运算符]，[二元运算符]和[关键字] - 以简化形式给出：作为可打印字符串的列表。这些情况构成了关于`token`规则的规则的子集 ，并且被假定为由DFA驱动的解析器的词法分析阶段的结果，其在所有这样的字符串表条目的分离上操作。

当等宽字体中的这种字符串出现在语法内部时，它是对这种字符串表生成的单个成员的隐式引用。 有关更多信息，请参阅[tokens]。

[一元运算符]: https://rustlang-cn.org/office/rust/reference/statements-and-expressions/expressions/operator-expr.html#borrow-operators
[二元运算符]: https://rustlang-cn.org/office/rust/reference/statements-and-expressions/expressions/operator-expr.html#arithmetic-and-logical-binary-operators
[关键字]: https://rustlang-cn.org/office/rust/reference/lexical-structure/keywords.html
[tokens]: https://rustlang-cn.org/office/rust/reference/lexical-structure/tokens.html
