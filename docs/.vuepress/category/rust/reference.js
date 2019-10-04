exports.reference = (title) => {
    return [
        '',
        'notation',
        {
            title: '词法结构',
            collapsable: true,
            children: [
            'lexical-structure/lexical-structure',
            'lexical-structure/input-format',
            'lexical-structure/keywords',
            'lexical-structure/identifiers',
            'lexical-structure/comments',
            'lexical-structure/whitespace',
            'lexical-structure/tokens',
            'lexical-structure/paths'
            ]
        },
        {
            title: '宏',
            collapsable: true,
            children: [
            'macros/macros',
            'macros/macros-by-example',
            'macros/procedural-macros'
            ]
        },
        'crates-and-source-files',
        'conditional-compilation',
        {
            title: '项和属性',
            collapsable: true,
            children: [
            'items-and-attributes/items-and-attributes',
            'items-and-attributes/items',
            'items-and-attributes/items/modules',
            'items-and-attributes/items/extern-crates',
            'items-and-attributes/items/use-declarations',
            'items-and-attributes/items/functions',
            'items-and-attributes/items/type-aliases',
            'items-and-attributes/items/structs',
            'items-and-attributes/items/enumerations',
            'items-and-attributes/items/unions',
            'items-and-attributes/items/constant-items',
            'items-and-attributes/items/static-items',
            'items-and-attributes/items/traits',
            'items-and-attributes/items/implementations',
            'items-and-attributes/items/external-blocks',
            'items-and-attributes/items/generics',
            'items-and-attributes/items/associated-items',
            'items-and-attributes/visibility-and-privacy',
            'items-and-attributes/attributes'
            ]
        },
        {
            title: '语句和表达式',
            collapsable: true,
            children: [
            'statements-and-expressions/statements-and-expressions',
            'statements-and-expressions/statements',
            'statements-and-expressions/expressions',
            'statements-and-expressions/expressions/literal-expr',
            'statements-and-expressions/expressions/path-expr',
            'statements-and-expressions/expressions/block-expr',
            'statements-and-expressions/expressions/operator-expr',
            'statements-and-expressions/expressions/grouped-expr',
            'statements-and-expressions/expressions/array-expr',
            'statements-and-expressions/expressions/tuple-expr',
            'statements-and-expressions/expressions/struct-expr',
            'statements-and-expressions/expressions/enum-variant-expr',
            'statements-and-expressions/expressions/call-expr',
            'statements-and-expressions/expressions/method-call-expr',
            'statements-and-expressions/expressions/field-expr',
            'statements-and-expressions/expressions/closure-expr',
            'statements-and-expressions/expressions/loop-expr',
            'statements-and-expressions/expressions/range-expr',
            'statements-and-expressions/expressions/if-expr',
            'statements-and-expressions/expressions/match-expr',
            'statements-and-expressions/expressions/return-expr'
            ]
        },
        'patterns',
        {
            title: '类型系统',
            collapsable: true,
            children: [
            'type-system/type-system',
            'type-system/types',
            'type-system/types/boolean',
            'type-system/types/numeric',
            'type-system/types/textual',
            'type-system/types/never',
            'type-system/types/tuple',
            'type-system/types/array',
            'type-system/types/slice',
            'type-system/types/struct',
            'type-system/types/enum',
            'type-system/types/union',
            'type-system/types/function-item',
            'type-system/types/closure',
            'type-system/types/pointer',
            'type-system/types/function-pointer',
            'type-system/types/trait-object',
            'type-system/types/impl-trait',
            'type-system/types/parameters',
            'type-system/types/inferred',
            'type-system/dynamically-sized-types',
            'type-system/type-layout',
            'type-system/interior-mutability',
            'type-system/subtyping',
            'type-system/trait-bounds',
            'type-system/type-coercions',
            'type-system/destructors',
            'type-system/lifetime-elision'
            ]
        },
        'special-types-and-traits',
        {
            title: '内存模型',
            collapsable: true,
            children: [
            'memory-model/memory-model',
            'memory-model/memory-allocation-and-lifetime',
            'memory-model/memory-ownership',
            'memory-model/variables'
            ]
        },
        'linkage',
        {
            title: 'Unsafe',
            collapsable: true,
            children: [
            'unsafety/unsafety',
            'unsafety/unsafe-functions',
            'unsafety/unsafe-blocks',
            'unsafety/behavior-considered-undefined',
            'unsafety/behavior-not-considered-unsafe'
            ]
        },
        'const_eval',
        'influences',
        'undocumented',
        'glossary'
    ]
}