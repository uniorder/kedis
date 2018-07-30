'use strict';

/**
 * 服务器列表控制器
 * 
 * @author Kehaw
 * @version 2.0.0
 */
app.controller("ServerCtrl", function ($rootScope, $scope, $state, $interval, local, redisConn, electron) {

	let win = remote.getCurrentWindow();

	let redis, interval;
	//从LocalStorage中初始化服务器列表
	$scope.serverList = local.getObject("SERVER_LIST");

	if ($scope.serverList) {
		let needFix = false;
		for (let i = 0; i < $scope.serverList.length; i++) {
			let obj = $scope.serverList[i];
			if (obj['password']) {
                needFix = true;
                obj.auth = obj.password;
                delete obj.password;
                $scope.serverList[i] = obj;
			}
        }
        if (needFix) {
            local.setObject("SERVER_LIST", $scope.serverList);
        }
	}

	if (!$scope.serverList) {
		$scope.serverList = [];
	}

	//当前选中的服务器
	$scope.selectedServer = null;

	//筛选文本
	$scope.filterText = "";

	$scope.server = {
		info: []
	};


	/**
	 * 筛选事件
	 */
	$scope.filterServer = function () {
		for (let i = 0; i < $scope.serverList.length; i++) {
			if ($scope.serverList[i].name.indexOf($scope.filterText) !== -1) {
				$scope.serverList[i].hide = false;
			} else {
				$scope.serverList[i].hide = true;
			}
		}
	}

	/**
	 * 刷新服务器列表
	 */
	let refreshServerList = function () {
		$scope.serverList = local.getObject("SERVER_LIST");
		//重新加载服务器列表的时候回导致之前选中的样式都丢掉，这里重新补一下。
		if ($scope.selectedServer) {
			for (let i = 0; i < $scope.serverList.length; i++) {
				if ($scope.serverList[i].id === $scope.selectedServer.id) {
					$scope.serverList[i].selected = true;
					break;
				}
			}
		}
		$scope.$apply();
	}

	/**
	 * 当收到新建链接成功的时候，刷新列表。
	 * @param msg 事件类型（electron桥接将事件类型包含在了msg中）
	 */
	$rootScope.$on('electron-msg', (event, msg) => {
		if (msg === "serverCreated" || msg === "serverUpdated") {
			refreshServerList();
		}

		if (msg === "createServer") {
			createSeerver();
		}

		if (msg === "deleteSelectedServer") {
			if ($scope.selectedServer) {
				deleteServer($scope.selectedServer);
			}
		}

		if (msg === "editSelectedServer") {
			if ($scope.selectedServer) {
				editServer($scope.selectedServer);
			}
		}
	});

	/**
	 * 列表点击事件
	 * @param {*} server 选中的服务器对象
	 */
	$scope.serverClick = function (server) {
		if (server.id === $scope.selectedServer) {
			return;
		}
		$scope.$emit('clearAllKeys');
		if (interval) {
			$interval.cancel(interval);
		}
		$state.go("default");
		for (let i = 0; i < $scope.serverList.length; i++) {
			$scope.serverList[i].selected = false;
		}
		$scope.selectedServer = server;
		let oldConn = redisConn.getConn();
		if (oldConn) {
			oldConn.end(true);
		}
		redis = redisConn.createConn(server);
		redis.on("error", function (err) {
			electron.dialog.showErrorBox("错误", err.message);
			redis.end(true);
		});
		server.selected = true;
		$scope.$emit('serverChanged', server);


		$scope.server.info = {};
		let dataSet = [];
		for (let i = 0; i < 100; i++) {
			dataSet.push(0);
		}

		let chart = new Highcharts.Chart(document.getElementById('inputChart'), {
			title: {
				text: "IO 监控"
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
		});

		interval = $interval(function () {
			redis.info(function (err, result) {
				if (err) {
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

	/**
	 * 创建一个链接
	 */
	function createSeerver() {
		let createServerWin = new BrowserWindow({
			parent: win,
			width: 400,
			height: 530,
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			modal: true,
			show: false
		});
		createServerWin.on('closed', () => {
			createServerWin = null
		});
		createServerWin.setMenuBarVisibility(false);
		createServerWin.loadFile('create-server.html');
		createServerWin.once('ready-to-show', () => {
			createServerWin.show()
		});
	}

	/**
	 * 删除一个链接
	 * @param {*} server 
	 */
	function deleteServer(server) {
		let confirmed = confirm("您是否确定要删除该链接？");
		if (confirmed) {
			let tmpArr = [];
			for (let i = 0; i < $scope.serverList.length; i++) {
				if ($scope.serverList[i].id === server.id) {
					continue;
				}
				tmpArr.push($scope.serverList[i]);
			}
			$scope.serverList = tmpArr;
			local.setObject("SERVER_LIST", $scope.serverList);
			if ($scope.selectedServer && $scope.selectedServer.id === server.id) {
				$scope.selectedServer = null;
			}
			$scope.$apply();
		}
	}

	/**
	 * 编辑一个链接
	 * @param {*} server 
	 */
	function editServer(server) {
		let updateServerWin = new BrowserWindow({
			parent: win,
			width: 400,
			height: 530,
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			modal: true,
			show: false
		});
		updateServerWin.on('closed', () => {
			updateServerWin = null
		});
		updateServerWin.setMenuBarVisibility(false);
		updateServerWin.loadFile('update-server.html');
		updateServerWin.once('ready-to-show', () => {
			updateServerWin.show();
		});
		updateServerWin.webContents.on('did-finish-load', function () {
			updateServerWin.webContents.send('server', server);
		});
	}

	/**
	 * 列表右击事件
	 * @param {*} server 
	 */
	$scope.showServerContextMenu = function (server) {
		const menu = new Menu();

		menu.append(new MenuItem({
			label: '编辑',
			click() {
				editServer(server);
			}
		}));
		menu.append(new MenuItem({
			label: '删除',
			click() {
				deleteServer(server);
			}
		}));
		menu.popup({
			window: remote.getCurrentWindow()
		});
	}
});
