let { book } = require ('./category/rust/rust.js')
let { advrust } = require ('./category/rust/advrust.js')
let { asyncrust } = require ('./category/rust/asyncrust.js')
let { reference } = require ('./category/rust/reference.js')
let { cargo } = require ('./category/rust/cargo.js')
let { discovery } = require ('./category/rust/discovery.js')
let { actixweb } = require ('./category/rust/actixweb.js')
let { diesel } = require ('./category/rust/diesel.js')
let { riker } = require ('./category/rust/riker.js')
let { serde } = require ('./category/rust/serde.js')
let { tokio } = require ('./category/rust/tokio.js')
let { book_exp } = require ('./category/rust/user/book-exp.js')

let { book_c } = require ('./category/clang/book.js')

let { book_cpp } = require ('./category/cpp/book.js')

let { book_es } = require ('./category/ecmascript/book.js')

let { www } = require ('./category/www.js')

module.exports = {
    extend: '@vuepress/theme-default',
    title: 'kriry开发者网络',
    description: '始于开发者, 服务于开发者的网络资源',
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
        repo: 'kriry/kriry-dev',
        docsDir: 'docs',
        logo: '/imgs/kriry-logo.png',
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
			  { text: 'kriry.com', link: 'http://kriry.com' },
			  { text: 'Web开发', items: [
				   	{ text: 'HTML', link: '/web/html/' },
				    	{ text: 'CSS', link: '/web/css/' },
				    	{ text: 'WebAPI', link: '/web/api/' },
			  	    ]
			  },
			  { text: '编程语言', items: [
				  	{ text: 'C语言目录', link: '/langs/clang/' },
				  	{ text: 'C++语言目录', link: '/langs/cpp/' },
				  	{ text: 'Rust语言目录', link: '/langs/rust/' },
				  	{ text: 'Ecmascript目录', link: '/langs/ecmascript/' },
			    	   ]
			  },
			  { text: '数据库', items: [
				  	{ text: 'PostgreSQL', link: '/dba/postgresql/' },
				  	{ text: 'MongoDB', link: '/dba/mongodb/' },
			    	    ]
			  },
			  { text: '操作系统', items: [
				  	{ text: 'Linux', link: '/os/linux/' },
				  	{ text: 'Harmony', link: '/os/harmony/' },
			    	    ]
			  },
			  { text: '协议', items: [
				  	{ text: 'HTTP2', link: '/protocol/http2/' },
				  	{ text: 'HTTP3', link: '/protocol/http3/' },
			    	   ]
			  },
			  { text: '网络', link: '/www/' },
			  { text: '微博', link: 'https://weibo.com/kriry?is_all=1' }
        ],
        sidebar: {
          '/langs/rust/rust/book/': book('Rust'),
          '/langs/rust/rust/advrust/': advrust('AdvRust'),
          '/langs/rust/rust/async-rust/': asyncrust('Async-Rust'),
          '/langs/rust/rust/reference/': reference('Reference'),
          '/langs/rust/rust/cargo/': cargo('Cargo'),
          '/langs/rust/rust/discovery/': discovery('Discovery'),
          '/langs/rust/crate/tokio/': tokio('Tokio'),
          '/langs/rust/crate/actix-web/': actixweb('Actix-Web'),
          '/langs/rust/crate/diesel/': diesel('Diesel'),
          '/langs/rust/crate/riker/': riker('Riker'),
          '/langs/rust/crate/serde/': serde('Serde'),
          '/langs/rust/user/book-exp/': book_exp('book_exp'),

          '/langs/clang/': book_c('Clang'),

          '/langs/cpp/book/': book_cpp('CPP'),

          '/langs/ecmascript/book/': book_es('Ecmascript'),

          '/www/': www('www')
        }
    }
}

