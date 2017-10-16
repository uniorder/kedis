'use strict';

app.controller("ServerController", ["$scope", "$interval", "local", function ($scope, $interval, local) {
    $scope.moduleHidden = true;
    $scope.moduleTitle = "Connect to Redis Server";
    $scope.serverModel = {
        id: "",
        name: "",
        host: "",
        port: 6379,
        auth: "",
        pattern: ""
    };

    $scope.info = {}

    $scope.serverList = local.getObject("SERVER_LIST");

    //最后一次选中的服务器，用于优化速度，避免遍历
    let lastSelected;

    let dataSet = [];
    for (let i = 0; i < 100; i++) {
        dataSet.push(0);
    }

    let opt = {
        title: {
            text: "Output kbps"
        },
        xAxis: {
            labels: {
                enabled: false
            },
            type: 'datetime',
            tickPixelInterval: 1000
        },
        yAxis: [{
            title: {
                text: 'KBPS',
                enabled: false
            },
            min: 0
        }],
        legend: {
            "enabled": false
        },
        series: [{
            data: dataSet,
            type: 'areaspline',
            threshold: null,
            tooltip: {
                valueDecimals: 2
            },
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            }
        }]
    };

    let outputChart = new Highcharts.Chart('outputChart', opt);
    let newOpt = angular.copy(opt);
    newOpt.title.text = "Input kbps";
    let inputChart = new Highcharts.Chart('inputChart', newOpt);
    
    let client;
    let currentInterval;
    //选择服务器
    $scope.selectServer = function (server) {
        if (client) client.end(true);
        if (lastSelected) lastSelected.selected = false;
        if (currentInterval) $interval.cancel(currentInterval);
        server.selected = true;
        lastSelected = server;
        $scope.$emit("changeServer", server);

        client = redis.createClient({
            host: lastSelected.host,
            port: lastSelected.port,
            connect_timeout: 1000,
            password: server.password
        });


        currentInterval = $interval(function () {
            client.info(function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }

                let infors = result.split("# ");
                out: for (let i = 0; i < infors.length; i++) {

                    let str = infors[i];

                    if (str == "") {
                        continue out;
                    }

                    let info = str.split("\r\n");
                    $scope.info[info[0]] = {};
                    inner: for (let j = 1; j < info.length; j++) {
                        if (info[j] == "") {
                            continue inner;
                        }
                        let detail = info[j].split(":");
                        $scope.info[info[0]][detail[0]] = detail[1];
                    }
                }
                outputChart.series[0].addPoint($scope.info.Stats.instantaneous_output_kbps * 1, true, true);
                inputChart.series[0].addPoint($scope.info.Stats.instantaneous_input_kbps * 1, true, true);
                $scope.showServerInfo = true;
                $scope.$apply();
            });
        }, 1000);
    

    }

    //测试服务器连接
    $scope.testServer = function () {
        let client = redis.createClient({
            host: $scope.serverModel.host,
            port: $scope.serverModel.port,
            connect_timeout: 1000,
            password: $scope.serverModel.password
        }); //直连Redis
        client.on("error", function (err) {
            // alert(err);
            client.end(true);
        });
        client.ping(function (err, result) {
            if (err) {
                alert(err);
                return err;
            } else {
                alert("Success");
            }
            client.end(true);
        });
    }

    //新增服务器
    $scope.newServer = function () {

        if ($scope.modify) {
            let tmp = lastSelected;
            let tmpArr = [];
            for (let i = 0; i < $scope.serverList.length; i++) {
                if ($scope.serverList[i].host === lastSelected.host) {
                    console.log("删除成功");
                    continue;
                }
                tmpArr.push($scope.serverList[i]);
            }
            $scope.serverList = tmpArr;
            delete tmp.selected;
            $scope.serverList.push(tmp);
            $scope.modify = false;
            $scope.moduleHidden = true;
            $scope.moduleTitle = "Connect to Redis Server";
        } else {
            if (!$scope.serverList) {
                $scope.serverList = [];
            }
            for (let i = 0; i < $scope.serverList.length; i++) {
                if (($scope.serverModel.host === $scope.serverList[i].host &&
                    $scope.serverModel.port == $scope.serverList[i].port) ||
                    $scope.serverModel.name === $scope.serverList[i].name) {
                    alert("重复的IP或者名称");
                    return;
                }
            }
            delete $scope.serverModel.selected;
            $scope.serverModel.id = new Date().getTime();
            if (lastSelected) lastSelected.selected = false;
            $scope.serverList.push($scope.serverModel);
        }
        local.setObject("SERVER_LIST", $scope.serverList);

        $scope.serverModel = {
            name: "",
            host: "",
            port: 6379,
            password: "",
            pattern: ""
        };
        $scope.moduleHidden = true;
    }

    //修改服务器
    $scope.editServer = function () {

        if (lastSelected) {
            $scope.serverModel = lastSelected;
            $scope.moduleHidden = false;
            $scope.moduleTitle = "Modify Redis Server";
            $scope.modify = true;
        }
    }

    //删除服务器
    $scope.removeServer = function () {
        if (lastSelected) {
            let confirmed = confirm("You will delete a connection, are you sure?")
            if (confirmed) {
                let tmpArr = [];
                for (let i = 0; i < $scope.serverList.length; i++) {
                    if ($scope.serverList[i].host === lastSelected.host) {
                        continue;
                    }
                    tmpArr.push($scope.serverList[i]);
                }
                $scope.serverList = tmpArr;
                local.setObject("SERVER_LIST", $scope.serverList);
                $scope.$emit("clearKeys");
            }
        }
    }

    $scope.dropComplete = function () {
        console.log(arguments);
    }



}]);