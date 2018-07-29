'use strict';

app.controller("CreateServerCtrl", function ($scope, local, redisConn, electron) {
	$scope.server = {};
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

		if (!$scope.server.port || $scope.server.port.trim() === "") {
			$scope.server.port = 6379;
		}

		let serverList = local.getObject("SERVER_LIST");

		if (!serverList) {
			serverList = [];
		}
		$scope.server.id = new Date().getTime();
		serverList.push($scope.server);
		local.setObject("SERVER_LIST", serverList);
		ipc.send("serverCreated", "SUCCESS");
		let win = remote.getCurrentWindow();
		win.close();
	}

	$scope.test = function () {
		$scope.isTesting = true;
		let client = redisConn.createConn($scope.server,true);

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
});
