'use strict';

app.controller("ValueController", ["$scope", function($scope) {
    let client = null;
    $scope.title = "VALUE";
    $scope.showProperties = false;
    let k;
    $scope.key = {
        name: "",
        type: "",
        value: "",
        ttl: 0,
        expire: ""
    }

    $scope.$on("clearValuePanel", function() {
        $scope.title = "VALUE";
        $scope.subTitle = "";
        $scope.showProperties = false;
    });



    $scope.$on("loadValue", function(event, server, key) {
        k = key;
        $scope.showProperties = true;
        $scope.title = key.name.toUpperCase();
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
        co(function*() {
            yield coredis.select(server.database.index);

            let result = yield coredis.type(key.name);
            $scope.key.ttl = yield coredis.ttl(key.name);

            $scope.key.name = key.name;
            $scope.key.type = result;

            $scope.subTitle = $scope.key.type;

            switch (result) {
                case "string":
                    $scope.$emit("stringValueChange", server, key);
                    break;
                case "hash":
                    $scope.$emit("hashValueChange", server, key);
                    break;
                case "zset":
                    $scope.$emit("zsetValueChange", server, key);
                    break;
                case "set":
                    $scope.$emit("setValueChange", server, key);
                    break;
                case "list":
                    $scope.$emit("listValueChange", server, key);
                    break;
                default:
                    break;
            }

            $scope.$apply();
        });
    });

    $scope.rename = function() {
        const coredis = wrapperRedis(client);
        co(function*() {
            let result = yield coredis.exists($scope.key.name);
            if (result == 1) {
                alert("Key already exists.");
                return;
            }
            yield coredis.rename(k.name, $scope.key.name);
            $scope.$emit("reloadKey");
        });
    }

    $scope.setExpire = function() {
        if (!$scope.key.ttl || $scope.key.ttl < 0) {
            client.persist(k.name);
            $scope.key.ttl = -1;
        } else {
            client.expire(k.name, $scope.key.ttl);
        }

    }
}]);