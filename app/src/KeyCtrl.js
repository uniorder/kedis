'use strict';


app.controller("KeyCtrl", function ($rootScope, $scope, $state, redisConn, klog) {




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
				if (serverInfo.isCluster) {
					showClusterKeys($scope.selectedDatabase);
				} else {
					showKeys(redis, $scope.selectedDatabase);
				}

				break;
		}
	});

	$scope.$on("clearKeys", () => {
		$scope.databases = [];

		$scope.keys = [];

	});

	function showCreateWin(type) {
		if (!serverInfo) {
			alert("请先选择一个Redis连接再进行操作。")
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
				klog.error(err.message);
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
			$scope.$apply();
		});
	});

	/**
	 * 根据选中的数据库展示所有的KEY
	 * @param {*} database 选中的数据库对象
	 */
	$scope.showKeys = function (database) {
		$state.go("default");
		for (let i = 0; i < $scope.databases.length; i++) {
			$scope.databases[i].selected = false;
		}
		$scope.selectedDatabase = database;
		database.selected = true;


		if (serverInfo.isCluster) {
			showClusterKeys(database, true);
		} else {
			showKeys(redis, database, true);
		}
	}

	let markedIndex = 0; //用來標記已經Type到那裡的下標，主要原因是兼容普通和集群，集群会遍历所以有服务器，所以只能讲下标记在外面

	function showClusterKeys(database, clearKeys) {
		$scope.keys = []; //清空以前的
		markedIndex = 0;
		let conns = redisConn.getClusterConn();
		let rs = conns.redisConns;

		let i = 0;
		for (; i < rs.length; i++) {
			let r = rs[i];
			showKeys(r, database, clearKeys, true);
		}
	}

	/**
	 * 显示所有的键
	 * @param {*} r redis链接
	 * @param {*} database 选中的服务器
	 * @param {*} clearKeys 是否清除选中状态
	 * @param {*} cluster 是否是集群，如果是集群的话，就不需要清空$scope.keys因为在showClusterKeys中已经清空，markedIndex同理
	 */
	function showKeys(r, database, clearKeys, cluster) {
		if (!cluster) {
			$scope.keys = []; //清空以前的
			markedIndex = 0;
		}

		r.select(database.index, function (err, result) {
			if (err) {
				klog.error(err.message);
				return;
			}
			r.keys($scope.keyParttern + "*", function (err, keys) {
				if (err) {
					klog.error(err.message);
					return;
				}

				$scope.$emit("keyCount", keys.length);
				let pipeline = r.pipeline();
				for (let i = 0; i < keys.length; i++) {
					let selected = false;
					if (!clearKeys && $scope.selectedKey && $scope.selectedKey.name === keys[i]) {
						selected = true;
					}

					let obj = {
						name: keys[i],
						selected: selected
					}

					if (cluster) {
						obj.redisHost = r.options.rawHost;
						obj.redisPort = r.options.rawPort;
					}

					$scope.keys.push(obj);

					pipeline.type(keys[i]);
					// r.type(keys[i], function (err, data) {
					// 	let selected = false;
					// 	if (!clearKeys && $scope.selectedKey && $scope.selectedKey.name === keys[i]) {
					// 		selected = true;
					// 	}

					// 	$scope.keys.push({
					// 		name: keys[i],
					// 		type: data,
					//         selected: selected,
					//         redisHost: r.options.rawHost,
					//         redisPort: r.options.rawPort
					// 	});

					// 	if (i === keys.length - 1) {
					// 		$scope.$apply();
					// 	}
					// });
                }
                //通过Pipeline的形式来降低Redis交互次数
				pipeline.exec((err, results) => {
					for (let i = 0; i < results.length; i++) {
						$scope.keys[markedIndex].type = results[i][1];
						markedIndex++;
					}
					if (markedIndex === $scope.keys.length) {
						// $scope.keys.sort();
						$scope.$apply();
					}
				});
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
			if (serverInfo.isCluster) {
				let r = redisConn.getClusterRedisConnByHostPort(key.redisHost, key.redisPort);
				r.del(key.name, function (err) {
					if (err) {
						klog.error(err.message);
						return;
					}
					//当选中的键被删除的时候
					if ($scope.selectedKey && $scope.selectedKey.name === key.name) {
						$scope.selectedKey = null;
						$state.go("default");
					}
					showClusterKeys($scope.selectedDatabase);
				});
			} else {
				redis.del(key.name, function (err) {
					if (err) {
						klog.error(err.message);
						return;
					}
					//当选中的键被删除的时候
					if ($scope.selectedKey && $scope.selectedKey.name === key.name) {
						$scope.selectedKey = null;
						$state.go("default");
					}
					showKeys(redis, $scope.selectedDatabase);
				});
			}

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
		if (serverInfo.isCluster) {
			showClusterKeys($scope.selectedDatabase);
		} else {
			showKeys(redis, $scope.selectedDatabase);
		}
	}
});
