'use strict';

app.controller("KeyController", ["$scope", function($scope) {
    let client = null;
    $scope.databases = [];
    $scope.showNoDataText = false;
    let currentDatabase = {};
    $scope.keys = [];
    $scope.server = {};
    $scope.moduleHidden = true;
    $scope.name = "";
    $scope.key = "";
    $scope.value = ""; //全体共用
    $scope.expire = -1;
    $scope.searchPattern = "";
    let pt = "*";
    let lastKey = null;
    $scope.$on("reloadK", function() {
        $scope.loadKeys(currentDatabase);
    });

    $scope.dropComplete = function(data, event, databaseIndex) {
        console.log(data);
        console.log(databaseIndex);
        client.move(data.name, databaseIndex, function() {
            $scope.loadKeys(currentDatabase);
        }); //MIGRATE host port key destination-db timeout [COPY] [REPLACE]
    }

    $scope.$on("loadKey", function(event, server) {
        clear();
        $scope.server = server;
        pt = "*" + server.pattern + "*";
        if (!pt) {
            pt = "*";
        }
        if (client) {
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

        client.config("get", "databases", function(err, result) {
            if (err) {
                return;
            }
            let size = result[1];
            $scope.databases = [];
            for (let i = 0; i < size; i++) {
                $scope.databases.push({
                    index: i
                })
            }
            $scope.$apply();
        });
    });

    $scope.isSelectedDatabase = function() {
        console.log((currentDatabase.index + 10) != NaN);
        return (currentDatabase.index + 10) != NaN;
    }

    let lastSelected = null;
    $scope.loadKeys = function(database) {
        if (!database) {
            return;
        }
        currentDatabase = database;
        $scope.keys = [];
        database.selected = true;
        if (lastSelected && lastSelected.index !== database.index) {
            lastSelected.selected = false;
        }
        lastSelected = database;
        const cordis = wrapperRedis(client);
        co(function*() {
            yield cordis.select(database.index);
            let keys = yield cordis.keys(pt);
            keys.sort();
            for (let i = 0; i < keys.length; i++) {
                $scope.keys.push({
                    name: keys[i],
                    selected: false
                });
            }
            $scope.showNoDataText = keys.length == 0;
            $scope.$apply();
        });
        $scope.$emit("clearValue");
    }

    $scope.selectKey = function(key) {
        if (lastKey) {
            lastKey.selected = false;
        }
        key.selected = true;
        lastKey = key;
        $scope.server.database = lastSelected;
        $scope.$emit("changeKey", $scope.server, key);
    }


    $scope.newKey = function() {
        if (!currentDatabase) {
            return;
        }
        const cordis = wrapperRedis(client);
        co(function*() {
            let result = yield cordis.exists($scope.name);
            if (result) {
                alert("This key already exists.");
                return;
            }
            switch ($scope.keyType) {
                case 'String':
                    yield cordis.set($scope.name, $scope.value);
                    break;
                case 'Hash':
                    yield cordis.hset($scope.name, $scope.key, $scope.value);
                    break;
                case 'Zset':
                    yield cordis.zadd($scope.name, $scope.value, $scope.key);
                    break;
                case 'Set':
                    yield cordis.sadd($scope.name, $scope.value);
                    break;
                case 'List':
                    yield cordis.lpush($scope.name, $scope.value);
                    break;
            }
            if ($scope.expire > -1) {
                yield cordis.expire($scope.name, $scope.expire);
            }
            $scope.loadKeys(currentDatabase);
            $scope.name = "";
            $scope.key = "";
            $scope.value = "";
            $scope.moduleHidden = true;
        });
    }

    $scope.delKey = function() {
        let confirmed = confirm("You will delete " + lastKey.name + ", are you sure?");
        if (confirmed) {
            client.del(lastKey.name);
            $scope.loadKeys(currentDatabase);
        }
    }

    $scope.$on("clearKeysPanel", function() {
        clear();
    });

    function clear() {
        client = null;
        $scope.databases = [];
        $scope.showNoDataText = false;
        currentDatabase = {};
        $scope.keys = [];
        $scope.server = {};
        $scope.moduleHidden = true;
        $scope.name = "";
        $scope.key = "";
        $scope.value = ""; //全体共用
        $scope.expire = -1;
        lastKey = null;
        pt = "*";
        $scope.searchPattern = "";
    }

    $scope.reloadKeys = function() {
        if ($scope.searchPattern) {
            pt = "*" + $scope.searchPattern + "*";
        } else {
            pt = "*";
        }
        $scope.loadKeys(currentDatabase);
    }
}]);