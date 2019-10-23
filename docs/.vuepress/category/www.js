exports.www = (title) => {
    return [
        '',
        {
            title: 'Linux',
            collapsable: true,
            children: [
                'linux/resource'
            ]
          },
          {
            title: 'Harmony',
            collapsable: true,
            children: [
                'harmony/resource'
            ]
          },
          {
            title: 'Clang',
            collapsable: true,
            children: [
                'clang/resource'
            ]
          },
          {
            title: 'Rust',
            collapsable: true,
            children: [
                'rust/resource',
                'rust/crates',
                'rust/wasm',
                'rust/iot',
                'rust/server',
                'rust/actix',
                'rust/tokio'
            ]
          },
          {
            title: 'Ecmascript',
            collapsable: true,
            children: [
                'ecmascript/resource'
            ]
          },
          {
            title: 'Html',
            collapsable: true,
            children: [
                'web/html'
            ]
          },
          {
            title: 'CSS',
            collapsable: true,
            children: [
                'web/css'
            ]
          },
          {
            title: 'WebAPI',
            collapsable: true,
            children: [
                'web/webapi'
            ]
          },
          {
            title: 'PostgreSQL',
            collapsable: true,
            children: [
                'dba/postgresql'
            ]
          },
          {
            title: 'HTTP2',
            collapsable: true,
            children: [
                'protocol/http2'
            ]
          },
          {
            title: 'HTTP3',
            collapsable: true,
            children: [
                'protocol/http3'
            ]
          }
    ]
}
