'use strict';

app.controller("SetValueController", ["$scope", function($scope) {
    let client = null;

    let coredis = null;

    let lastSelect, oldItem;

    $scope.moduleHidden = true;

    let match = null;
    $scope.selecteItem = function(item) {
        if (lastSelect) {
            lastSelect.selected = false;
        }
        item.selected = true;
        lastSelect = item;
        oldItem = angular.copy(item);
        return true;
    }

    let k;
    $scope.items = [];

    $scope.count = 0;

    let pages = [0];
    let nextIndex;
    let preIndex;

    $scope.$on("loadSetValue", function(event, server, key) {
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
                    s = yield coredis.sscan(k.name, index, "COUNT", 100);
                    console.log(s);
                } else {
                    s = yield coredis.sscan(k.name, index, "MATCH", match, "COUNT", 100);
                }
                $scope.count = yield coredis.scard(k.name);
                if (s[1].length == 0) {
                    alert("No more!");
                    return;
                }

                for (let i = 0; i < s[1].length; i++) {
                    $scope.items.push({
                        value: s[1][i]
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
                console.log($scope.items);
                $scope.$apply();
            }
        });
    }

    $scope.setValueFromKey = function(event, item) {
        if (event.key === "Enter") {
            $scope.setValue(item);
            return false;
        }
        return true;
    }

    $scope.setValue = function(item) {
        if (client) {
            client.multi().srem(k.name, oldItem.value).sadd(k.name, item.value).exec();
        }
        return false;
    }

    $scope.$on("clearValuePanel", function() {
        $scope.key.type = "";
        if (client != null) client.end(true);
    });

    $scope.addValue = function() {
        if (!$scope.value) {
            alert("Please enter a value.");
            return;
        }
        client.sadd(k.name, $scope.value);
        $scope.value = "";
        $scope.load(0);
        $scope.moduleHidden = true;
    }

    $scope.deleteValue = function() {
        if (!lastSelect) {
            alert("Please select one.");
            return;
        }
        client.srem(k.name, lastSelect.value);
        $scope.load(0);
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