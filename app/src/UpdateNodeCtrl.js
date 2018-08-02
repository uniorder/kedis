'use strict';

app.controller("UpdateNodeCtrl", function ($scope, local, redisConn, electron, $timeout) {
	$scope.testText = "测试";
	let sshConn;
	ipc.on('info', (event, message) => {
		$scope.node = message.node;
		$scope.$apply();
	});

	$scope.close = function () {
		if (sshConn) {
			sshConn.end();
		}
		remote.getCurrentWindow().close();
	}
});
