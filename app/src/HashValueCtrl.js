'use strict';

/**
 * String Value
 * 
 * @author Kehaw
 * @version 2.0.0
 */
app.controller("HashValueCtrl", function ($scope, $stateParams, $state, redisConn,klog) {

	$scope.key = $stateParams.key;
	if (!$stateParams.key) {
		$state.go("default");
		return;
	}

	$scope.items = [];
	$scope.selectedItem = {
		field: "",
		value: ""
	};
	$scope.newItem = {
		field: "",
		value: ""
	};
	$scope.match = "*";
	$scope.count = 100;
	$scope.valueDisabled = true;

	let redis;
	if ($stateParams.key.redisHost) {
		redis = redisConn.getClusterRedisConnByHostPort($stateParams.key.redisHost, $stateParams.key.redisPort);
	} else {
		redis = redisConn.getConn();
	}

	$scope.keyName = $stateParams.key.name;
	let oldKeyName = $stateParams.key.name;


	$scope.matchChange = function () {
		if ($scope.match === "") {
			$scope.match = "*";
		}
		$scope.items = [];
		redis.hscan(oldKeyName, 0, "MATCH", $scope.match, "COUNT", $scope.count, function (err, data) {
			for (let i = 0; i < data[1].length; i += 2) {
				$scope.items.push({
					field: data[1][i],
					value: data[1][i + 1]
				});
			}
			$scope.$apply();
		});
	}
	$scope.matchChange();

	$scope.editField = function (item) {
		$scope.valueDisabled = false;
		$scope.selectedItem.field = item.field;
		$scope.selectedItem.value = item.value;
	}

	$scope.updateValue = function () {
		redis.hset(oldKeyName, $scope.selectedItem.field, $scope.selectedItem.value, function (err) {
			$scope.matchChange();
		});
	}

	$scope.newField = function () {
		if (!$scope.newItem.field || $scope.newItem.field.trim() === "") {
			alert("字段名不能为空");
			return;
		}
		if (!$scope.newItem.value || $scope.newItem.value.trim() === "") {
			alert("字段值不能为空");
			return;
		}
		redis.hset(oldKeyName, $scope.newItem.field, $scope.newItem.value, function () {
			$scope.matchChange();
			$scope.newItem = {
				field: "",
				value: ""
			};
			$scope.$apply();
		});
	}

	$scope.deleteField = function (item) {
		redis.hdel(oldKeyName, item.field, function () {
			$scope.matchChange();
			$scope.selectedItem = {
				field: "",
				value: ""
			};
			$scope.$apply();
		});
	}
	/**
	 * 修改 Key 名称
	 */
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
                klog.error(err.message);
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
		});
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
