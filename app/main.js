const {
	app,
	BrowserWindow,
	Menu
} = require('electron');

const ipc = require('electron').ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
	// 创建浏览器窗口。
	win = new BrowserWindow({
		width: 1260,
		height: 800
	});




	// 然后加载应用的 index.html。
	win.loadFile('index.html');

	// 打开开发者工具
	// win.webContents.openDevTools();

	// 当 window 被关闭，这个事件会被触发。
	win.on('closed', () => {
		// 取消引用 window 对象，如果你的应用支持多窗口的话，
		// 通常会把多个 window 对象存放在一个数组里面，
		// 与此同时，你应该删除相应的元素。
		win = null
	});

	ipc.on("serverCreated", (event, message) => {
		win.webContents.send('electron-msg', "serverCreated");
	});

	ipc.on("serverUpdated", (event, message) => {
		win.webContents.send('electron-msg', "serverUpdated");
	});

	ipc.on("nodeUpdated", (event, message) => {
		win.webContents.send('electron-msg', "nodeUpdated");
	})

	ipc.on("keyCreated", (event, message) => {
		win.webContents.send("electron-msg", "keyCreated");
	})

	//创建自定义菜单
	const template = [{
		label: "链接",
		submenu: [{
			label: "新建链接",
			accelerator: 'CmdOrCtrl+N',
			click() {
				win.webContents.send('electron-msg', "createServer");
			}
		}, {
			label: "编辑链接",
			accelerator: 'CmdOrCtrl+E',
			click() {
				win.webContents.send('electron-msg', "editSelectedServer");
			}
		}, {
			label: "删除链接",
			accelerator: 'Ctrl+Delete',
			click() {
				win.webContents.send('electron-msg', "deleteSelectedServer");
			}
		}, {
			label: "导出",
			click() {
				let exportWin = new BrowserWindow({
					parent: win,
					width: 400,
					resizable: false,
					minimizable: false,
					maximizable: false,
					fullscreenable: false,
					modal: true,
					show: false
				});
				exportWin.on('closed', () => {
					createServerWin = null;
				});
				exportWin.setMenuBarVisibility(false);
				exportWin.loadFile('export.html');
				exportWin.once('ready-to-show', () => {
					exportWin.show();
				});
			}
		}, {
			label: "导入",
			click() {
				let importWin = new BrowserWindow({
					parent: win,
					width: 400,
					resizable: false,
					minimizable: false,
					maximizable: false,
					fullscreenable: false,
					modal: true,
					show: false
				});
				importWin.on('closed', () => {
					createServerWin = null;
				});
				importWin.setMenuBarVisibility(false);
				importWin.loadFile('import.html');
				importWin.once('ready-to-show', () => {
					importWin.show();
				});
			}
		}]
	}, {
		label: '键',
		submenu: [{
			label: "新建STRING",
			accelerator: 'CmdOrCtrl+Shift+S',
			click() {
				win.webContents.send('electron-msg', "showCreateStringWin");
			}
		}, {
			label: "新建HASH",
			accelerator: 'CmdOrCtrl+Shift+H',
			click() {
				win.webContents.send('electron-msg', "showCreateHashWin");
			}
		}, {
			label: "新建SET",
			accelerator: 'CmdOrCtrl+Shift+E',
			click() {
				win.webContents.send('electron-msg', "showCreateSetWin");
			}
		}, {
			label: "新建ZSET",
			accelerator: 'CmdOrCtrl+Shift+T',
			click() {
				win.webContents.send('electron-msg', "showCreateZsetWin");
			}
		}, {
			label: "新建LIST",
			accelerator: 'CmdOrCtrl+Shift+L',
			click() {
				win.webContents.send('electron-msg', "showCreateListWin");
			}
		}, {
			label: "删除",
			accelerator: 'CmdOrCtrl+Shift+Delete',
			click() {
				win.webContents.send('electron-msg', "deleteKey");
			}
		}]
	}, {
		label: '编辑',
		submenu: [{
			label: "撤销",
			role: 'undo'
		}, {
			label: "重做",
			role: 'redo'
		}, {
			type: 'separator'
		}, {
			label: "剪切",
			role: 'cut'
		}, {
			label: "复制",
			role: 'copy'
		}, {
			label: "粘贴",
			role: 'paste'
		}, {
			label: "删除",
			role: 'delete'
		}, {
			label: "选择所有",
			role: 'selectall'
		}]
	}, {
		label: '查看',
		submenu: [{
			label: "重新加载",
			role: 'reload'
		}, {
			label: "强制重新加载",
			role: 'forcereload'
		}, {
			label: "打开调试器",
			role: 'toggledevtools'
		}, {
			type: 'separator'
		}]
	}, {
		label: "窗口",
		role: 'window',
		submenu: [{
			label: "全屏",
			role: 'togglefullscreen'
		}, {
			label: "最小化",
			role: 'minimize'
		}, {
			label: "关闭",
			role: 'close'
		}]
	}, {
		label: "帮助",
		role: 'help',
		submenu: [{
			label: '了解更多',
			click() {
				require('electron').shell.openExternal('https://gitee.com/hbase_admin/Kedis')
			}
		}]
	}]

	// Mac OS 菜单附加项
	if (process.platform === 'darwin') {
		template.unshift({
			label: app.getName(),
			submenu: [{
				role: 'about'
			}, {
				type: 'separator'
			}, {
				role: 'services',
				submenu: []
			}, {
				type: 'separator'
			}, {
				role: 'hide'
			}, {
				role: 'hideothers'
			}, {
				role: 'unhide'
			}, {
				type: 'separator'
			}, {
				role: 'quit'
			}]
		});

		// Edit menu
		template[3].submenu.push({
			type: 'separator'
		}, {
			label: 'Speech',
			submenu: [{
				label: '开始听写',
				role: 'startspeaking'
			}, {
				label: '结束听写',
				role: 'stopspeaking'
			}]
		});

		// Window menu
		template[5].submenu = [{
			label: '关闭',
			role: 'close'
		}, {
			label: '最小化',
			role: 'minimize'
		}, {
			label: '放大',
			role: 'zoom'
		}, {
			type: 'separator'
		}, {
			label: '放置到前端',
			role: 'front'
		}]
	}

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)

}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// 在macOS上，当单击dock图标并且没有其他窗口打开时，
	// 通常在应用程序中重新创建一个窗口。
	if (win === null) {
		createWindow()
	}
})

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
