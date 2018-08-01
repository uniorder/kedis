# Kedis

![Kedis](https://images.gitee.com/uploads/images/2018/0730/162630_d407f030_115307.png "屏幕快照 2018-07-30 下午4.22.32.png")

#### 项目介绍
跨平台的Redis桌面管理工具，最新版已经支持SSH！

#### 软件架构
基于 AngularJS + Electron 开发

#### 可执行程序下载
- [Windows版本（64位）](https://pan.baidu.com/s/167L82TaRKsOtHAzjaSA6iQ)更新于2018-07-29
- [Mac版本](https://gitee.com/kehaw9818/Kedis/releases) 发行版

**打包在近期会比较频繁，因为会不断的尝试修改一些细节**

#### 打包教程

Package默认提供了Mac、Linux和Windows的编译指令，大家可以根据自己的需要来编译，分别在kedis目录下执行：  
```
npm run packageWin64
npm run packageWin32
npm run packageDarwin -- Mac OS
npm run packageLinux64
npm run packageLinux32
```

#### 使用说明

Clone项目之后，首先在本地安装Node.JS，安装成功后，分别在kedis根目录和kedis/app目录下执行npm install，**重点注意一下，cnpm的install方式与npm并不一致，会导致可以运行，但是无法打包，请谨慎使用**，等待完成之后，在kedis目录下运行命令：  
```
electron ./app
```

#### 参与贡献

1. Kehaw ge.bugman@gmail.com

#### 已知问题

Spring 通过 Spring data redis 默认写入的 Key 名中会包含不可解析的乱码，导致无法删除Key，这个我在想办法解决。

#### 下一个版本迭代

提供国际化支持

#### 其他

欢迎访问我的无聊小站 http://www.kehaw.com