exports.tokio = (title) => {
    return [
        {
          title: '起步',
          collapsable: true,
          children: [
            'getting-started/hello-world',
            'getting-started/futures',
            'getting-started/runtime',
            'getting-started/echo'
          ]
        },
        {
          title: '使用 Future 工作',
          collapsable: true,
          children: [
            'futures/overview',
            'futures/basic',
            'futures/getting_asynchronous',
            'futures/combinators',
            'futures/streams',
            'futures/spawning',
            'futures/leaf-futures',
            'futures/runtime-model'
          ]
        },
        {
          title: 'Tokio与I/O',
          collapsable: true,
          children: [
            'io/overview',
            'io/reading_writing_data',
            'io/async_read_write',
            'io/impl_async_read_write',
            'io/filesystem',
            'io/datagrams'
          ]
        },
        {
          title: '深入',
          collapsable: true,
          children: [
            'going-deeper/futures',
            'going-deeper/tasks',
            'going-deeper/runtime-model',
            'going-deeper/io',
            'going-deeper/chat',
            'going-deeper/timers',
            'going-deeper/futures-mechanics',
            'going-deeper/returning',
            'going-deeper/frames',
            'going-deeper/building-runtime'
          ]
        },
        {
          title: '内部原理',
          collapsable: true,
          children: [
            'internals/intro',
            'internals/runtime-model',
            'internals/net'
          ]
        }
    ]
}
