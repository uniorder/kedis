'use strict';

/**
 * String Value
 * 
 * @author Kehaw
 * @version 2.0.0
 */
app.controller("ZsetValueCtrl", function ($scope, $stateParams, $state, redisConn) {
	$scope.items = [];

	$scope.key = $stateParams.key;
	if (!$stateParams.key) {
		$state.go("default");
		return;
	}
	let redis;
	if ($stateParams.key.redisHost) {
		redis = redisConn.getClusterRedisConnByHostPort($stateParams.key.redisHost, $stateParams.key.redisPort);
	} else {
		redis = redisConn.getConn();
	}

	$scope.keyName = $stateParams.key.name;
	let oldKeyName = $stateParams.key.name;
	let oldItem = {};

	$scope.match = "*";
	$scope.count = 100;

	$scope.selectedItem = {};
	$scope.newItemData = {}
	$scope.updateDisabled = true;

	$scope.matchChange = function () {
		$scope.items = [];
		if ($scope.match === "") {
			$scope.match = "*";
		}
		redis.zscan(oldKeyName, 0, "MATCH", $scope.match, "COUNT", $scope.count, function (err, data) {
			for (let i = 0; i < data[1].length; i += 2) {
				$scope.items.push({
					score: data[1][i + 1],
					value: data[1][i]
				})
			}
			$scope.$apply();
		});
	}
	$scope.matchChange();

	$scope.editItem = function (item) {
		oldItem = item;
		$scope.selectedItem.value = item.value;
		$scope.selectedItem.score = item.score * 1;
		$scope.updateDisabled = false;
	}

	$scope.updateItem = function () {
		redis.multi().zrem(oldKeyName, oldItem.value).zadd(oldKeyName, $scope.selectedItem.score, $scope.selectedItem.value).exec(function () {
			$scope.matchChange();
		});
	}

	$scope.newItem = function () {
		if (!$scope.newItemData.value || $scope.newItemData.value.trim() === "") {
			alert("值不能为空");
			return;
		}
		if (!$scope.newItemData.score) {
			$scope.newItemData.score = 0;
		}
		redis.zadd(oldKeyName, $scope.newItemData.score, $scope.newItemData.value, function () {
			$scope.newItemData = {};
			$scope.matchChange();
		});
	}

	$scope.deleteItem = function (item) {
		redis.zrem(oldKeyName, item, function () {
			$scope.selectedItem = {};
			$scope.updateDisabled = true;
			$scope.matchChange();
		});
	}


	$scope.updateName = function () {
        if($scope.key.redisHost) {
            alert("暂不支持集群模式下的RENAME操作。");
            return;
        }
		if (oldKeyName === $scope.keyName) {
			return;
		}
		redis.exists($scope.keyName, function (err, data) {
			if (err) {
				return;
			}
			if (data) {
				let confirmed = confirm("新的键名已经存在，是否覆盖？");
				if (!confirmed) {
					return;
				}
			}
			redis.rename(oldKeyName, $scope.keyName, function (err, data) {
				oldKeyName = $scope.keyName;
				$scope.key.name = oldKeyName;
				$scope.$apply();
			});
		})
	}

	redis.ttl(oldKeyName, function (err, data) {
		$scope.ttl = data;
		$scope.$apply();
	})

	/**
	 * 更新过期时间
	 */
	$scope.updateTTL = function () {
		redis.expire(oldKeyName, $scope.ttl);
	}
});
