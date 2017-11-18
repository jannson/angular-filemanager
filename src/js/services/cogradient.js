(function (angular) {
    'use strict';
    angular.module('FileManagerApp').service('cogradient', [
        'apiMiddleware',
        function (ApiMiddleware) {
            var Cogradient = function () {
                this.apiMiddleware = new ApiMiddleware();
                this.requesting = false;
                this.historyList = [];
                this.list = [];
                this.deviceLists = [];
                this.device = {};
                this.error = '';
            };
            //异步处理，调用$q实现
            Cogradient.prototype.deferredHandler = function (data, deferred, code, defaultMsg) {
                if (!data || typeof data !== 'object') {
                    this.error = 'Error %s - Bridge response error, please check the API docs or this ajax response.'.replace('%s', code);
                }
                if (code == 404) {
                    this.error = 'Error 404 - Backend bridge is not working, please check the ajax response.';
                }
                if (code == 200) {
                    this.error = null;
                }
                if (!this.error && data.result && data.result.error) {
                    this.error = data.result.error;
                }
                if (!this.error && data.error) {
                    this.error = data.error.message;
                }
                if (!this.error && defaultMsg) {
                    this.error = defaultMsg;
                }
                if (this.error) {
                    return deferred.reject(data);
                }
                return deferred.resolve(data);
            };
            //废弃该方法
            Cogradient.prototype.lists = function () {
                return this.apiMiddleware.list([], this.deferredHandler.bind(this));
            };
            Cogradient.prototype.listTask = function (routerId) {
                return this.apiMiddleware.listTask(routerId, this.deferredHandler.bind(this));
            };
            Cogradient.prototype.historyTask = function () {
                return this.apiMiddleware.historyTask(this.deferredHandler.bind(this));
            };
            Cogradient.prototype.cancel = function (routerId, key) {
                return this.apiMiddleware.cancelTask(routerId, key, this.deferredHandler.bind(this));
            };
            Cogradient.prototype.getRouterInfo = function () {
                return this.apiMiddleware.getRouterInfo(this.deferredHandler.bind(this));
            };
            Cogradient.prototype.uploadFile = function (params) {
                return this.apiMiddleware.uploadFile(params, this.deferredHandler.bind(this));
            };
            //刷新同步列表
            Cogradient.prototype.refreshHistory = function () {
                var self = this;
                self.requesting = true;
                self.historyList = [];
                return self.historyTask().then(function (data) {
                    if (!data.success&&data.success==false) {
                        var r = confirm('请求失败，是否重试');
                        if (r == true) {
                            self.refreshHistory();
                        } else {
                            alert('取消请求！');
                        }
                    } else {
                        self.historyList = data;
                    }
                }).finally(function () {
                    self.requesting = false;
                });
            };
            //根据[routerId]，默认当前设备，刷新同步列表 3秒一次
            Cogradient.prototype.refreshList = function (routerId) {
                var self = this;

                var deviceId = routerId || self.device.routerId;
                self.requesting = true;
                self.list = [];
                return self.listTask(deviceId).then(function (data) {
                    self.list = data.result;
                    var array = self.deviceLists;
                    for (var i = 0, len = array.length; i < len; i++) {
                        if (array[i].routerId == routerId) {
                            array[i].list = data.result;
                            if (data.result == 0) {
                                array[i].child = false;
                            } else {
                                array[i].child = true;
                            }
                            break;
                        }
                    }

                }).finally(function () {
                    self.requesting = false;
                });
            };
            //根据routerId和key取消任务
            Cogradient.prototype.cancelTask = function (routerId, key) {
                var self = this;
                self.requesting = true;
                // self.list = [];
                return self.cancel(routerId, key).then(function (data) {
                    // self.list = data.result;
                    console.log(data);
                }).finally(function () {
                    self.requesting = false;
                });
            };
            //获取当前设备信息
            Cogradient.prototype.getCurrentDevice = function () {
                var self = this;

                // self.requesting = true;
                // return self.getRouterInfo().then(function (data) {
                //     if (data.routers.length==0){
                //         alert('网络连接失败，请重试！');
                //         return;
                //     }
                var array = JSON.parse(localStorage.getItem('deviceList'));
                for (var i = 0, len = array.length; i < len; i++) {
                    if (array[i].isCurrentDevice) {
                        self.device = {
                            routerId: array[i].routerId,
                            name: array[i].name
                        }
                        continue;
                    }
                    var o = {};
                    o.routerId = array[i].routerId;
                    o.name = array[i].name;
                    o.hidden = true;
                    o.list = [];
                    o.child = false;
                    self.deviceLists.push(o);
                }
                // }).finally(function () {
                //     self.requesting = false;
                // })
            }
            Cogradient.prototype.reloadFile = function (param) {
                var self = this;
                self.requesting = true;
                return self.uploadFile(param).then(function (data) {
                    console.log(JSON.stringify(data));
                }).finally(function () {
                    self.requesting = false;
                })
            }
            return Cogradient;
        }
    ]);
})(angular);