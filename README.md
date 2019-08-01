### 我想回复大家，但是Gitee说我的手机号码已经被别的账号绑定，不能进行回复，目前我一脸懵逼状态中。

![kedis](https://images.gitee.com/uploads/images/2018/0805/014413_924d3efa_115307.png "LOGO2.png")

# Kedis
Kedis是一个基于AngularJS、Electron和Node.JS搭建的Redis桌面管理工具，前端样式表采用了Bootstrap作为原始代码，并在此基础上做了一些个性化的改造。

除此之外，Kedis还依赖了ioredis和ssh2两个开源项目，其他的依赖详细请查看package.json。

> 最近不再提供打包，需要的朋友需要自己打包，因为一直在不停的维护，目前Master节点上的代码是最新的，并且相对稳定。

#### 截图

![Kedis](https://images.gitee.com/uploads/images/2018/0801/162246_f70f2189_115307.png "Kedis")

![Kedis Cluster](https://images.gitee.com/uploads/images/2018/0803/120220_2e80bea2_115307.png "Kedis Cluster")

#### 亮点

- 支持SSH通道
- 支持集群管理
- 跨平台

#### 可执行程序下载

- [Mac OS](https://gitee.com/kehaw9818/Kedis/releases)
- [Windows](https://gitee.com/kehaw9818/Kedis/releases)
- [Linux](https://gitee.com/kehaw9818/Kedis/releases)

#### 特别备注集群配置方法

集群中的所有的MASTER节点都需要配置SSH才能正常使用（Slave不需要配置），设置方法为：创建完毕之后，点击服务器，右下角会刷新出所有的节点，右键点击MASTER节点，选择配置SSH。
当前版本只支持SSH方式的集群链接，后续可能会放开。

#### 编译方法

首先确保您的计算机上已经安装了Node.JS的最新版本，然后安装electron到全局，即`npm install -g electron`，接着在Kedis目录下运行`npm install`，等待完成之后，再进入app目录下运行`npm install`，等安装完毕之后在app目录下执行`electron .`即可执行程序。

#### 打包方法

同样，确保已经安装了最新版本的Node.JS，然后全局安装electron的打包工具，即`npm install -g electron-packager`，安装完毕后，你可以直接在Kedis根目录下执行脚本来完成对应版本的打包：
```
npm run packageWin64
npm run packageWin32
npm run packageDarwin
npm run packageLinux64
npm run packageLinux32
```
其中packageDarwin对应的是Mac OS版本的Kedis。

#### 当前版本测试情况

当前只支持通过SSH的方式链接集群环境。

#### 开发历程

Kedis最早一版发布于2018年4月，当初是发布在GitHub上的，当时的主要目的就是开发一个自己喜欢风格的Redis桌面管理工具，开发之初并没有打算公布出来，在2018年7月，有网友表示希望能够继续维护下去，于是就将代码库迁入到Gitee，花了一个礼拜重构了代码，所以在Gitee上的初始版本是2.0。

在重构之初我并没有打算支持集群，但是之前一个老友说不支持集群没什么亮点，就强塞了一个集群的功能进去。

在没有支持集群之前，代码的可读性还是蛮高的，但是为了支持集群，导致部分代码的可阅读性比较差，看来规划还是非常重要。

#### 备注

由于个人环境不是很完善，部分功能无法测试完全，各位在使用的时候，发生了BUG，还请第一时间告知我，真的非常感谢。

#### 后续支持

目前首要做的事情是发布一版英文版，有朋友说想支持订阅和发布功能，这个也在考虑之中。

#### 目前问题
一些issues里反应的问题，我都有去看，但是说实话确实有点不好意思，到年底了比较忙，并且因为为了支持集群，搞得代码有点乱，我打算年后看情况再重构一下。

#### 捐赠

如果您觉得这份工具用着还比较顺手，希望能够多多支持我的开发。

![Kedis 捐赠](https://images.gitee.com/uploads/images/2018/0803/121032_9d458f9e_115307.png "捐赠")

有了你的捐赠，Kedis会变得更好，如有捐赠，还请在下方留下大名，感谢您对开源事业的支持。

微信捐赠：
- *煜 2019-03-17捐赠
- F*s 2018年7月30日捐赠
- *羽 2018年4月23日捐赠
- *🐟 2018年4月22日捐赠
- *语 2018-08-04
- *泽涛 2018-12-05 捐赠
- A*d 2018-12-05 捐赠