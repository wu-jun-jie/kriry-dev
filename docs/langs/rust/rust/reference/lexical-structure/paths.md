# 路径

A *path* is a sequence of one or more path segments _logically_ separated by
a namespace qualifier (`::`). If a path
consists of only one segment, it refers to either an [item] or a [variable] in
a local control scope. If a path has multiple segments, it always refers to an
item.

Two examples of simple paths consisting of only identifier segments:

```rust,ignore
x;
x::y::z;
```

## Types of paths

### Simple Paths

> **<sup>Syntax</sup>**\
> _SimplePath_ :\
> &nbsp;&nbsp; `::`<sup>?</sup> _SimplePathSegment_ (`::` _SimplePathSegment_)<sup>\*</sup>
>
> _SimplePathSegment_ :\
> &nbsp;&nbsp; [IDENTIFIER] | `super` | `self` | `crate` | `$crate`

Simple paths are used in [visibility] markers, [attributes], [macros], and [`use`] items.
Examples:

```rust
use std::io::{self, Write};
mod m {
    #[clippy::cyclomatic_complexity = "0"]
    pub (in super) fn f1() {}
}
```

### Paths in expressions

> **<sup>Syntax</sup>**\
> _PathInExpression_ :\
> &nbsp;&nbsp; `::`<sup>?</sup> _PathExprSegment_ (`::` _PathExprSegment_)<sup>\*</sup>
>
> _PathExprSegment_ :\
> &nbsp;&nbsp; _PathIdentSegment_ (`::` _GenericArgs_)<sup>?</sup>
>
> _PathIdentSegment_ :\
> &nbsp;&nbsp; [IDENTIFIER] | `super` | `self` | `Self` | `crate` | `$crate`
>
> _GenericArgs_ :\
> &nbsp;&nbsp; &nbsp;&nbsp; `<` `>`\
> &nbsp;&nbsp; | `<` _GenericArgsLifetimes_ `,`<sup>?</sup> `>`\
> &nbsp;&nbsp; | `<` _GenericArgsTypes_ `,`<sup>?</sup> `>`\
> &nbsp;&nbsp; | `<` _GenericArgsBindings_ `,`<sup>?</sup> `>`\
> &nbsp;&nbsp; | `<` _GenericArgsTypes_ `,` _GenericArgsBindings_ `,`<sup>?</sup> `>`\
> &nbsp;&nbsp; | `<` _GenericArgsLifetimes_ `,` _GenericArgsTypes_ `,`<sup>?</sup> `>`\
> &nbsp;&nbsp; | `<` _GenericArgsLifetimes_ `,` _GenericArgsBindings_ `,`<sup>?</sup> `>`\
> &nbsp;&nbsp; | `<` _GenericArgsLifetimes_ `,` _GenericArgsTypes_ `,` _GenericArgsBindings_ `,`<sup>?</sup> `>`
>
> _GenericArgsLifetimes_ :\
> &nbsp;&nbsp; [_Lifetime_] (`,` [_Lifetime_])<sup>\*</sup>
>
> _GenericArgsTypes_ :\
> &nbsp;&nbsp; [_Type_] (`,` [_Type_])<sup>\*</sup>
>
> _GenericArgsBindings_ :\
> &nbsp;&nbsp; _GenericArgsBinding_ (`,` _GenericArgsBinding_)<sup>\*</sup>
>
> _GenericArgsBinding_ :\
> &nbsp;&nbsp; [IDENTIFIER] `=` [_Type_]

Paths in expressions allow for paths with generic arguments to be specified. They are
used in various places in [expressions] and [patterns].

The `::` token is required before the opening `<` for generic arguments to avoid
ambiguity with the less-than operator. This is colloquially known as "turbofish" syntax.

```rust
(0..10).collect::<Vec<_>>();
Vec::<u8>::with_capacity(1024);
```

## Qualified paths

