'use strict';

/**
 * String Value
 * 
 * @author Kehaw
 * @version 2.0.0
 */
app.controller("SetValueCtrl", function ($scope, $stateParams, $state, redisConn) {
	$scope.items = [];

	$scope.key = $stateParams.key;
	if (!$stateParams.key) {
		$state.go("default");
		return;
	}
	let redis = redisConn.getConn();
	$scope.keyName = $stateParams.key.name;
	let oldKeyName = $stateParams.key.name;
	let oldItem = "";

	$scope.match = "*";
	$scope.count = 100;

	$scope.selectedItem = "";
	$scope.newItemData = ""
	$scope.updateDisabled = true;

	$scope.matchChange = function () {
		$scope.items = [];
		if ($scope.match === "") {
			$scope.match = "*";
		}
		redis.sscan(oldKeyName, 0, "MATCH", $scope.match, "COUNT", $scope.count, function (err, data) {
			$scope.items = data[1];
			$scope.$apply();
		});
	}
	$scope.matchChange();

	$scope.editItem = function (item) {
		oldItem = item.toString();
		$scope.selectedItem = oldItem;

		$scope.updateDisabled = false;

	}

	$scope.updateItem = function () {
		redis.multi().srem(oldKeyName, oldItem).sadd(oldKeyName, $scope.selectedItem).exec(function () {
			$scope.matchChange();
		});
	}

	$scope.newItem = function () {
		if (!$scope.newItemData || $scope.newItemData.trim() === "") {
			alert("值不能为空");
			return;
		}
		redis.sadd(oldKeyName, $scope.newItemData, function () {
			$scope.matchChange();
			$scope.newItemData = "";
		})
	}

	$scope.deleteItem = function (item) {
		redis.srem(oldKeyName, item, function () {
			$scope.selectedItem = "";
			$scope.updateDisabled = true;
			$scope.matchChange();
		})
	}


	$scope.updateName = function () {
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
		redis.expire(oldKeyName, $scope.ttl, function (err, data) {
			console.log(data);
		});
	}
});
