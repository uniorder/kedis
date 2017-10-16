'use strict';

app.controller("ZSetValueController", ["$scope", function($scope) {
    let client = null;
    let coredis = null;
    let k = null;
    $scope.count = 0;
    let lastSelect, oldItem;
    let match = null;
    $scope.moduleHidden = true;
    $scope.items = [];
    let pages = [0];
    let nextIndex;
    let preIndex;
    $scope.$on("loadZsetValue", function(event, server, key) {

        $scope.count = 0;

        k = key;
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

        coredis = wrapperRedis(client);
        co(function*() {
            yield coredis.select(server.database.index);
            $scope.load(0);
        });
    });

    $scope.selecteItem = function(item) {
        if (lastSelect) {
            lastSelect.selected = false;
        }
        item.selected = true;
        lastSelect = item;
        oldItem = angular.copy(item);
        return true;
    }




    $scope.loadNext = function() {
        if (nextIndex == 0) {
            return;
        }
        $scope.load(nextIndex);
    }

    $scope.loadPre = function() {
        $scope.load(preIndex);
    }


    $scope.load = function(index) {
        $scope.items = [];
        co(function*() {
            if (client != null) {
                let s;
                if (!match) {
                    s = yield coredis.zscan(k.name, index, "COUNT", 100);
                    console.log(s);
                } else {
                    s = yield coredis.zscan(k.name, index, "MATCH", match, "COUNT", 100);
                }

                $scope.count = yield coredis.zcard(k.name);
                if (s[1].length == 0) {
                    alert("No more!");
                    return;
                }
                for (let i = 0; i < s[1].length; i += 2) {
                    $scope.items.push({
                        key: s[1][i],
                        score: s[1][i + 1] * 1
                    });
                }

                let i = 0;
                for (; i < pages.length; i++) {
                    if (pages[i] == index) {
                        preIndex = pages[i - 1];
                        nextIndex = pages[i + 1];
                        break;
                    }
                }
                $scope.pageInfo = (i + 1) + "/" + Math.ceil($scope.count / 100);

                if (!preIndex) {
                    preIndex = 0;
                }
                if (!nextIndex) {
                    nextIndex = s[0];
                    pages.push(nextIndex * 1);
                }

                $scope.$apply();
            }
        });
    }

    $scope.setFieldFromKey = function(event, item) {
        if (event.key === 'Enter') {
            $scope.setNewField(item);
            return false;
        }
        return true;
    }

    $scope.setValueFromKey = function(event, item) {
        if (event.key === 'Enter') {
            $scope.setNewValue(item);
            return false;
        }
        return true;
    }

    $scope.setNewField = function(item) {
        if (client) {
            client.multi().zrem(k.name, oldItem.key).zadd(k.name, item.score, item.key).exec();
        }
        return false;
    }

    $scope.setNewValue = function(item) {
        if (client) {
            client.zadd(k.name, item.score, item.key);
        }
        return false;
    }

    $scope.$on("clearValuePanel", function() {
        $scope.key.type = "";
    });

    $scope.addValue = function() {
        if (client && $scope.field && $scope.value) {
            client.zadd(k.name, $scope.value, $scope.field);
            $scope.load(1);
            $scope.moduleHidden = true;
        }
    }

    $scope.deleteValue = function() {
        if (client && lastSelect) {
            client.zrem(k.name, lastSelect.key);
            $scope.load(1);
        }
    }

    $scope.search = function() {
        if ($scope.searchValue) {
            match = "*" + $scope.searchValue + "*";
        } else {
            match = "";
        }
        $scope.load(0);
    }

    $scope.clearSearch = function() {
        match = "";
        $scope.searchValue = "";
        if (lastSelect) {
            lastSelect.selected = false;
            lastSelect = null;
        }
        $scope.load(0);
    }
}]);