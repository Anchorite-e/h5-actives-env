#活动页面编译环境 - gulp

> 实现活动页面、常规页面压缩、混淆功能，
> 页面内联使用ES6语法、Sass预处理简化样式编写

## 功能

> 1、本地编译、调试热更新
>
> 2、scss文件预处理
>
> 3、css文件添加浏览器前缀、css文件压缩
>
> 4、js文件ES6转ES5、js压缩
>
> 5、html/css/js/scss之外文件移动
>
> 6、html文件本地资源添加hash值(src=js/app.js?v=awe123s2)
>
> 7、html内容压缩
>

## 特色定制功能

> 1、内联样式、style标签内支持scss
>
> 2、内联javascript、script标签内支持ES6 (直接使用ES6，低版本浏览器不兼容、html文件压缩失效)
>

## 执行命令
```shell script
# 参数 可选
# 参数 --path 源码路径指定(默认src) --path try
# 参数 --output 输出路径指定(默认dist) --output public
# 参数 --env 编译环境指定(仅支持固定值) --env dev | pre | pdt

# build 
# 编译发布代码
# 默认源码文件夹-src 默认输出文件夹-dist 默认环境 pdt 
gulp build
gulp build --path try --output public --env pre

# dev 
# 编译调试 包含代码转换
# 默认源码文件夹-src 默认环境 dev
gulp dev
gulp dev --path try --env pre

# page 
# 简单开启热更新服务 
# 默认源码文件夹-src 默认环境 dev
gulp page 
gulp page --path try --env pre
```

## 版本要求

> 1、gulp-cli 2.2.0
> 
> 2、gulp 3.X (3.9.1)
>
> 3、node < 12 (v10.22.1)
>
