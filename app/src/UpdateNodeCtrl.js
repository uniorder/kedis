'use strict';

app.controller("UpdateNodeCtrl", function ($scope, local, redisConn, electron, $timeout) {
	$scope.testText = "测试";
	let timeout;
	let sshConn;
	let redis;
	let pass = false;
	ipc.on('info', (event, message) => {
		$scope.node = message.node;
		$scope.server = message.server;
		$scope.$apply();
	});

	$scope.save = function () {
		if (!pass) {
			alert("配置集群相关字段，请测试后再提交");
			return;
		}
		let serverList = local.getObject("SERVER_LIST");

		outer: for (let i = 0; i < serverList.length; i++) {
           
			if ($scope.server.id === serverList[i].id) {
				let nodes = $scope.server.nodes;
				for (let j = 0; j < nodes.length; j++) {
					if ($scope.server.nodes[j].id === $scope.node.id) {
						$scope.server.nodes[j] = $scope.node;
						serverList[i] = $scope.server;
						break outer;
					}
				}
			}
        }
		redis.disconnect();
        sshConn.end();
		local.setObject("SERVER_LIST", serverList);
		ipc.send("nodeUpdated", "SUCCESS");
		let win = remote.getCurrentWindow();
		win.close();
	}

	$scope.close = function () {
		if (sshConn) {
			sshConn.end();
		}
		remote.getCurrentWindow().close();
	}

	$scope.test = function () {
		timeout = $timeout(() => {
			$scope.testStyle = "btn-danger";
			$scope.testText = "测试失败，点击重试";
			electron.dialog.showErrorBox("错误", "通道连接超时");
			sshConn.end();
		}, 3000);
		$scope.isTesting = true;
		sshConn = new Client();
		sshConn.on('ready', () => {
			const sshServer = net.createServer(function (sock) {
				sshConn.forwardOut(sock.remoteAddress, sock.remotePort, $scope.node.host, $scope.node.port, (err, stream) => {
					if (err) {
						$timeout.cancel(timeout);
						sock.end();
					} else {
						sock.pipe(stream).pipe(sock)
					}
				});
			}).listen(0, function () {
				redis = redisConn.createConn($scope.node, {
					host: '127.0.0.1',
					port: sshServer.address().port
				});
				redis.on("error", function (err) {
					$timeout.cancel(timeout);
					electron.dialog.showErrorBox("错误", err.message);
					redis.quit();
				});

				redis.info(function (err, result) {
					$timeout.cancel(timeout);
					if (err) {
						$scope.testStyle = "btn-danger";
						$scope.testText = "测试失败，点击重试";
						pass = false;
					} else {
						$scope.testStyle = "btn-success";
						$scope.testText = "链接成功";
						pass = true;
					}

					$scope.isTesting = false;
					$scope.$apply();
				});
			})
		}).on('error', err => {
			$timeout.cancel(timeout);
			alert(`SSH错误: ${err.message}`);
			$scope.testStyle = "btn-danger";
			$scope.testText = "测试失败，点击重试";
			$scope.isTesting = false;
			pass = false;
			$scope.$apply();
		})

		try {
			const connectionConfig = {
				host: $scope.node.ssh.host,
				port: $scope.node.ssh.port || 22,
				username: $scope.node.ssh.username,
				readyTimeout: 2000
			}
			if ($scope.sshKey) {
				sshConn.connect(Object.assign(connectionConfig, {
					privateKey: $scope.node.ssh.privateKey,
					passphrase: $scope.node.ssh.passphrase
				}))
			} else {
				sshConn.connect(Object.assign(connectionConfig, {
					password: $scope.node.ssh.password
				}))
			}
		} catch (err) {
			$timeout.cancel(timeout);
			alert(`SSH错误: ${err.message}`);
		}
	}
});
