'use strict';

app.controller("ListValueController", ["$scope", function($scope) {
    let client = null;

    let coredis = null;

    let lastSelect, oldItem;

    let start = 0;

    let limit = 100;

    let currentPage = 1;

    let k = {};

    $scope.items = [];

    let allPage = 0;

    $scope.moduleHidden = true;

    $scope.$on("loadListValue", function(event, server, key) {
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

            $scope.load(1);
        });
    });

    $scope.loadNext = function() {

        if (currentPage + 1 > allPage) {
            return;
        }
        $scope.load(++currentPage);
    }

    $scope.loadPre = function() {
        if (currentPage < 0) {
            return;
        }
        $scope.load(--currentPage);
    }

    $scope.load = function(page) {
        if (page <= 0) {
            currentPage = page = 1;
            return;
        }

        $scope.items = [];
        currentPage = page;
        $scope.count = client.llen(k.name) * 1;

        allPage = Math.ceil($scope.count / 100);

        $scope.pageInfo = currentPage + "/" + allPage;

        co(function*() {
            let items = yield coredis.lrange(k.name, (page - 1) * 100, (page - 1) * 100 + 100);
            for (let i = 0; i < items.length; i++) {
                $scope.items.push({
                    index: (page - 1) * 100 + i,
                    value: items[i]
                });
            }
            $scope.$apply();
        });

    };

    $scope.selecteItem = function(item) {
        if (lastSelect) {
            lastSelect.selected = false;
        }
        item.selected = true;
        lastSelect = item;
        oldItem = angular.copy(item);
        return true;
    }

    $scope.setNewValueFromKey = function(event, item) {
        if (event.key == "Enter") {
            $scope.setNewValue(item);
            return false;
        }
        return true;
    }

    $scope.setNewValue = function(item) {
        client.lset(k.name, oldItem.index, item.value);
        return false;
    }

    $scope.$on("clearValuePanel", function() {
        $scope.key.type = "";
        client ? client.end(true) : true;
    });

    $scope.addValue = function() {
        let bA = "AFTER";
        switch ($scope.insertType) {
            case "0":
                client.rpush(k.name, $scope.value);
                break;
            case "1":
                client.lpush(k.name, $scope.value);
                break;
            case "2":
                bA = "BEFORE";
            case "3":
                if (!$scope.otherValue) {
                    alert("Please give a pivot.");
                    return;
                }
                client.linsert(k.name, bA, $scope.otherValue, $scope.value);
                break;

        }
        $scope.load(1);
        $scope.moduleHidden = true;
        $scope.value = "";
        $scope.inserType = 0;
        $scope.otherValue = "";
    }

    $scope.deleteValue = function() {
        if (!lastSelect) {
            alert("Please select one");
        }
        client.multi().lset(k.name, lastSelect.index, "__avízfél在水一方__").lrem(k.name, 0, "__avízfél在水一方__").exec(function(err, replies) {
            if (err) {
                alert(err);
            } else {
                $scope.load(1);
            }
        });
    }

    $scope.saerchIndex = function() {
        if (client && $scope.searchValue) {

            client.lindex(k.name, $scope.searchValue, function(err, result) {
                if (result) {
                    $scope.items = [];
                    $scope.items.push({
                        index: Math.ceil($scope.searchValue),
                        value: result
                    });
                    $scope.pageInfo = "1/1";
                    $scope.count = 1;
                    $scope.$apply();
                } else {
                    alert("Member not found!")
                }
            });
        }

    }
    $scope.clearSearch = function() {
        $scope.load(1);
        $scope.searchValue = "";
    }
}]);