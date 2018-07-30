# Kedis

![kedis]()

#### 项目介绍
跨平台的Redis桌面管理工具

#### 软件架构
基于 AngularJS + Electron 开发

#### Windows版本直接下载

[百度网盘](https://pan.baidu.com/s/167L82TaRKsOtHAzjaSA6iQ)

其他版本后面会陆续提供

#### 安装教程

Package默认提供了Mac、Linux和Windows的编译指令，大家可以根据自己的需要来编译，分别在kedis目录下执行：  
```
npm run-script packageWin64
npm run-script packageWin32
npm run-script packageDarwin
npm run-script packageLinux64
npm run-script packageLinux32
```

#### 使用说明

Clone项目之后，首先在本地安装Node.JS，安装成功后，分别在kedis和app目录下执行npm install，**重点注意一下，cnpm的install方式与npm并不一致，会导致可以运行，但是无法打包，请谨慎使用**，等待完成之后，在kedis目录下运行命令：  
```
electron ./app
```

#### 参与贡献

1. Kehaw ge.bugman@gmail.com

#### 已知问题

Spring 通过 Spring data redis 默认写入的 Key 名中会包含不可解析的乱码，导致无法删除Key，这个我在想办法解决。

#### 下一个版本迭代

将会优化一下字体的显示方式，对中文字体进行优化。

#### 其他

欢迎访问我的无聊小站 http://www.kehaw.com