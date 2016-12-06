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


3、运行

#### dev
```bash
$ gulp --debug
```

#### production
```bash
$ gulp --production
```

## 项目目录结构
#### 单app模式
```
src/
├── components/
├── pages/
│   ├── page1
│   │   ├── page1.i18n.js // 国际化文件
│   │   ├── pag1.vue // 主文件
│   │   ├── page1.service.js //service
│   │   └──page1.vuex.js // 状态文件
│   ├── index.html  // 必须
│   ├── routes.js  // 必须
│   ├── config.json  // 必须
│   └── ...
└── statics/
    ├── images/
    └── ...
```
#### 多app模式
```
src/
├── components/
├── pages/
│   ├── app1
│   │   ├── index.html
│   │   ├── routes.js
│   │   ├── config.json
│   │   └── ...
│   ├── app2
│   │    ├── index.html
│   │    ├── routes.js
│   │    ├── config.json
│   │    └── ...
│   ├── base.i18n.js // 多app共享国际化文件
│   └── ...
└── statics/
    ├── images/
    └── ...
```

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


## 支持弹框类型(6种)

### 纸质弹框

#### 调用方式
* 打开
```
Utils.paperDialog({
    title: "编辑"
    currentView: 'addOrEdit'
});
```
* 手动隐藏
```
Utils.paperDialog('hide')
```

#### Properties

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| currentView | 组件名称 | String | '' | 纸质弹框中需要显示的vue组件名称（框架通过动态组件加载）|
| title | 弹框标题 | String | -- | 如果动态组件中未设置h2标题，则弹框的标题为该title |

### 属性弹框

#### 调用方式
* 打开
```
Utils.propertyDialog({
    currentView: 'departCategoryAddOrEdit',
    okEvent: 'moduleName.methodName',
    title: Vue.t('departCategory.propertyDialog.edit_title'),
    footerShow: false
})
```
* 手动隐藏
```
Utils.propertyDialog('hide')
```

#### Properties

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| currentView | 组件名称 | String | -- | 弹框中需要显示的vue组件名称（框架通过动态组件加载）|
| title | 弹框标题 | String | -- | 如果动态组件中未设置h2标题，则弹框的标题为该title |
| footerShow | 是否显示底部按钮 | true | -- | 底部按钮区域是否显示 |
| okEvent | 确定按钮事件 | Function | -- | 底部确定按钮事件，'.'前面是.vue文件的名称，'.'后面是该vue文件内methods下面的方法 |

### 对话框
* 打开
```
Utils.dialog({
    currentView: 'departCategoryAddOrEdit',
    title: Vue.t('departCategory.propertyDialog.edit_title'),
    width: '400px',
    height: '500px'
})
```
* 手动隐藏
```
Utils.dialog('hide')
```

#### Properties

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| currentView | 组件名称 | String | -- | 对话框中需要显示的vue组件名称（框架通过动态组件加载）|
| title | 弹框标题 | String | -- | 如果动态组件中未设置h2标题，则弹框的标题为该title |
| width | 宽度 | String | '500px' | 对话框宽度 |
| height | 高度 | String | '600px' | 对话框高度 |
| buttons | 自定义按钮组 | Array | -- | [{text: '确定',className: 'bh-btn-primary',callback: callback}] |
| okEvent | 确定按钮事件 | Function | -- | 底部确定按钮事件，'.'前面是.vue文件的名称，'.'后面是该vue文件内methods下面的方法 |


### tip弹框
* 打开
```
Utils.tip({
    content: '保存成功！',
    state: 'success',
})
```

#### Properties

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| content | 提示内容 | String | '' | |
| state | 提示类型 | String | -- | 可选值：primary, success, warning, danger, loading  |
| hideWaitTime | 自定义停留时间 | Integer | 5000 |  |
| iconClass | 自定义图标提示 | String | -- | 可选 |
| onClosed | 提示关闭的回调 | Function | -- |  |


### toast弹框
* 打开
```
Utils.toast({
    type: 'warning',
    title: '确定删除吗？',
    content: '删除后数据将无法恢复？',
    okEvent: 'moduleName.methodName'
})
```
* 手动隐藏
```
Utils.toast('hide')
```

#### Properties

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| title | 提示标题 | String | -- |   |
| content | 弹框内容 | String | -- | |
| type | 弹框类型 | String | -- | 可选值：success, warning, danger |
| okEvent | 确定按钮事件 | Function | -- | '.'前面是.vue文件的名称，'.'后面是该vue文件内methods下面的方法 |
| okText | 确定按钮文字 | String | 确定 | |
| cancelEvent | 取消按钮事件 | Function | -- |  |
| cancelText | 取消按钮文字 | String | 取消 |  |


### pop弹框
* 打开
```
Utils.pop({
    selector: event.currentTarget
    currentView: 'departCategoryAddOrEdit',
    width:'500px',
    height:'400px'
})
```
* 手动隐藏
```
Utils.pop('hide')
```

#### Properties

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| title | 提示标题 | String | -- |   |
| currentView |组件名称 | String | -- | 对话框中需要显示的vue组件名称（框架通过动态组件加载）|
| width | 宽度 | String | -- | 对话框宽度 |
| height | 高度 | String | --' | 对话框高度 |