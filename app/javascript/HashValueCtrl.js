'use strict';

app.controller("HashValueController", ["$scope", function ($scope) {

    let client = null;

    let coredis = null;

    let lastSelect, oldItem;

    let match;

    $scope.moduleHidden = true;

    $scope.selecteItem = function (item) {
        if (lastSelect) {
            lastSelect.selected = false;
        }
        item.selected = true;
        lastSelect = item;
        oldItem = angular.copy(item);
        return true;
    }

    let k;
    $scope.hashItems = [];

    $scope.count = 0;

    let pages = [0];
    let nextIndex;
    let preIndex;

    $scope.$on("loadHashValue", function (event, server, key) {
        $scope.clearSearch();
        $scope.count = 0;

        pages = [0];
        nextIndex = null;
        preIndex = null;

        k = key;
        if (client != null) {
            client.end(true);
        }

        client = redis.createClient({
            host: server.host,
            port: server.port,
            connect_timeout: 3000,
            password: server.password
        });
        client.on("error", function (err) {
            alert("Error! " + err);
            client.end(true);
        });

        coredis = wrapperRedis(client);

        co(function* () {
            yield coredis.select(server.database.index);
            $scope.load(0);
        });
    });

    $scope.loadNext = function () {
        if (nextIndex == 0) {
            return;
        }
        $scope.load(nextIndex);
    }

    $scope.loadPre = function () {
        $scope.load(preIndex);
    }

    $scope.load = function (index) {
        lastSelect = null;
        oldItem = null;
        $scope.hashItems = [];
        co(function* () {
            if (client != null) {
                let s;
                if (!match) {
                    s = yield coredis.hscan(k.name, index, "COUNT", 100);
                } else {
                    s = yield coredis.hscan(k.name, index, "MATCH", match, "COUNT", 100);
                }

                $scope.count = yield coredis.hlen(k.name);
                if (s[1].length == 0) {
                    alert("No more!");
                    return;
                }
                for (let i = 0; i < s[1].length; i += 2) {
                    $scope.hashItems.push({
                        field: s[1][i],
                        value: s[1][i + 1]
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

    $scope.keydownSetField = function (event, item) {

        if (event.key === "Enter") {
            $scope.setNewHashField(item);
            return false;
        }
        return true;
    }

    $scope.keydownSetValue = function (event, item) {
        if (event.key === "Enter") {
            $scope.setNewHashValue(item);
            return false;
        }
        return true;
    }

    $scope.setNewHashField = function (item) {
        if (client) {
            client.multi().hdel(k.name, oldItem.field).hset(k.name, item.field, item.value).exec(function () { });
        }
        return false;
    }

    $scope.setNewHashValue = function (item) {
        if (client) {
            client.hmset(k.name, item.field, item.value);
        }
        return false;
    }

    $scope.$on("clearValuePanel", function () {
        $scope.key.type = "";
    });

    $scope.addValue = function () {
        if (client) {
            client.hset(k.name, $scope.field, $scope.value);
            $scope.moduleHidden = true;
            $scope.load(0);
        }
    }

    $scope.deleteValue = function () {
        if (lastSelect) {
            client.hdel(k.name, lastSelect.field);
            $scope.load(0);
        }
    }

    $scope.search = function () {
        if ($scope.searchValue) {
            match = "*" + $scope.searchValue + "*";
        } else {
            match = "";
        }
        $scope.load(0);
    }

    $scope.clearSearch = function () {
        match = "";
        $scope.searchValue = "";
        if (lastSelect) {
            lastSelect.selected = false;
            lastSelect = null;
        }
        $scope.load(0);
    }
}]);