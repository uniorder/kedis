'use strict';

/**
 * String Value
 * 
 * @author Kehaw
 * @version 2.0.0
 */
app.controller("ListValueCtrl", function ($scope, $stateParams, $state, redisConn,klog) {
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
	$scope.newItemData = "";
	$scope.selectedItem = {
		index: null,
		data: null
	};
	$scope.currentPage = 1;
	$scope.updateDisabled = true;

	$scope.pageSize = 100;

	redis.llen(oldKeyName, function (err, len) {
		$scope.totalCount = len;
	});

	$scope.loadPage = function () {
		let start = ($scope.currentPage - 1) * $scope.pageSize;
		redis.lrange(oldKeyName, start, $scope.pageSize, function (err, data) {
			$scope.items = [];
			for (let i = 0; i < data.length; i++) {

				$scope.items.push({
					index: start,
					data: data[i]
				});
				start++;
			}
			$scope.$apply();
		});
	}

	$scope.loadPage();

	$scope.editItem = function (item) {
		$scope.selectedItem.index = item.index;
		$scope.selectedItem.data = item.data;
		$scope.updateDisabled = false;
	}

	$scope.updateItem = function () {
		redis.lset(oldKeyName, $scope.selectedItem.index, $scope.selectedItem.data, function (err, re) {
			$scope.loadPage();

		});
	}

	$scope.newItemR = function () {
		if ($scope.newItemData.trim() === "") {
			alert("新的元素值不能为空");
			return;
		}
		redis.rpush(oldKeyName, $scope.newItemData, function () {
			$scope.newItemData = "";
			$scope.loadPage();
		});
	}

	$scope.newItemL = function () {
		if ($scope.newItemData.trim() === "") {
			alert("新的元素值不能为空");
			return;
		}
		redis.lpush(oldKeyName, $scope.newItemData, function () {
			$scope.newItemData = "";
			$scope.loadPage();
		});
	}

	$scope.deleteItem = function (item) {
		redis.multi()
			.lset(oldKeyName, item.index, "__পৌনে চারটা বাজে __")
			.lrem(oldKeyName, 0, "__পৌনে চারটা বাজে __")
			.exec(function (err, replies) {
				$scope.loadPage();
			});
	}

	/**
	 * 更新Key name
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
