# kedis
由于GitHub实在太卡，整个项目迁移到Gitee上了，新项目地址为：https://gitee.com/hbase_admin/Kedis 这是全新的重构版本，修复了一些BUG，提升了性能。

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
中国地区执行编译的时候可能无法顺利下载相应的的依赖包，通过淘宝的源可以解决问题，具体使用方法是在控制台中指定环境变量如下：
```
set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
```
然后再执行以上打包命令即可完成打包。

注意，基于Electron的程序不支持Windows XP（含）以前的Windows版本。

## 可执行程序下载
我们提供了一些编译好的版本，可以访问 http://www.kehaw.com 来获取。
