
// 报表
const Highcharts = require('highcharts');

app.directive('ngRightClick', function ($parse) {
	return function (scope, element, attrs) {
		var fn = $parse(attrs.ngRightClick);
		element.bind('contextmenu', function (event) {
			scope.$apply(function () {
				event.preventDefault();
				fn(scope, {
					$event: event
				});
			});
		});
	};
});

app.directive('clickAndDisable', function () {
	return {
		scope: {
			clickAndDisable: '&'
		},
		link: function (scope, iElement, iAttrs) {
			iElement.bind('click', function () {
				iElement.prop('disabled', true);
				scope.clickAndDisable().finally(function () {
					iElement.prop('disabled', false);
				})
			});
		}
	};
});

app.directive('emHeightTarget', function () {
	return {
		link: function (scope, elem, attrs) {

			scope.$watch('__height', function (newHeight, oldHeight) {
				$(elem).css({
					height: 'calc(100% - ' + newHeight + 'px)'
				});
			});
		}
	}
});

app.directive('emHeightSource', function () {
	return {
		link: function (scope, elem, attrs) {
			scope.$watch(function () {
				scope.__height = $(elem).height();
			});
		}
	}
});

Highcharts.theme = {

	colors: ["#2D99DC", "#35BDA8", "#86B34D", "#7798BF", "#E66C40", "#CB3E4B", "#5C5C5C",
		"#55BF3B", "#DF5353", "#7798BF", "#aaeeee"
	],
	chart: {
		backgroundColor: {
			linearGradient: {
				x1: 0,
				y1: 0,
				x2: 1,
				y2: 1
			},
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
			fontSize: '13px'
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
		series: {
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