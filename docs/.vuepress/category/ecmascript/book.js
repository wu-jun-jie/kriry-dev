exports.book_es = (title) => {
    return [
        '',
	'1.语法',
	'2.变量',
	'3.值与类型',
	{
            title: '类型',
            collapsable: true,
            children: [
            'type/4-1.Number',
            'type/4-2.String',
            'type/4-3.Symbol',
            'type/4-4.Array',
	    'type/4-5.Function',
	    'type/4-6.Object'
            ]
        },
	{
            title: '对象',
            collapsable: true,
            children: [
            'object/5-1.Arraybuffer',
            'object/5-2.Date',
            'object/5-3.Math',
            'object/5-4.Json',
	    'object/5-5.Regexp',
	    'object/5-6.错误处理'
            ]
        },
	'6.操作符',
	'7.表达式',
	'8.迭代器',
	'9.Set-Map',
	'10.Class',
	'11.Decorator',
	'12.Generator',
	'13.Promise',
	'14.Proxy-Reflect',
	'15.Module',
	'16.Async',
	'17.attributes',
	'18.Strict模式'
    ]
}
