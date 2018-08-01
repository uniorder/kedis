'use strict';

/**
 * String Value
 * 
 * @author Kehaw
 * @version 2.0.0
 */
app.controller("ExportCtrl", function ($scope, local) {
	$scope.servers = JSON.stringify(JSON.parse(local.get("SERVER_LIST")), null, 4);
	console.log($scope.servers);
	$scope.close = function () {
		remote.getCurrentWindow().close();
	}
});
