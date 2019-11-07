# Kedis

[中文]()

Kedis is a free Redis desktop manager app, it is based on Electron. Thanks for these open source projects:

- [Electron](https://electronjs.org/)
- [ioredis](https://github.com/luin/ioredis)
- [vuejs](https://github.com/vuejs/vue)
- [vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)
- [Bootstrap](https://getbootstrap.com/)

The other projects please check `package.json`.

## Thanks

These guys donate me:

| Donator | date       |
| ------- | ---------- |
| \*煜    | 2019-03-17 |
| F\*s    | 2018-07-30 |
| \*羽    | 2018-04-23 |
| \*🐟    | 2018-04-22 |
| \*语    | 2018-08-04 |
| \*泽涛  | 2018-12-05 |
| A\*d    | 2018-12-05 |

## Mac OS Prepares

If you are using new version macOS, please install xcode command line tools first:

```
xcode-select --install
```

## node-sass rebuild

Some times you could get an error like:

```
Error: ENOENT: no such file or directory, scandir '**/node_modules/node-sass/vendor'
```

You should do this:

```
npm update
npm install
npm rebuild node-sass
```

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run electron:serve
```

### Compiles and minifies for production

```
npm run electron:build
```
