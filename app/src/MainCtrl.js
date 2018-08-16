'use strict';

app.controller("MainCtrl", function ($rootScope, $scope, redisConn, electron) {
	$scope.$on("serverChanged", function (event, data) {
		$scope.$broadcast("changeServer", data);
	});

	$scope.$on("clearAllKeys", function (event, data) {
		$scope.$broadcast("clearKeys");
	});

	$scope.$on("keyCount", (event, data) => {
		$scope.keyCount = data;
	});

	$scope.$on("serverInfo", (event, data) => {
		$scope.clusterInfos = null;
		$scope.serverInfos = data;
	})

	$scope.$on("clusterInfo", (event, data) => {
		$scope.serverInfos = null;
		$scope.clusterInfos = data;
    });
    
    $scope.openBrowser = function (e, url) {
		e.preventDefault();
		shell.openExternal(url);
    }
    

    $('#server').resizable({
		handles: 'e',
		minWidth: 150,
		maxWidth: $('body').width() - 900,
		resize: function (event, ui) {
			$('#value').width($('body').width() - ui.size.width - $("#key").width() - 2);
		}
	});

	;

	$('#key').resizable({
		handles: 'e',
		minWidth: 150,
		maxWidth: $('body').width() - 900,
		resize: function (event, ui) {
			$('#value').width($('body').width() - ui.size.width - $("#server").width() - 2);
		}
	});

	$('body').bind('resize', function () {
		return false;
	});

	$(window).resize(function () {
		$("#value").width($('body').width() - $("#server").width() - $("#key").width() - 2);
	});
});
