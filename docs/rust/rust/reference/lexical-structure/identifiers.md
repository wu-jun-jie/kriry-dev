# 标识符

>源 [identifiers](https://github.com/rust-lang-nursery/reference/blob/master/src/identifiers.md) Commit: e942743f739a191abca1b0bf8b6497f2195cbbf8

> **<sup>Lexer:<sup>**\
> IDENTIFIER_OR_KEYWORD :\
> &nbsp;&nbsp; &nbsp;&nbsp; [`a`-`z` `A`-`Z`]&nbsp;[`a`-`z` `A`-`Z` `0`-`9` `_`]<sup>\*</sup>\
> &nbsp;&nbsp; | `_` [`a`-`z` `A`-`Z` `0`-`9` `_`]<sup>+</sup>
>
> RAW_IDENTIFIER : `r#` IDENTIFIER_OR_KEYWORD <sub>*Except `crate`, `extern`, `self`, `super`, `Self`*</sub>
>
> NON_KEYWORD_IDENTIFIER : IDENTIFIER_OR_KEYWORD <sub>*Except a [strict] or [reserved] keyword*</sub>
>
> IDENTIFIER :\
> NON_KEYWORD_IDENTIFIER | RAW_IDENTIFIER


标识符是以下形式的任何非空ASCII字符串：

要么

- 第一个字符是一个字母。
- 其余字符是字母数字或_。

或者

- 第一个字符是_。
- 标识符不止一个字符。 单独`_`不是标识符。
- 其余字符是字母数字或_。

原始标识符类似于普通标识符，但以`r＃`为前缀。（请注意，`r＃`前缀不包含在实际标识符的一部分中。）与普通标识符不同，原始标识符可以是除上面列出的`RAW_IDENTIFIER`之外的任何严格或保留关键字。

[strict]: https://rustlang-cn.org/office/rust/reference/lexical-structure/keywords.html#%E4%B8%A5%E6%A0%BC%E5%85%B3%E9%94%AE%E5%AD%97
[reserved]: https://rustlang-cn.org/office/rust/reference/lexical-structure/keywords.html#%E4%BF%9D%E7%95%99%E5%85%B3%E9%94%AE%E5%AD%97
