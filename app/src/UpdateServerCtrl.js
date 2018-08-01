'use strict';

app.controller("UpdateServerCtrl", function ($scope, local, redisConn, electron, $timeout) {
	$scope.server = {};

	ipc.on('server', (event, message) => {
		$scope.server = message;

		if ($scope.server.ssh) {
			$scope.showSSH = true;
			if ($scope.server.ssh.privateKey) {
				$scope.sshKey = true;
			}
		}

		$scope.$apply();
	});

	$scope.testStyle = "btn-secondary";
	$scope.isTesting = false;
	$scope.testText = "测试";



	$scope.showSSH = false;
	$scope.sshKey = false;

	let sshConn;
	let redis;
	let timeout;
	$scope.save = function () {
		if (!$scope.server.name && $scope.server.name.trim() === "") {
			electron.dialog.showErrorBox("错误", "名称不能为空。");
			return;
		}

		if (!$scope.server.host && $scope.server.host.trim() === "") {
			electron.dialog.showErrorBox("错误", "Redis IP 地址不能为空");
			return;
		}

		if (!$scope.server.port) {
			$scope.server.port = 6379;
		}

		if ($scope.showSSH) {
			if (!$scope.server.ssh.host || $scope.server.ssh.host.trim() === "") {
				electron.dialog.showErrorBox("错误", "SSH IP 地址不能为空");
				return;
			}

			if (!$scope.server.ssh.username || $scope.server.ssh.username.trim() === "") {
				electron.dialog.showErrorBox("错误", "SSH 用户名不能为空");
				return;
			}

			if (!$scope.server.ssh.port) {
				$scope.server.ssh.port = 22;
			}
		}

		let serverList = local.getObject("SERVER_LIST");

		if (!serverList) {
			serverList = [];
		}
		$scope.server.id = new Date().getTime();
		if (!$scope.showSSH) {
			delete $scope.server.ssh;
		}
		if (!$scope.sshKey && $scope.showSSH) {
			delete $scope.server.ssh.privateKey;
			delete $scope.server.ssh.passphrase;
		}
		if (sshConn) {
			sshConn.end();
		}

		if (serverList) {
			for (var i = 0; i < serverList.length; i++) {
				if (serverList[i].id == $scope.server.id) {

					serverList[i] = {
						name: $scope.server.name,
						host: $scope.server.host,
						port: $scope.server.port,
						auth: $scope.server.auth,
						pattern: $scope.server.pattern
					};
					local.setObject("SERVER_LIST", serverList);
					ipc.send("serverUpdated", "SUCCESS");
					let win = remote.getCurrentWindow();
					win.close();
					return;
				}
			}
		}
	}

	$scope.test = function () {
		if (!$scope.showSSH) {
			test();
		} else {
			testSSH();
		}

	}

	function test() {

		$scope.isTesting = true;
		let client = redisConn.createConn($scope.server);

		client.info(function (err, result) {
			if (err) {
				electron.dialog.showErrorBox("错误", err.message);
				$scope.testStyle = "btn-danger";
				$scope.testText = "测试失败，点击重试";
			} else {
				$scope.testStyle = "btn-success";
				$scope.testText = "链接成功";
			}
			client.end(true);
			$scope.isTesting = false;
			$scope.$apply();
		});
	}

	function testSSH() {
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
				sshConn.forwardOut(sock.remoteAddress, sock.remotePort, $scope.server.host, $scope.server.port, (err, stream) => {
					if (err) {
						$timeout.cancel(timeout);
						sock.end();
					} else {
						sock.pipe(stream).pipe(sock)
					}
				});
			}).listen(0, function () {
				redis = redisConn.createConn($scope.server, {
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
					} else {
						$scope.testStyle = "btn-success";
						$scope.testText = "链接成功";
					}
					redis.quit();
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
			$scope.$apply();
		})

		try {
			const connectionConfig = {
				host: $scope.server.ssh.host,
				port: $scope.server.ssh.port || 22,
				username: $scope.server.ssh.username,
				readyTimeout: 2000
			}
			if ($scope.sshKey) {
				sshConn.connect(Object.assign(connectionConfig, {
					privateKey: $scope.server.ssh.privateKey,
					passphrase: $scope.server.ssh.passphrase
				}))
			} else {
				sshConn.connect(Object.assign(connectionConfig, {
					password: $scope.server.ssh.password
				}))
			}
		} catch (err) {
			$timeout.cancel(timeout);
			alert(`SSH错误: ${err.message}`);
		}
	}

	$scope.close = function () {
		if (sshConn) {
			sshConn.end();
		}
		remote.getCurrentWindow().close();
	}
});
