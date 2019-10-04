exports.advrust = (title) => {
    return [
        '',
        {
            title: '遇见Safe与Unsafe',
            collapsable: true,
            children: [
            'meet-safe-and-unsafe/meet-safe-and-unsafe',
            'meet-safe-and-unsafe/safe-unsafe-meaning',
            'meet-safe-and-unsafe/what-unsafe-does',
            'meet-safe-and-unsafe/working-with-unsafe'
            ]
        },
        {
            title: '数据布局',
            collapsable: true,
            children: [
            'data/data',
            'data/repr-rust',
            'data/exotic-sizes',
            'data/other-reprs'
            ]
        },
        {
            title: '所有权',
            collapsable: true,
            children: [
            'ownership/ownership',
            'ownership/references',
            'ownership/aliasing',
            'ownership/lifetimes',
            'ownership/lifetime-mismatch',
            'ownership/lifetime-elision',
            'ownership/unbounded-lifetimes',
            'ownership/hrtb',
            'ownership/subtyping',
            'ownership/dropck',
            'ownership/phantom-data',
            'ownership/borrow-splitting'
            ]
        },
        {
            title: '转换',
            collapsable: true,
            children: [
            'conversions/conversions',
            'conversions/coercions',
            'conversions/dot-operator',
            'conversions/casts',
            'conversions/transmutes'
            ]
        },
        {
            title: '未初始化',
            collapsable: true,
            children: [
            'uninitialized/uninitialized',
            'uninitialized/checked-uninit',
            'uninitialized/drop-flags',
            'uninitialized/unchecked-uninit'
            ]
        },
        {
            title: '基于所有权的资源管理',
            collapsable: true,
            children: [
            'obrm/obrm',
            'obrm/constructors',
            'obrm/destructors',
            'obrm/leaking'
            ]
        },
        {
            title: '展开',
            collapsable: true,
            children: [
            'unwinding/unwinding',
            'unwinding/exception-safety',
            'unwinding/poisoning'
            ]
        },
        {
            title: '并发',
            collapsable: true,
            children: [
            'concurrency/concurrency',
            'concurrency/races',
            'concurrency/send-and-sync',
            'concurrency/atomics'
            ]
        },
        {
            title: '实现Vec',
            collapsable: true,
            children: [
            'vec/vec',
            'vec/vec-layout',
            'vec/vec-alloc',
            'vec/vec-push-pop',
            'vec/vec-dealloc',
            'vec/vec-deref',
            'vec/vec-insert-remove',
            'vec/vec-into-iter',
            'vec/vec-raw',
            'vec/vec-drain',
            'vec/vec-zsts',
            'vec/vec-final'
            ]
        },
        {
            title: '实现Arc和Mutex',
            collapsable: true,
            children: [
            'arc-and-mutex/arc-and-mutex'
            ]
        },
        {
            title: 'FFI',
            collapsable: true,
            children: [
            'ffi/ffi'
            ]
        },
        {
            title: '标准库之下',
            collapsable: true,
            children: [
            'beneath-std/beneath-std',
            'beneath-std/panic-handler'
            ]
        }
    ]
}
