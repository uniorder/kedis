'use strict';

app.controller("CreateKeyCtrl", function ($scope, local, redisConn, electron) {
	$scope.key = {};

	let redis = null;

	ipc.on('createKey', (event, message) => {
		$scope.server = message;
		$scope.$apply();
	});

	/**
	 * 保存Key
	 */
	$scope.save = function () {
		redis = redisConn.createConn($scope.server, true);

		redis.select($scope.server.selectedDatabase.index, function (err) {
			if (err) {
				electron.dialog.showErrorBox("错误", err.message);
				return;
			}
			redis.exists($scope.key.name, function (err, data) {
				if (err) {
					electron.dialog.showErrorBox("错误", err.message);
					return;
				}

				if (data) {
					let confirmed = confirm("这个键已经存在于当前库中，本操作这将可能会覆盖原有的键，是否确定要添加？");
					if (!confirmed) {
						return;
					}
				}
				switch ($scope.server.createType) {
					case "string":
						createString();
						break;
					case "hash":
						createHash();
						break;
					case "set":
						createSet();
						break;
					case "zset":
						createZset();
						break;
					case "list":
						createList();
						break;
				}

			});
		});
	}

	function createString() {
		if (!$scope.key.name) {
			electron.dialog.showErrorBox("错误", "键的名称不能为空。");
			return;
		}
		if (!$scope.key.value) {
			electron.dialog.showErrorBox("错误", "键的初始化值不能为空。");
			return;
		}
		redis.set($scope.key.name, $scope.key.value, function (err, data) {
			if (err) {
				electron.dialog.showErrorBox("错误", err.message);
				return;
			}
			clear();

		});
	}

	function createHash() {
		if (!$scope.key.name) {
			electron.dialog.showErrorBox("错误", "键的名称不能为空。");
			return;
		}
		if (!$scope.key.field) {
			electron.dialog.showErrorBox("错误", "键的初始化字段名不能为空。");
			return;
		}
		if (!$scope.key.value) {
			electron.dialog.showErrorBox("错误", "键的初始化值不能为空。");
			return;
		}
		redis.hset($scope.key.name, $scope.key.field, $scope.key.value, function (err, data) {
			if (err) {
				electron.dialog.showErrorBox("错误", err.message);
				return;
			}
			clear();
		});
	}

	function createSet() {
		if (!$scope.key.name) {
			electron.dialog.showErrorBox("错误", "键的名称不能为空。");
			return;
		}
		if (!$scope.key.value) {
			electron.dialog.showErrorBox("错误", "键的初始化值不能为空。");
			return;
		}
		redis.del($scope.key.name, function (err) {
			if (err) {
				electron.dialog.showErrorBox("错误", err.message);
				return;
			}
			redis.sadd($scope.key.name, $scope.key.value, function (err, data) {
				if (err) {
					electron.dialog.showErrorBox("错误", err.message);
					return;
				}
				clear();
			});
		});
	}

	function createZset() {
		if (!$scope.key.name) {
			electron.dialog.showErrorBox("错误", "键的名称不能为空。");
			return;
		}
		if (!$scope.key.value) {
			electron.dialog.showErrorBox("错误", "键的初始化值不能为空。");
			return;
		}
		redis.del($scope.key.name, function (err) {
			if (err) {
				electron.dialog.showErrorBox("错误", err.message);
				return;
			}
			redis.zadd($scope.key.name, 0, $scope.key.value, function (err, data) {
				if (err) {
					electron.dialog.showErrorBox("错误", err.message);
					return;
				}
				clear();
			});
		});
	}

	function createList() {
		if (!$scope.key.name) {
			electron.dialog.showErrorBox("错误", "键的名称不能为空。");
			return;
		}
		if (!$scope.key.value) {
			electron.dialog.showErrorBox("错误", "键的初始化值不能为空。");
			return;
		}
		redis.lpush($scope.key.name, $scope.key.value, function (err, data) {
			if (err) {
				electron.dialog.showErrorBox("错误", err.message);
				return;
			}
			clear();
		});
	}


	function clear() {
		if ($scope.key.expire) {
			redis.expire($scope.key.name, $scope.key.expire, function () {
				ipc.send("keyCreated", "SUCCESS");
				remote.getCurrentWindow().close();
			});
		} else {
			ipc.send("keyCreated", "SUCCESS");
			remote.getCurrentWindow().close();
		}
	}

	$scope.close = function () {
		remote.getCurrentWindow().close();
	}
});
