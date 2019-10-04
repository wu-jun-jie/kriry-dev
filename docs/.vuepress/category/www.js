exports.www = (title) => {
    return [
        '',
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
          }
    ]
}
