'use strict';

app.controller("MonitorController", ["$scope", "$interval", "local", function ($scope, $interval, local) {
    $scope.servers = local.getObject("SERVER_LIST");

    $scope.started = false;

    $scope.select = function (server) {
        if (server.selected) {
            server.selected = false;
        } else {
            server.selected = true;
        }
    }

    $scope.selectedServers = [];

    $scope.startWatching = function () {
        for (let i = 0; i < $scope.servers.length; i++) {
            if ($scope.servers[i].selected) {
                $scope.selectedServers.push($scope.servers[i]);
            }
        }

        if ($scope.selectedServers.length > 0) {
            $scope.started = true;
        } else {
            alert("Please select some servers.");
        }
    }
}]);