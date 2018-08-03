'use strict';

app.controller("CreateServerCtrl", function ($scope, local, redisConn, electron, $timeout) {
	$scope.server = {
		ssh: {}
	};

	ipc.on('server', (event, message) => {
		$scope.server = message;
		oldHost = message.host;
		oldPort = message.port;
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
	let pass;
	let oldHost;
	let oldPort;
	$scope.save = function (update) {
		check(update);
	}

	function check(update) {
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


		if ($scope.server.isCluster) {
			if (!pass) {
				alert("集群需要测试通过才能添加，请先点击测试按钮.");
				return;
			}
			if (update) {
				if (oldHost !== $scope.server.host || oldPort !== $scope.server.port) {
					let confirmed = confirm("由于您修改了HOST和PORT，将会重新刷新所有节点，这将会导致之前配置的节点信息（例如SSH）全部失效，是否继续？");
					if (confirmed) {
						goAndDo(update);
					}
				}
			} else {
				goAndDo(update);
			}
		} else {
			endAll(update);
		}
	}

	function goAndDo(update) {
		redis.cluster("nodes", (e, data) => {
			if (e) {
				console.log(e);
				return;
			}
			let nodes = [];
			let tmpStrList = data.split("\n");
			for (let i = 0; i < tmpStrList.length; i++) {
				let strs = tmpStrList[i].split(" ");

				let hostPort = strs[1];
				if (hostPort) {
					let host = hostPort.split("@")[0].split(":")[0];
					let port = hostPort.split("@")[0].split(":")[1];
					let types = strs[2].split(",");
					let node = {
						id: strs[0],
						host: host,
						port: port,
						types: types
					};
					if (host === $scope.server.host) {
						node.auth = $scope.server.auth;
						if ($scope.server.ssh) {
							node.ssh = $scope.server.ssh;
						}
					}
					nodes.push(node);
				}
			}
			$scope.server.nodes = nodes;
			endAll(update);
		});
	}

	function endAll(update) {
		let serverList = local.getObject("SERVER_LIST");

		if (!serverList) {
			serverList = [];
		}

		if (!$scope.showSSH) {
			delete $scope.server.ssh;
		} else {
			delete $scope.server.ssh.$$hashKey;
		}
		if (!$scope.sshKey && $scope.showSSH) {
			delete $scope.server.ssh.privateKey;
			delete $scope.server.ssh.passphrase;
		}
		if (sshConn) {
			sshConn.end();
		}
		if (redis) {
			redis.disconnect();
		}
		delete $scope.server.$$hashKey;


		if (update) {
			for (var i = 0; i < serverList.length; i++) {
				delete serverList[i].$$hashKey;
				delete serverList[i].selected;
				if (serverList[i].id == $scope.server.id) {
					delete $scope.server.$$hashKey;
					delete $scope.server.selected;
					serverList[i] = $scope.server;

					local.setObject("SERVER_LIST", serverList);
					ipc.send("serverUpdated", "SUCCESS");
					let win = remote.getCurrentWindow();
					win.close();
					return;
				}
			}
		} else {
			delete $scope.server.$$hashKey;
			delete $scope.server.selected;
			$scope.server.id = new Date().getTime();
			serverList.push($scope.server);
			local.setObject("SERVER_LIST", serverList);
			ipc.send("serverCreated", "SUCCESS");
			let win = remote.getCurrentWindow();
			win.close();
		}
	}

	$scope.test = function () {
		if (redis) {
			redis.disconnect();
		}
		if (!$scope.showSSH) {
			test();
		} else {
			testSSH();
		}
	}

	function test() {
		$scope.isTesting = true;
		redis = redisConn.createConn($scope.server);
		redis.info(function (err, result) {
			if (err) {
				electron.dialog.showErrorBox("错误", err.message);
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
