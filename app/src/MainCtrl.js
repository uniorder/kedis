'use strict';

app.controller("MainCtrl", function ($rootScope, $scope, redisConn, electron) {
	$scope.$on("serverChanged", function (event, data) {
		$scope.$broadcast("changeServer", data);
    });

    $scope.$on("clearAllKeys", function (event, data) {
        $scope.$broadcast("clearKeys");
    });
});
