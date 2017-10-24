app.directive('ioChart', function () {
    return {
        restrict: 'E',
        template: '<div ng-model="server" style="height:150px;"></div>',
        replace: true,
        scope: {
            server: "="
        },
        controller: function ($scope, $element, $interval) {
            $scope.server.info = {};
            let dataSet = [];
            for (let i = 0; i < 100; i++) {
                dataSet.push(0);
            }
            let opt = {
                title: {
                    text: $element[0].title
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
                    name: "Input kbps",
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
                }, {
                    name: "Output kbps",
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
                            [0, Highcharts.getOptions().colors[1]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[1]).setOpacity(0).get('rgba')]
                        ]
                    }
                }]
            };
            let chart = new Highcharts.Chart($element[0], opt);
            let client = redis.createClient({
                host: $scope.server.host,
                port: $scope.server.port,
                connect_timeout: $scope.server.timeout
            });
            let currentThread = $interval(function () {
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
                        $scope.server.info[info[0]] = {};
                        inner: for (let j = 1; j < info.length; j++) {
                            if (info[j] == "") {
                                continue inner;
                            }
                            let detail = info[j].split(":");
                            $scope.server.info[info[0]][detail[0]] = detail[1];
                        }
                    }

                    chart.series[0].addPoint($scope.server.info.Stats.instantaneous_input_kbps * 1, true, true);
                    chart.series[1].addPoint($scope.server.info.Stats.instantaneous_output_kbps * 1, true, true);
                });
            }, 1000);


        }
    };
});