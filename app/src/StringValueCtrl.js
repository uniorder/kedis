'use strict';

/**
 * String Value
 * 
 * @author Kehaw
 * @version 2.0.0
 */
app.controller("StringValueCtrl", function ($scope, $stateParams, $state, redisConn) {
	$scope.data = null;

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

	redis.get($stateParams.key.name, function (err, data) {
		$scope.data = data;

		$scope.$apply();
	});

	$scope.updateName = function () {
        if($scope.key.redisHost) {
            alert("暂不支持集群模式下的RENAME操作。");
            return;
        }
		console.log("进来了");
		if (oldKeyName === $scope.keyName) {
			console.log("跳出");
			return;
		}
		redis.exists($scope.keyName, function (err, data) {
			if (err) {
				console.log(err);
				return;
			}
			if (data) {
				let confirmed = confirm("新的键名已经存在，是否覆盖？");
				if (!confirmed) {
					return;
				}
			}
			redis.rename(oldKeyName, $scope.keyName, function (err, data) {
				if (err) {
					console.log(err);
				}
				oldKeyName = $scope.keyName;
				$scope.key.name = oldKeyName;
				$scope.$apply();
			});
		})
	}

	$scope.updateData = function () {
		redis.set($scope.keyName, $scope.data);
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

	$scope.format = function () {
		try {
			$scope.data = JSON.stringify(JSON.parse($scope.data), null, 4);
		} catch (e) {
			alert(e);
		}
	}
});
