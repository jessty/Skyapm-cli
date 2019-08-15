# skyapm-cli 

## 1.概述
- 用于无业务侵入式Node服务接入SkyAPM探针服务，方便多服务系统间调用问题排查

## 2.工作流程
- 借助nodejs模块化机制，通过生成中间连接文件skyapm-app.js，连接SkyAPM-nodejs模块与业务Node启动文件，达到零侵入式接入SkyAPM。

## 3.使用步骤
- 全局安装skyapm-cli
```sh
  npm install -g skyapm-cli # 安装内部依赖node-pre-gyp可能会出现权限问题，可通过添加 --unsafe-perm 解决
```
- 设置参数，生成skyapm-app.js文件(假如目标项目启动文件地址为app.js)
```sh
  SK_SERVER=127.0.0.1:11800  SK_SEVNAME=skyapm-node skycli init app.js
```
- 按业务流程正常启动Node服务
```sh
  pm2 start skyapm-app.js #或者 node skyapm-app.js
```

## 4.附录
### 参数
```sh
  SK_SERVER = 127.0.0.1:11800              #SkyAPM服务IP端口，必填
  SK_SEVNAME = skyapm-node                 #Node服务在SkyAPM中的唯一服务名，缺省则默认以 Node服务启动文件路径 为值
  SK_NPM_PATH = /SkyAPM-nodejs/index.js    #业务自定义SkyAPM-nodejs模块的入口路径，默认为本工具内部所依赖的SkyAPM-nodejs模块
  SK_ENTRY_JS = custom-app.js              #业务自定义本工具所生成的连接文件名，默认为skyapm-app.js
```
注：
- SK_NPM_PATH所指向的文件需存在，否则报错
- SK_ENTRY_JS请勿和项目启动文件同名，防止破坏原项目工程