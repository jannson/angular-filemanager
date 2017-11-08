以右键菜单，“增量同步” 来描述 fe 的 js 开发过程：
1. template

https://github.com/jannson/angular-filemanager/blob/fe/src/templates/item-context-menu.html#L52

要先加设计元素到 template 文件夹。template 上面有事件响应，点击的时候，会运行 modalWithPathSelector 函数

2. controllers

https://github.com/jannson/angular-filemanager/blob/fe/src/js/controllers/main.js#L175

$scope 是一个全局变量，可以在 template 等地方调用。

3. $scope.modal

模态窗口。负责模态窗口的展示。
模态窗口对应的 template 在：https://github.com/jannson/angular-filemanager/blob/fe/src/templates/modals.html#L74
通过代码 <form ng-submit="rsync()"> 最终在模态窗口点击按钮之后，会运行 $scope.rsync 函数。

4. $scope.rsync

所有的动作，都在另外一个 service 里面实现业务逻辑，比如 $scope.apiMiddleware = new ApiMiddleware();代码在 https://github.com/jannson/angular-filemanager/blob/fe/src/js/services/apimiddleware.js#L39

5. ApiHandler

apiHandler 是负责网络请求的，通过 promise 等机制，请求网络，响应成功或失败再处理相关的函数。

