'use strict';

//Electron 接口
const {
	remote,
	shell
} = require('electron');

const ipc = require('electron').ipcRenderer;

const {
	Menu,
	MenuItem,
	BrowserWindow
} = remote;

//SSH
const {
	Client
} = require('ssh2');
const net = require('net');

// jQuery
var $ = require('jquery');

// const redis = require('redis');
const Redis = require('ioredis');

var app = angular.module('app', ['electangular', 'ui.router', 'ui.bootstrap']);

app.config(function ($stateProvider) {
	$stateProvider.state("default", {
		url: '/',
		templateUrl: "default.html",
		params: {
			key: null
		}
	}).state("string", {
		url: "/string",
		templateUrl: "value-string.html",
		params: {
			key: null
		}
	}).state("hash", {
		url: "/hash",
		templateUrl: "value-hash.html",
		params: {
			key: null
		}
	}).state("set", {
		url: "/set",
		templateUrl: "value-set.html",
		params: {
			key: null
		}
	}).state("zset", {
		url: "/zset",
		templateUrl: "value-zset.html",
		params: {
			key: null
		}
	}).state("list", {
		url: "/list",
		templateUrl: "value-list.html",
		params: {
			key: null
		}
	});
});

app.factory('klog', function () {
	let me = this;
	this.lastMsg = "";
	return {
		error: function (msg) {
			if (msg === me.lastMsg) {
				return;
			}
			me.lastMsg = msg;
			// $("#lastError").html("<i class='fas fa-exclamation-triangle'></i>&nbsp;" + msg);
			new Notification("错误", {
				body: msg,
				icon: "./images/error.png"
			});
		}
	}
});

app.factory('local', ['$window', function ($window) {
	return { //存储单个属性
		set: function (key, value) {
			$window.localStorage[key] = value;
		}, //读取单个属性
		get: function (key, defaultValue) {
			return $window.localStorage[key] || defaultValue;
		}, //存储对象，以JSON格式存储
		setObject: function (key, value) {
			for (let i = 0; i < value.length; i++) {
				if (value.selected) {
					delete value.selected;
				}
			}
			$window.localStorage[key] = JSON.stringify(value); //将对象以字符串保存
		}, //读取对象
		getObject: function (key) {
			return JSON.parse($window.localStorage[key] || null); //获取字符串并解析成对象
		}
	}
}]);

/**
 * 获取Redis链接
 */
app.factory('redisConn', function (klog) {
	this.createConn = function (config, sshOverwrite) {
		if (config.auth) {
			config.password = config.auth;
		}
		config.port = config.port || 6379;
		config.connectTimeout = 2000;
		config.rawHost = config.host;
		config.rawPort = config.port;
		me.conn = new Redis(Object.assign({}, config, sshOverwrite, {
			retryStrategy: function (times) {
				return false;
			}
		}));
		return me.conn;
	}

	this.createSSHConn = function (config, callBack) {

		if (!config.ssh) {
			return null;
		}
		let sshConn = new Client();
		sshConn.on('ready', () => {
			const sshServer = net.createServer(function (sock) {
				sshConn.forwardOut(sock.remoteAddress, sock.remotePort, config.host, config.port, (err, stream) => {
					if (err) {
						klog.error(err.message);
						sock.end();
					} else {
						sock.pipe(stream).pipe(sock)
					}
				});
			}).listen(0, function () {
				let redis = me.createConn(config, {
					host: '127.0.0.1',
					port: sshServer.address().port
				});
				redis.on("error", function (err) {
					klog.error(err.message);
					// redis.end(true);
				});
				callBack(redis, sshConn);
			})
		}).on('error', err => {
			klog.error(err.message);
		});

		try {
			const connectionConfig = {
				host: config.ssh.host,
				port: config.ssh.port || 22,
				username: config.ssh.username,
				readyTimeout: 2000,
				tls: config.tls || false
			}
			if (config.ssh.key) {
				sshConn.connect(Object.assign(connectionConfig, {
					privateKey: config.ssh.key,
					passphrase: config.ssh.passphrase
				}))
			} else {
				sshConn.connect(Object.assign(connectionConfig, {
					password: config.ssh.password
				}))
			}
		} catch (err) {
			klog.error(err.message);
		}
	}
	let me = this;



	return {
		getClusterRedisConnByHostPort: function (host, port) {
			for (let i = 0; i < me.rs.length; i++) {
				if (me.rs[i].options.rawHost == host && me.rs[i].options.rawPort == port) {
					return me.rs[i];
				}
			}
		},
		getClusterConn: function () {
			return {
				redisConns: me.rs,
				sshConns: me.ss
			}
		},
		getConn: function () {
			return me.conn;
		},
		createConn: me.createConn,
		createSSHConn: me.createSSHConn,
		createClusterConn: function (server) {
			me.rs = [];
			for (let i = 0; i < server.nodes.length; i++) {
				if (server.nodes[i].types.indexOf("master") > -1) {
					let r = me.createConn(server.nodes[i]);
					rs.push(r);
				}
			}
			me.rs = rs;
			return rs;
		},
		createClusterSSHConn: function (server, callBack) {
			me.rs = [];
			me.ss = [];
			let i = 0;
			let j = 0;
			let k = 0;
			let nodes = [];

			for (; i < server.nodes.length; i++) {
				//只需要考虑Master节点和已经配置了SSH的节点
				if (server.nodes[i].types.indexOf("master") > -1 && server.nodes[i].ssh) {
					nodes.push(server.nodes[i]);
				}
			}

			for (; j < nodes.length; j++) {
				me.createSSHConn(nodes[j], (redisConn, sshConn) => {
					me.rs.push(redisConn);
					me.ss.push(sshConn);
					console.log(j, nodes.length);
					if (++k === nodes.length - 1) {
						callBack(me.rs, me.ss);
					}
				});
			}
		}
	}
});
