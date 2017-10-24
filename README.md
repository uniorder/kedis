# kedis
Kedis是一款基于Electron开发的Redis桌面管理工具，他是免费的！  
- [kedis](#kedis)
    - [截图](#%E6%88%AA%E5%9B%BE)
    - [编译](#%E7%BC%96%E8%AF%91)
    - [打包](#%E6%89%93%E5%8C%85)
    - [Windows x64 下载](#windows-x64-%E4%B8%8B%E8%BD%BD)
## 截图
![](http://www.kehaw.com/images/screenshot.png)
操作界面
![](http://www.kehaw.com/images/mo.png)
独立监控
## 编译
Clone项目之后，首先在本地安装Node.JS，安装成功后，分别在kedis和app目录下执行npm install，**重点注意一下，cnpm的install方式与npm并不一致，会导致可以运行，但是无法打包，请谨慎使用**，等待完成之后，在kedis目录下运行命令：  
```
npm run-script start
```
或者是：
```
electron ./app
```
即可执行程序。  
## 打包
Package默认提供了Mac、Linux和Windows的编译指令，大家可以根据自己的需要来编译，分别在kedis目录下执行：  
```
npm run-script packageWin64
npm run-script packageWin32
npm run-script packageDarwin
npm run-script packageLinux64
npm run-script packageLinux32
```
来获取不同平台下的安装包，目前整个程序在Windows 64位操作系统上测试通过。  
注意，基于Electron的程序不支持Windows XP（含）以前的Windows版本。

## Windows x64 下载
我们提供了一个编译好的Windows x64版本，可以访问 http://www.kehaw.com 来获取。