let { book } = require ('./category/rust/rust.js')
let { advrust } = require ('./category/rust/advrust.js')
let { asyncrust } = require ('./category/rust/asyncrust.js')
let { reference } = require ('./category/rust/reference.js')
let { cargo } = require ('./category/rust/cargo.js')
let { discovery } = require ('./category/rust/discovery.js')
let { actix } = require ('./category/rust/actix.js')
let { actixweb } = require ('./category/rust/actixweb.js')
let { diesel } = require ('./category/rust/diesel.js')
let { riker } = require ('./category/rust/riker.js')
let { serde } = require ('./category/rust/serde.js')
let { tokio } = require ('./category/rust/tokio.js')
let { book_exp } = require ('./category/rust/user/book-exp.js')

let { book_c } = require ('./category/clang/book.js')

let { book_cpp } = require ('./category/cpp/book.js')

let { book_es } = require ('./category/ecmascript/book.js')

let { http2 } = require ('./category/protocol/http2.js')
let { http3 } = require ('./category/protocol/http3.js')


module.exports = {
    extend: '@vuepress/theme-default',
    title: 'kriry技术',
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
       { text: '阅读', link: '/read/' },
			 { text: '编程语言', items: [
				  	{ text: 'Clang', link: '/langs/clang/' },
				  	{ text: 'C++', link: '/langs/cpp/' },
            { text: 'Rust', link: '/langs/rust/' },
            { text: 'Java', link: '/langs/java/' },
				  	{ text: 'Ecmascript', link: '/langs/ecmascript/' },
			    	   ]
			},
			{ text: 'Web开发', items: [
			    { text: 'HTML', link: '/web/html/' },
			    { text: 'CSS', link: '/web/css/' },
			    { text: 'WebAPI', link: '/web/webapi/' },
			    ]
			},
					  { text: '数据库', items: [
							{ text: 'PostgreSQL', link: '/dba/postgresql/' }
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
			{ text: '框架', items: [
			    { text: 'LLVM', link: '/framework/llvm/' },
			    { text: 'React技术', link: '/framework/react/' },
			      ]
			},
			{ text: '工具', items: [
			    { text: 'Git', link: '/tool/git/' }
			      ]
			},
       { text: '合作', link: '/funding.html' },
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
          '/langs/rust/crate/actix/actix/': actix('Actix'),
          '/langs/rust/crate/actix/actix-web/': actixweb('Actix-Web'),
          '/langs/rust/crate/diesel/': diesel('Diesel'),
          '/langs/rust/crate/riker/': riker('Riker'),
          '/langs/rust/crate/serde/': serde('Serde'),
          '/langs/rust/user/book-exp/': book_exp('book_exp'),

          '/langs/clang/book/': book_c('Clang'),

          '/langs/cpp/book/': book_cpp('CPP'),

          '/langs/ecmascript/book/': book_es('Ecmascript'),
          
          '/protocol/http2/': http2('HTTP2'),
          '/protocol/http3/': http3('HTTP3'),
        }
    }
}

