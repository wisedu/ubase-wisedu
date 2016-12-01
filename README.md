# ubase-wisedu - 基于ubase-vue框架的项目定制文件

## 框架使用方式

1、安装
```
npm i ubase-vue --save --registry=https://registry.npm.taobao.org --sass-binary-site=http://res.wisedu.com/FS/tools
```

2、gulpfile.js
```
var wisf = require('wisf');

wisf({
   dest: './www',
   port: '8081'
 });

```