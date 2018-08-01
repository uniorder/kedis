'use strict';

/**
 * String Value
 * 
 * @author Kehaw
 * @version 2.0.0
 */
app.controller("ImportCtrl", function ($scope, local) {
	$scope.servers;

	$scope.currentServers = local.getObject("SERVER_LIST") || [];

	$scope.save = function () {
		let servers;
		try {
			servers = eval($scope.servers);
		} catch (e) {
			alert("格式错误");
			return;
		}
		for (let i = 0; i < servers.length; i++) {
			servers[i].id = new Date().getTime() + i;
			$scope.currentServers.push(servers[i]);
		}

		local.setObject("SERVER_LIST", $scope.currentServers);
		ipc.send("serverCreated", "SUCCESS");
		remote.getCurrentWindow().close();
	}

	$scope.close = function () {
		remote.getCurrentWindow().close();
	}
});
