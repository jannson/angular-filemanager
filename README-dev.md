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


## 新增接口

1. 获取当前设备信息
名字： /api/routerInfo 比如 GET http://127.0.0.1:4000/api/routerInfo
方法：GET
返回值：

routerId: 设备ID 
其它信息可以暂时不管

比如返回值如下：


```
{
    "natTcpExternalAddr": "183.15.180.190:33574",
    "natTcpLocalAddr": "192.168.6.231:2300",
    "natUdpExternalAddr": "183.15.180.190:35590",
    "routerId": "8B46EC49E550",
    "sharePath": "/home/janson/Downloads/tmp",
    "userToken": "xxxx"
}
```

2. 获取设备正在执行的任务列表　符号　”[]“　表示要替换成具体的参数
名字： /api/listTask/[当前设备ID]
方法：GET
参数：当前设备 ID 为具体的设备名字，比如 8B46EC49E550
返回值：

```
{
    "result": [
        {
            "key": 任务唯一标识，用于取消任务的参数,
            "parentKey": 父级任务 ID,
            "fromRouter": 任务的来源设备,
            "fromPath": 任务的来源路径,
            "toPath": 同步到的文件夹,
            "toRouter": 同步到的设备,
            "progress": 当前进度,
            "downloadSpeed": 下载速率 B/s,
            "uploadSpeed": 上传速度 B/s,
            "error": "",
            "childs": [
                若同步文件夹，则有子任务
            ]
        }
    ]
}
```

具体一个请求的例子：

```
http://127.0.0.1:4000/api/listTask/8B46EC49E550

{
    "result": [
        {
            "key": "/go1.9.linux-amd64.tar.gz",
            "parentKey": "",
            "fromRouter": "8B46EC49E550",
            "fromPath": "/koolsoft/go1.9.linux-amd64.tar.gz",
            "toPath": "/go1.9.linux-amd64.tar.gz",
            "toRouter": "9F154EFE83B0",
            "progress": 4,
            "downloadSpeed": 37,
            "uploadSpeed": 1186856,
            "error": "",
            "childs": null
        }
    ]
}
```

3. 取消任务
接口名字：　/api/cancelTask
方法： POST
参数：

```
{"routerId":"[设备ID]","jobKey":"[任务唯一标识]"}
```

返回：
```
{
    "result": {
        "success": true,
        "error": ""
    }
}
```

4. 获取历史任务列表（成功失败的都有）
名字： /api/listTask/[当前设备ID]
方法：GET
参数：当前设备 ID 为具体的设备名字，比如 8B46EC49E550
返回值：

```
[
    {
        "key": "/go1.9.linux-amd64.tar.gz",
        "parentKey": "",
        "fromRouter": "8B46EC49E550",
        "fromPath": "4.tar.gz",
        "toPath": "/go1.9.linux-amd64.tar.gz",
        "toRouter": "9F154EFE83B0",
        "progress": 100,
        "downloadSpeed": 0,
        "uploadSpeed": 0,
        "error": "",
        "childs": null
    },
    {
        "key": "/go1.9.linux-amd64.tar.gz",
        "parentKey": "",
        "fromRouter": "8B46EC49E550",
        "fromPath": "/koolsoft/go1.9.linux-amd64.tar.gz",
        "toPath": "/go1.9.linux-amd64.tar.gz",
        "toRouter": "9F154EFE83B0",
        "progress": 17,
        "downloadSpeed": 7,
        "uploadSpeed": 1024287,
        "error": "already closed",
        "childs": null
    }
]
```

5. 修改设备名字
/api/routerRename
```
{
  "routerId": "9F154EFE83B0",
  "name": "中文222"
}

{
    "result": {
        "success": true,
        "error": ""
    }
}

```

6. 设备名字
/api/routerInfo
输入：空
返回：
```
{
    "natTcpExternalAddr": "",
    "natTcpLocalAddr": "10.1.110.13:2300",
    "natType": "\u0007",
    "natUdpExternalAddr": "61.141.65.123:51602",
    "routerId": "9F154EFE83B0",
    "routers": [
        {
            "routerId": "8B46EC49E550",
            "name": "test",
            "useLan": false,
            "p2pType": -1,
            "useDirect": false,
            "isConnect": false
        },
        {
            "routerId": "947196565000",
            "name": "MyRouter",
            "useLan": false,
            "p2pType": -1,
            "useDirect": false,
            "isConnect": false
        },
        {
            "routerId": "9F154EFE83B0",
            "name": "中文222",
            "useLan": false,
            "p2pType": 0,
            "useDirect": false,
            "isConnect": false
        }
    ],
    "sharePath": "/home/janson/download",
    "userToken": "0e48cd7b-4ddc-401e-a78f-22e3b4a522e1"
}
```

7. 初始化数据
POST http://127.0.0.1:4000/api/config
输入

```
{"username":"xxx-xxx-xxx-xxxx","sharePath":"/home/janson/Downloads/tmp"}
```

返回

```
{
    "result": {
        "success": true,
        "error": ""
    }
}
```

8. 获取初始化数据
GET http://127.0.0.1:4000/api/config
返回
```
{"username":"xxx-xxx-xxx-xxxx","sharePath":"/home/janson/Downloads/tmp"}
```

