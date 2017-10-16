'use strict';
const redis = require('redis');
const co = require('co'); //同步模块
const wrapperRedis = require('co-redis'); //同步Redis
const Highcharts = require('highcharts');


var app = angular.module('app', ['ngDraggable']);


app.factory('local', ['$window', function($window) {
    return { //存储单个属性
        set: function(key, value) {
            $window.localStorage[key] = value;
        }, //读取单个属性
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        }, //存储对象，以JSON格式存储
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value); //将对象以字符串保存
        }, //读取对象
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || null); //获取字符串并解析成对象
        }
    }
}]);

app.directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        //scope: true,   // optionally create a child scope
        link: function (scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function (value) {
                // console.log('value=', value);
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });
            // to address @blesh's comment, set attribute value to 'false'
            // on blur event:
            element.bind('blur', function () {
                // console.log('blur');
                scope.$apply(model.assign(scope, false));
            });
        }
    };
}]);

Highcharts.theme = {
    
    colors: ["#2D99DC", "#35BDA8", "#86B34D", "#7798BF", "#E66C40", "#CB3E4B", "#5C5C5C",
       "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
    chart: {
       backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
             [0, '#212121'],
          ]
       },
       style: {
          fontFamily: "-apple-system, 'Unica One', sans-serif"
       },
       plotBorderColor: 'yellow'
    },
    title: {
       style: {
          color: '#525252',
          textTransform: 'uppercase',
          fontSize: '11px'
       }
    },
    subtitle: {
       style: {
          color: '#404040',
          textTransform: 'none'
       }
    },
    xAxis: {
       gridLineColor: '#2F2F2F',
       labels: {
          style: {
             color: 'white'
          }
       },
       lineColor: '#404040',
       minorGridLineColor: 'pink',
       tickColor: '#303030',
       title: {
          style: {
             color: '#484848'
 
          }
       }
    },
    yAxis: {
       gridLineColor: '#303030',
       labels: {
          style: {
             color: 'white'
          }
       },
       lineColor: 'blue',
       minorGridLineColor: 'yellow',
       tickColor: '#303030',
       tickWidth: 1,
       title: {
          style: {
             color: '#A0A0A3'
          }
       }
    },
    tooltip: {
       backgroundColor: 'rgba(0, 0, 0, 0.85)',
       style: {
          color: '#F0F0F0'
       }
    },
    plotOptions: {
       series: {
          dataLabels: {
             color: '#B0B0B3'
          },
          marker: {
             lineColor: '#333'
         },
         states: {
             hover: {
                 lineWidth: 3
             }
         },
       },
       boxplot: {
          fillColor: '#505053'
       },
       candlestick: {
           lineColor: 'white',
           color: '#18AA6E',
           upColor: '#E2132F'
       },
       errorbar: {
          color: 'white'
       }
    },
    legend: {
       itemStyle: {
          color: '#E0E0E3'
       },
       itemHoverStyle: {
          color: '#FFF'
       },
       itemHiddenStyle: {
          color: '#606063'
       }
    },
    credits: {
       enabled: false
    },
    labels: {
       style: {
          color: '#707073'
       }
    },
 
    drilldown: {
       activeAxisLabelStyle: {
          color: '#F0F0F3'
       },
       activeDataLabelStyle: {
          color: '#F0F0F3'
       }
    },
 
    navigation: {
       buttonOptions: {
          symbolStroke: '#DDDDDD',
          theme: {
             fill: '#505053'
          }
       }
    },
 
    // scroll charts
    rangeSelector: {
       buttonTheme: {
          fill: '#2D2D2D',
          stroke: 'pink',
          style: {
             color: '#5C5C5C'
          },
          states: {
             hover: {
                fill: '#444444',
                stroke: '#000000',
                style: {
                   color: 'white'
                }
             },
             select: {
                fill: '#000003',
                stroke: '#000000',
                style: {
                   color: 'white'
                }
             }
          }
       },
       inputBoxBorderColor: '#2D2D2D',
       inputStyle: {
          backgroundColor: '#333',
          color: '#5C5C5C'
       },
       labelStyle: {
          color: 'white'
       }
    },
 
    navigator: {
       handles: {
          backgroundColor: '#262626',
          borderColor: '#5C5C5C'
       },
       outlineColor: '#383838',
       maskFill: 'rgba(255,255,255,0.1)',
       series:
       {
        color: 'white',
        lineColor: 'none'
       },
       xAxis: {
          gridLineColor: '#383838'
       }
    },
 
    scrollbar: {
       barBackgroundColor: '#808083',
       barBorderColor: '#808083',
       buttonArrowColor: '#CCC',
       buttonBackgroundColor: '#606063',
       buttonBorderColor: '#606063',
       rifleColor: '#FFF',
       trackBackgroundColor: '#404043',
       trackBorderColor: '#404043'
    },
    legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
    background2: '#505053',
    dataLabelsColor: '#B0B0B3',
    textColor: 'blue',
    contrastTextColor: '#F0F0F3',
    maskColor: 'rgba(255,255,255,0.3)'
 };
 Highcharts.setOptions(Highcharts.theme);