> **<sup>Syntax</sup>**\
> _QualifiedPathInExpression_ :\
> &nbsp;&nbsp; _QualifiedPathType_ (`::` _PathExprSegment_)<sup>+</sup>
>
> _QualifiedPathType_ :\
> &nbsp;&nbsp; `<` [_Type_] (`as` _TypePath_)? `>`
>
> _QualifiedPathInType_ :\
> &nbsp;&nbsp; _QualifiedPathType_ (`::` _TypePathSegment_)<sup>+</sup>

Fully qualified paths allow for disambiguating the path for [trait implementations] and
for specifying [canonical paths](#canonical-paths). When used in a type specification, it
supports using the type syntax specified below.

```rust
struct S;
impl S {
    fn f() { println!("S"); }
}
trait T1 {
    fn f() { println!("T1 f"); }
}
impl T1 for S {}
trait T2 {
    fn f() { println!("T2 f"); }
}
impl T2 for S {}
S::f();  // Calls the inherent impl.
<S as T1>::f();  // Calls the T1 trait function.
<S as T2>::f();  // Calls the T2 trait function.
```

### Paths in types

> **<sup>Syntax</sup>**\
> _TypePath_ :\
> &nbsp;&nbsp; `::`<sup>?</sup> _TypePathSegment_ (`::` _TypePathSegment_)<sup>\*</sup>
>
> _TypePathSegment_ :\
> &nbsp;&nbsp; _PathIdentSegment_ (`::`<sup>?</sup> ([_GenericArgs_] | _TypePathFn_)<sup>?</sup>
>
> _TypePathFn_ :\
> `(` _TypePathFnInputs_<sup>?</sup> `)` (`->` [_Type_])<sup>?</sup>
>
> _TypePathFnInputs_ :\
> [_Type_] (`,` [_Type_])<sup>\*</sup> `,`<sup>?</sup>

Type paths are used within type definitions, trait bounds, type parameter bounds,
and qualified paths.

Although the `::` token is allowed before the generics arguments, it is not required
because there is no ambiguity like there is in _PathInExpression_.

```rust,ignore
impl ops::Index<ops::Range<usize>> for S { /*...*/ }
fn i() -> impl Iterator<Item = op::Example<'a>> { /*...*/ }
type G = std::boxed::Box<std::ops::FnOnce(isize) -> isize>;
```

## Path qualifiers

Paths can be denoted with various leading qualifiers to change the meaning of
how it is resolved.

### `::`

Paths starting with `::` are considered to be global paths where the segments of the path
start being resolved from the crate root. Each identifier in the path must resolve to an
item.

> **Edition Differences**: In the 2015 Edition, the crate root contains a variety of
> different items, including external crates, default crates such as `std` and `core`, and
> items in the top level of the crate (including `use` imports).
>
> Beginning with the 2018 Edition, paths starting with `::` can only reference crates.

```rust
mod a {
    pub fn foo() {}
}
mod b {
    pub fn foo() {
        ::a::foo(); // call a's foo function
    }
}
# fn main() {}
```

### `self`

`self` resolves the path relative to the current module. `self` can only be used as the
first segment, without a preceding `::`.

```rust
fn foo() {}
fn bar() {
    self::foo();
}
# fn main() {}
```

### `Self`

`Self`, with a capital "S", is used to refer to the implementing type within
[traits] and [implementations].

`Self` can only be used as the first segment, without a preceding `::`.

```rust
trait T {
    type Item;
    const C: i32;
    // `Self` will be whatever type that implements `T`.
    fn new() -> Self;
    // `Self::Item` will be the type alias in the implementation.
    fn f(&self) -> Self::Item;
}
struct S;
impl T for S {
    type Item = i32;
    const C: i32 = 9;
    fn new() -> Self {           // `Self` is the type `S`.
        S
    }
    fn f(&self) -> Self::Item {  // `Self::Item` is the type `i32`.
        Self::C                  // `Self::C` is the constant value `9`.
    }
}
```

### `super`

`super` in a path resolves to the parent module. It may only be used in leading
segments of the path, possibly after an initial `self` segment.

```rust
mod a {
    pub fn foo() {}
}
mod b {
    pub fn foo() {
        super::a::foo(); // call a's foo function
    }
}
# fn main() {}
```

`super` may be repeated several times after the first `super` or `self` to refer to
ancestor modules.

```rust
mod a {
    fn foo() {}

    mod b {
        mod c {
            fn foo() {
                super::super::foo(); // call a's foo function
                self::super::super::foo(); // call a's foo function
            }
        }
    }
}
# fn main() {}
```

### `crate`

`crate` resolves the path relative to the current crate. `crate` can only be used as the
first segment, without a preceding `::`.

```rust
fn foo() {}
mod a {
    fn bar() {
        crate::foo();
    }
}
# fn main() {}
```

### `$crate`

`$crate` is only used within [macro transcribers], and can only be used as the first
segment, without a preceding `::`. `$crate` will expand to a path to access items from the
top level of the crate where the macro is defined, regardless of which crate the macro is
invoked.

```rust
pub fn increment(x: u32) -> u32 {
    x + 1
}

#[macro_export]
macro_rules! inc {
    ($x:expr) => ( $crate::increment($x) )
}
# fn main() { }
```

## Canonical paths

Items defined in a module or implementation have a *canonical path* that
corresponds to where within its crate it is defined. All other paths to these
items are aliases. The canonical path is defined as a *path prefix* appended by
the path segment the item itself defines.

[Implementations] and [use declarations] do not have canonical paths, although
the items that implementations define do have them. Items defined in
block expressions do not have canonical paths. Items defined in a module that
does not have a canonical path do not have a canonical path. Associated items
defined in an implementation that refers to an item without a canonical path,
e.g. as the implementing type, the trait being implemented, a type parameter or
bound on a type parameter, do not have canonical paths.

The path prefix for modules is the canonical path to that module. For bare
implementations, it is the canonical path of the item being implemented
surrounded by angle (`<>`) brackets. For
[trait implementations], it is the canonical path of the item being implemented
followed by `as` followed by the canonical path to the trait all surrounded in angle (`<>`) brackets.

The canonical path is only meaningful within a given crate. There is no global
namespace across crates; an item's canonical path merely identifies it within
the crate.

```rust
// Comments show the canonical path of the item.

mod a { // ::a
    pub struct Struct; // ::a::Struct

    pub trait Trait { // ::a::Trait
        fn f(&self); // a::Trait::f
    }

    impl Trait for Struct {
        fn f(&self) {} // <::a::Struct as ::a::Trait>::f
    }

    impl Struct {
        fn g(&self) {} // <::a::Struct>::g
    }
}

mod without { // ::without
    fn canonicals() { // ::without::canonicals
        struct OtherStruct; // None

        trait OtherTrait { // None
            fn g(&self); // None
        }

        impl OtherTrait for OtherStruct {
            fn g(&self) {} // None
        }

        impl OtherTrait for ::a::Struct {
            fn g(&self) {} // None
        }

        impl ::a::Trait for OtherStruct {
            fn f(&self) {} // None
        }
    }
}

# fn main() {}
```

[_GenericArgs_]: #paths-in-expressions
[_Lifetime_]: trait-bounds.html
[_Type_]: types.html#type-expressions
[item]: items.html
[variable]: variables.html
[identifiers]: identifiers.html
[implementations]: items/implementations.html
[modules]: items/modules.html
[use declarations]: items/use-declarations.html
[IDENTIFIER]: identifiers.html
[`use`]: items/use-declarations.html
[attributes]: attributes.html
[enum]: items/enumerations.html
[expressions]: expressions.html
[macro transcribers]: macros-by-example.html
[macros]: macros-by-example.html
[patterns]: patterns.html
[struct]: items/structs.html
[trait implementation]: items/implementations.html#trait-implementations
[trait implementations]: items/implementations.html#trait-implementations
[traits]: items/traits.html
[union]: items/unions.html
[visibility]: visibility-and-privacy.html