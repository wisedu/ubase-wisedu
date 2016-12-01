# ubase-wisedu - 基于ubase-vue框架的wisedu项目定制

## 框架使用方式

1、安装及更新
```
npm i ubase-vue --save --registry=https://registry.npm.taobao.org --sass-binary-site=http://res.wisedu.com/FS/tools
```

2、gulpfile.js
```
var ubase = require('ubase-vue');

ubase({
   dest: './www',
   port: '8081'
 });

```

－－ubase配置项

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| autoImportVueComponent | 是否自动加载vue组件（应用目录及components目录） | Boolean | true | |
| alias | 配置别名 | Object | -- |  |
| langs | 支持的语言列表 | Array | ['cn'] | 此处列出的语言，需要在各个.i18n.js文件中export出来 |
| dest | 输出路径 | String | './www' |  |
| port | 端口 | string | '8081' |  |
| proxy | 代理 | Array | -- | { source: '/jcsj-apps-web', target: 'http://res.wisedu.com:8000' } |
| useConfigFile | 是否使用独立config文件 | Boolean | false | 如果配置信息希望在单独的文件中，该属性设置为true， 并在index.html的同级目录添加config.json文件即可 |


### 国际化
自动识别， 如果有.i18n.js文件，则添加国际化功能
```
// test.i18n.js

var cn = {
    title: 'helloworld'
};

export default { cn };
```

在js中的使用方式
```
Vue.t('test.title')
```
在template中的使用方式
```
$t('test.title')
```

## vuex
直接写.vuex.js文件即可
在.vue文件中通过下面方式引用：
```
computed: {
  ps(){
    return this.$store.state.test // 此处对应获取的是test.vuex.js文件中的状态
  }
},
```

## 跨组件方法调用

```
Ubase.invoke('vue.method' [, arg1, arg2...])
```
其中vue为.vue文件的前缀， method为改vue中methods选项下的方法名。
例如：如果要调用page1.vue的methods配置项中的reload方法，并传入一个参数3，则Ubase.invoke('page1.reload', '3')

## 全局更新vuex状态

```
Ubase.updateState('vuex', {'title': 'helloworld'})
// or
Ubase.updateState('vuex', {'info.name': '小明'})
```

其中vuex为.vuex.js的前缀，表示要更新哪个vuex下的状态
例如：如果要更新page1.vuex.js中的状态{info:{name:'zhangsan'}}，则Ubase.upateState('page1', {'info.name': 'xiaoming'})