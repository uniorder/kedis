'use strict';


app.controller("KeyCtrl", function ($rootScope, $scope, $state, redisConn, electron) {




	let win = remote.getCurrentWindow();

	// redis 对象
	let redis = null;

	let serverInfo = null;
	// 数据库集合
	$scope.databases = [];

	$scope.keys = [];

	// 选中的数据库
	$scope.selectedDatabase = null;

	// 选中的Key
	$scope.selectedKey = null;

	// key的过滤器
	$scope.keyParttern = "";

	$rootScope.$on('electron-msg', (event, msg) => {
		switch (msg) {
			case "showCreateStringWin":
				showCreateWin("string");
				break;
			case "showCreateHashWin":
				showCreateWin("hash");
				break;
			case "showCreateSetWin":
				showCreateWin("set");
				break;
			case "showCreateZsetWin":
				showCreateWin("zset");
				break;
			case "showCreateListWin":
				showCreateWin("list");
				break;
			case "deleteKey":
				deleteKey($scope.selectedKey);
			case "keyCreated":
				showKeys($scope.selectedDatabase);
				break;
		}
	});

	$scope.$on("clearKeys", () => {
		$scope.databases = [];

		$scope.keys = [];
	});

	function showCreateWin(type) {
		if (!serverInfo) {
			return;
		}

		serverInfo.selectedDatabase = $scope.selectedDatabase;
		serverInfo.createType = type;

		let height = null;
		let file = null;
		switch (type) {
			case "set":
			case "zset":
			case "list":
			case "string":
				height = 380;
				file = "create-key.html";
				break;
			case "hash":
				height = 460;
				file = "create-key-hash.html";
				break;
		}

		let createStringWin = new BrowserWindow({
			parent: win,
			width: 400,
			height: height,
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			modal: true,
			show: false
		});

		createStringWin.on('closed', () => {
			createStringWin = null
		});
		createStringWin.setMenuBarVisibility(false);
		createStringWin.loadFile(file);
		createStringWin.once('ready-to-show', () => {
			createStringWin.show();
		});
		createStringWin.webContents.on('did-finish-load', function () {
			createStringWin.webContents.send('createKey', serverInfo);
		});
	}

	/**
	 * 捕获从父Controller中的Server Change事件
	 */
	$scope.$on("changeServer", function (event, server) {
		serverInfo = server;
		redis = redisConn.getConn();

		redis.config("get", "databases", function (err, result) {
			if (err) {
				return;
			}
			let size = result[1];
			$scope.databases = []; //先清空以前的
			$scope.keys = [];
			for (let i = 0; i < size; i++) {
				$scope.databases.push({
					index: i
				});
			}
			// $scope.databases[0].selected = true;
			// showKeys($scope.databases[0], true);
			$scope.$apply();



		});
	});

	/**
	 * 根据选中的数据库展示所有的KEY
	 * @param {*} database 选中的数据库对象
	 */
	$scope.showKeys = function (database) {
		$state.go("default");
		showKeys(database, true);
	}

	function showKeys(database, clearKeys) {
		for (let i = 0; i < $scope.databases.length; i++) {
			$scope.databases[i].selected = false;
		}
		$scope.selectedDatabase = database;
		database.selected = true;

		$scope.keys = []; //清空以前的
		redis.select(database.index, function (err, result) {
			if (err) {
				return;
			}
			redis.keys($scope.keyParttern + "*", function (err, keys) {
				if (err) {
					return;
                }
                
                $scope.$emit("keyCount",keys.length);

				for (let i = 0; i < keys.length; i++) {

					redis.type(keys[i], function (err, data) {
						let selected = false;
						if (!clearKeys && $scope.selectedKey && $scope.selectedKey.name === keys[i]) {
							selected = true;
						}

						$scope.keys.push({
							name: keys[i],
							type: data,
							selected: selected
						});

						if (i === keys.length - 1) {
							$scope.$apply();
						}
					});
				}
				$scope.keys.sort();

			});
		});
	}

	/**
	 * key的点击事件
	 * @param {*} key 选中的key
	 */
	$scope.selectKey = function (key) {
		$state.go(key.type, {
			key: key
		});
		for (let i = 0; i < $scope.keys.length; i++) {
			$scope.keys[i].selected = false;
		}
		$scope.selectedKey = key;
		key.selected = true;
	}

	/**
	 * key的右击事件
	 * @param {*} server 
	 */
	$scope.showKeyContextMenu = function (key) {
		const menu = new Menu();

		menu.append(new MenuItem({
			label: '删除',
			click() {
				deleteKey(key);
			}
		}));
		menu.popup({
			window: remote.getCurrentWindow()
		});
	}

	/**
	 * 删除一个key
	 * @param {*} key 
	 */
	function deleteKey(key) {
		if (!key) {
			return;
		}
		let confirmed = confirm("您是否确定要删除" + key.name + "?");
		if (confirmed) {
			redis.del(key.name, function (err) {
				if (err) {
					return;
				}
				//当选中的键被删除的时候
				if ($scope.selectedKey && $scope.selectedKey.name === key.name) {
					$scope.selectedKey = null;
					$state.go("default");
				}
				showKeys($scope.selectedDatabase);
			});
		}
	}

	/**
	 * Key筛选事件
	 */
	$scope.filterKey = function () {
		// for (let i = 0; i < $scope.keys.length; i++) {
		// 	if ($scope.keys[i].name.toLowerCase().indexOf($scope.keyParttern.toLowerCase()) !== -1) {
		// 		$scope.keys[i].hide = false;
		// 	} else {
		// 		$scope.keys[i].hide = true;
		// 	}
		// }
		showKeys($scope.selectedDatabase);
	}
});
