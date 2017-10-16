'use strict';

app.controller("StringValueController", ["$scope", function($scope) {
    let client = null;
    let k = null;
    $scope.moduleHidden = true;
    $scope.$on("loadStringValue", function(event, server, key) {
        k = key;
        co(function*() {
            if (client != null) {
                client.end(true);
            }

            client = redis.createClient({
                host: server.host,
                port: server.port,
                connect_timeout: 1000,
                password: server.password
            });
            client.on("error", function(err) {
                alert("Error! " + err);
                client.end(true);
            });

            const coredis = wrapperRedis(client);
            yield coredis.select(server.database.index);
            client.get(key.name, function(err, d) {
                $scope.key.value = d;
                console.log(d);
                $scope.$apply();
            });
        });

    });

    $scope.$on("clearValuePanel", function() {
        $scope.key.type = "";
        client ? client.end(true) : true;
    });

    $scope.save = function() {
        client.set(k.name, $scope.key.value);
    }

    $scope.jsonFormat = function() {
        try {
            $scope.formatValue = JSON.stringify(JSON.parse($scope.key.value), null, 4);
            $scope.moduleHidden = false;
        } catch (e) {
            alert(e);
        }
    }
}]);