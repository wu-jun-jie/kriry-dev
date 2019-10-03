exports.book = (title) => {
    return [
        '',
        'foreword',
        'ch00-00-introduction',
        {
            title: '开始',
            collapsable: true,
            children: [
            'getting-started/ch01-00-getting-started',
            'getting-started/ch01-01-installation',
            'getting-started/ch01-02-hello-world',
            'getting-started/ch01-03-hello-cargo'
            ]
        },
        {
            title: '编写猜猜看游戏',
            collapsable: true,
            children: [
            'guessing-game-tutorial/ch02-00-guessing-game-tutorial'
            ]
        },
        {
            title: '通用编程概念',
            collapsable: true,
            children: [
            'common-programming-concepts/ch03-00-common-programming-concepts',
            'common-programming-concepts/ch03-01-variables-and-mutability',
            'common-programming-concepts/ch03-02-data-types',
            'common-programming-concepts/ch03-03-how-functions-work',
            'common-programming-concepts/ch03-04-comments',
            'common-programming-concepts/ch03-05-control-flow'
            ]
        },
        {
            title: '理解所有权',
            collapsable: true,
            children: [
            'understanding-ownership/ch04-00-understanding-ownership',
            'understanding-ownership/ch04-01-what-is-ownership',
            'understanding-ownership/ch04-02-references-and-borrowing',
            'understanding-ownership/ch04-03-slices'
            ]
        },
        {
            title: '使用结构体组织相关数据',
            collapsable: true,
            children: [
            'structs/ch05-00-structs',
            'structs/ch05-01-defining-structs',
            'structs/ch05-02-example-structs',
            'structs/ch05-03-method-syntax'
            ]
        },
        {
            title: '枚举与模式匹配',
            collapsable: true,
            children: [
            'enums/ch06-00-enums',
            'enums/ch06-01-defining-an-enum',
            'enums/ch06-02-match',
            'enums/ch06-03-if-let'
            ]
        },
        {
            title: '包、Crates与模块',
            collapsable: true,
            children: [
            'packages-crates-and-modules/ch07-00-packages-crates-and-modules',
            'packages-crates-and-modules/ch07-01-packages-and-crates-for-making-libraries-and-executables',
            'packages-crates-and-modules/ch07-02-modules-and-use-to-control-scope-and-privacy'
            ]
        },
        {
            title: '通用集合类型',
            collapsable: true,
            children: [
            'common-collections/ch08-00-common-collections',
            'common-collections/ch08-01-vectors',
            'common-collections/ch08-02-strings',
            'common-collections/ch08-03-hash-maps'
            ]
        },
        {
            title: '错误处理',
            collapsable: true,
            children: [
            'error-handling/ch09-00-error-handling',
            'error-handling/ch09-01-unrecoverable-errors-with-panic',
            'error-handling/ch09-02-recoverable-errors-with-result',
            'error-handling/ch09-03-to-panic-or-not-to-panic'
            ]
        },
        {
            title: '泛型、特质与生命周期',
            collapsable: true,
            children: [
            'generics/ch10-00-generics',
            'generics/ch10-01-syntax',
            'generics/ch10-02-traits',
            'generics/ch10-03-lifetime-syntax'
            ]
        },
        {
            title: '测试',
            collapsable: true,
            children: [
            'testing/ch11-00-testing',
            'testing/ch11-01-writing-tests',
            'testing/ch11-02-running-tests',
            'testing/ch11-03-test-organization'
            ]
        },
        {
            title: 'I/O 项目：构建命令行程序',
            collapsable: true,
            children: [
            'an-io-project/ch12-00-an-io-project',
            'an-io-project/ch12-01-accepting-command-line-arguments',
            'an-io-project/ch12-02-reading-a-file',
            'an-io-project/ch12-03-improving-error-handling-and-modularity',
            'an-io-project/ch12-04-testing-the-librarys-functionality',
            'an-io-project/ch12-05-working-with-environment-variables',
            'an-io-project/ch12-06-writing-to-stderr-instead-of-stdout'
            ]
        },
        {
            title: '函数式语言特性：迭代器与闭包',
            collapsable: true,
            children: [
            'functional-features/ch13-00-functional-features',
            'functional-features/ch13-01-closures',
            'functional-features/ch13-02-iterators',
            'functional-features/ch13-03-improving-our-io-project',
            'functional-features/ch13-04-performance'
            ]
        },
        {
            title: 'Cargo 和 Crates.io更多信息',
            collapsable: true,
            children: [
            'more-about-cargo/ch14-00-more-about-cargo',
            'more-about-cargo/ch14-01-release-profiles',
            'more-about-cargo/ch14-02-publishing-to-crates-io',
            'more-about-cargo/ch14-03-cargo-workspaces',
            'more-about-cargo/ch14-04-installing-binaries',
            'more-about-cargo/ch14-05-extending-cargo'
            ]
        },
        {
            title: '智能指针',
            collapsable: true,
            children: [
            'smart-pointers/ch15-00-smart-pointers',
            'smart-pointers/ch15-01-box',
            'smart-pointers/ch15-02-deref',
            'smart-pointers/ch15-03-drop',
            'smart-pointers/ch15-04-rc',
            'smart-pointers/ch15-05-interior-mutability',
            'smart-pointers/ch15-06-reference-cycles'
            ]
        },
        {
            title: '无畏并发',
            collapsable: true,
            children: [
            'concurrency/ch16-00-concurrency',
            'concurrency/ch16-01-threads',
            'concurrency/ch16-02-message-passing',
            'concurrency/ch16-03-shared-state',
            'concurrency/ch16-04-extensible-concurrency-sync-and-send'
            ]
        },
        {
            title: 'Rust面向对象特性',
            collapsable: true,
            children: [
            'oop/ch17-00-oop',
            'oop/ch17-01-what-is-oo',
            'oop/ch17-02-trait-objects',
            'oop/ch17-03-oo-design-patterns'
            ]
        },
        {
            title: '模式匹配结构的值',
            collapsable: true,
            children: [
            'patterns/ch18-00-patterns',
            'patterns/ch18-01-all-the-places-for-patterns',
            'patterns/ch18-02-refutability',
            'patterns/ch18-03-pattern-syntax'
            ]
        },
        {
            title: '高级特征',
            collapsable: true,
            children: [
            'advanced-features/ch19-00-advanced-features',
            'advanced-features/ch19-01-unsafe-rust',
            'advanced-features/ch19-02-advanced-lifetimes',
            'advanced-features/ch19-03-advanced-traits',
            'advanced-features/ch19-04-advanced-types',
            'advanced-features/ch19-05-advanced-functions-and-closures',
            'advanced-features/ch19-06-macros'
            ]
        },
        {
            title: '最后项目: 构建多线程Web Server',
            collapsable: true,
            children: [
            'final-project-a-web-server/ch20-00-final-project-a-web-server',
            'final-project-a-web-server/ch20-01-single-threaded',
            'final-project-a-web-server/ch20-02-multithreaded',
            'final-project-a-web-server/ch20-03-graceful-shutdown-and-cleanup'
            ]
        },
        {
            title: '附录',
            collapsable: true,
            children: [
            'appendix/appendix-00',
            'appendix/appendix-01-keywords',
            'appendix/appendix-02-operators',
            'appendix/appendix-03-derivable-traits',
            'appendix/appendix-04-useful-development-tools',
            'appendix/appendix-05-editions',
            'appendix/appendix-06-translation',
            'appendix/appendix-07-nightly-rust'
            ]
        }
    ]
}
