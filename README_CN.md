# Kedis

[English](https://github.com/uniorder/kedis/blob/master/README.md)

Kedis 是一个免费的Redis桌面管理工具，它基于Electron开发，特别感谢以下开源项目：

- [Electron](https://electronjs.org/)
- [ioredis](https://github.com/luin/ioredis)
- [vuejs](https://github.com/vuejs/vue)
- [vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)
- [Bootstrap](https://getbootstrap.com/)

更多的依赖参看 `package.json` 文件.

![Image](https://raw.githubusercontent.com/uniorder/kedis/master/screen-shot/1.png "Screen shot 1")

![Image](https://raw.githubusercontent.com/uniorder/kedis/master/screen-shot/2.png "Screen shot 2")

## Thanks

捐助我的人:

| Donator | Date       |
| ------- | ---------- |
| \*煜    | 2019-03-17 |
| F\*s    | 2018-07-30 |
| \*羽    | 2018-04-23 |
| \*🐟    | 2018-04-22 |
| \*语    | 2018-08-04 |
| \*泽涛  | 2018-12-05 |
| A\*d    | 2018-12-05 |

## 提示

每一个集合，例如key、hset、set等，最多只显示1000条数据，如果想要查看更多的数据，请使用过滤功能。

## Mac OS 上的一些问题

如果你使用的是最新版的 macOS，可能会遇到gyp编译错误问题，此时你可以先安装Xcode命令行工具：

```
xcode-select --install
```

## node-sass rebuild

如果在构建过程中发生了关于node-sass的错误，例如：

```
Error: ENOENT: no such file or directory, scandir '**/node_modules/node-sass/vendor'
```

你可以尝试以下操作：

```
npm update
npm install
npm rebuild node-sass
```

## 初始化

```
npm install
```

### 运行

```
npm run electron:serve
```

### 编译

```
npm run electron:build
```
