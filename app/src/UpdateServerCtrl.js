'use strict';

app.controller("UpdateServerCtrl", function ($scope, local, redisConn, electron) {
	$scope.server = {};
	ipc.on('server', (event, message) => {
		$scope.server = message;
		$scope.$apply();
	});

	$scope.testStyle = "btn-secondary";
	$scope.isTesting = false;
	$scope.testText = "测试";

	$scope.save = function () {
		if (!$scope.server.name && $scope.server.name.trim() === "") {
			electron.dialog.showErrorBox("错误", "名称不能为空。");
			return;
		}

		if (!$scope.server.host && $scope.server.host.trim() === "") {
			electron.dialog.showErrorBox("错误", "服务器地址不能为空。");
			return;
		}

		if (!$scope.server.port || $scope.server.port.toString().trim() === "") {
			$scope.server.port = 6379;
		}

		let serverList = local.getObject("SERVER_LIST");

		if (serverList) {
			for (var i = 0; i < serverList.length; i++) {
				if (serverList[i].id == $scope.server.id) {

					serverList[i] = {
						name: $scope.server.name,
						host: $scope.server.host,
						port: $scope.server.port,
						auth: $scope.server.auth,
						pattern: $scope.server.pattern
					};
					local.setObject("SERVER_LIST", serverList);
					ipc.send("serverUpdated", "SUCCESS");
					let win = remote.getCurrentWindow();
					win.close();
					return;
				}
			}
		}
	}

	$scope.test = function () {
		$scope.isTesting = true;
		let client = redisConn.createConn($scope.server, true);

		client.info(function (err, result) {
			if (err) {
				$scope.testStyle = "btn-danger";
				$scope.testText = "测试失败，点击重试";
			} else {
				$scope.testStyle = "btn-success";
				$scope.testText = "链接成功";
			}
			client.end(true);
			$scope.isTesting = false;
			$scope.$apply();
		});
    }
    
    $scope.close = function () {
		remote.getCurrentWindow().close();
	}
});
