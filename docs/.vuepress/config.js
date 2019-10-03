let { book } = require ('./category/rust.js')
let { advrust } = require ('./category/advrust.js')
let { asyncrust } = require ('./category/asyncrust.js')
let { reference } = require ('./category/reference.js')
let { cargo } = require ('./category/cargo.js')
let { book_exp } = require ('./category/user/book-exp.js')
let { www } = require ('./category/www.js')

module.exports = {
    extend: '@vuepress/theme-default',
    title: 'kriry开发者网络',
    description: 'Kriry Developer Net',
    head: [
      ['link', { rel: 'icon', href: `/favicon.ico` }],
      ['link', { rel: 'manifest', href: '/manifest.json' }],
      ['meta', { name: 'theme-color', content: '#3eaf7c' }],
      ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
      ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
      ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
      ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
    ],
    plugins: {
      '@vuepress/back-to-top': {},
      '@vuepress/pwa': {},
      'vuepress-plugin-baidu-autopush': {}
    },
    themeConfig: {
        repo: 'kriry/kdn',
        docsDir: 'docs',
        logo: '/imgs/rust.png',
        displayAllHeaders: true,
        editLinks: true,
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新', 
        sidebarDepth: 0,
        search: true,
        serviceWorker: {
          updatePopup: true
        },
        searchMaxSuggestions: 11,
        nav: [
          { text: 'kriry', link: 'http://kriry.com' },
          { text: '编程语言', items: [
              { text: 'Rust语言', items: [
                  { text: 'Rust总书录', link: '/rust/' },
                  { text: 'Rust编程语言', link: '/rust/rust/book/' },
                  { text: 'Rust高级编程', link: '/rust/rust/advrust/' },
                  { text: 'Rust异步编程', link: '/rust/rust/async-rust/' },
                  { text: 'Rust语言参考', link: '/rust/rust/reference/' },
                  { text: 'Cargo教程', link: '/rust/rust/cargo/' },
                  { text: 'The Book-学习心得', link: '/rust/user/book-exp/' }
                ]
              }
            ]
          },
          { text: '网络', link: '/www/resource.html' }
          
        ],
        sidebar: {
          '/rust/rust/book/': book('Rust'),
          '/rust/rust/advrust/': advrust('AdvRust'),
          '/rust/rust/async-rust/': asyncrust('Async-Rust'),
          '/rust/rust/reference/': reference('Reference'),
          '/rust/rust/cargo/': cargo('Cargo'),
          '/rust/user/book-exp/': book_exp('book_exp'),
          '/www/': www('www')
        }
    }
}

