# JQuery_TodoList
用jQuery实现的清单列表：具备定时提醒，本地存储，异步浏览器弹窗，数据的增删改等功能

**项目心得：**

- 输入命令行`npm init`之后，输入`npm install jquery --save`可以在*package.json*中添加依赖，下次使用`npm install`可安装回jquery，而不用再输入一样的命令行
- css中的`max-width`会使容器中的内容随浏览器的变化而变化
- 页面中选择引入*normalize.css*而不是*reset.css*， *normalize.css*可以使页面的样式正常化，而不会覆盖掉一些有用的默认样式，比如`<h1>`这些样式
- Localstorage的实现思路是将task对象添加到Array中，再把Array放入JSON中，再把JSON存储到Localstorage中。取出task对象，则是将JSON对象JSON Parse成Array，再传入index
- 在页面完成渲染后，再取出index
- 数组合并使用`$.merge()`，对象合并使用`$.extend()`
- 使用js默认的confirm或alert会把后台的文档流都停止掉，直到用户点击选项。自定义的弹窗功能点击后，页面其它程序还在运行
- 异步操作：使用jQuery的`$.Deferred()`的`promise()`和`resolve()`两个方法


**页面截图如下：**

> 页面首页

![whole-page](https://github.com/ickedesign/JQuery_TodoList/blob/master/page_screenshot/whole-page.png)

> 点击“详情”，出现的详情页

![detail-page](https://github.com/ickedesign/JQuery_TodoList/blob/master/page_screenshot/detail-page.png)

> 在详情页双击标题，可以更改标题

![detail-page-title](https://github.com/ickedesign/JQuery_TodoList/blob/master/page_screenshot/detail-page-title.png)

> 在详情页点击时间栏可更新时间

![detail-page-time](https://github.com/ickedesign/JQuery_TodoList/blob/master/page_screenshot/detail-page-time.png)

> 点击“删除”，出现的删除页

![delete-page](https://github.com/ickedesign/JQuery_TodoList/blob/master/page_screenshot/delete-page.png)

> 定时提醒页面，有提示音

![remind-page](https://github.com/ickedesign/JQuery_TodoList/blob/master/page_screenshot/remind-page.png)

