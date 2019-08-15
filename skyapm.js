#! /usr/bin/env node

// dependencies
const commander = require('commander');
const path = require('path');
const fs = require('fs');
const {moduleDir} = require('./util');

// 工具版本
let version = require('./package.json').version;

commander
    .version(version)
    .description('A cli for skyapm in node environment')
    .command('init <path>')
    .description('wrapping the running file with skyapm-nodejs')
    .action((runPath) => {
        const absRunPath = path.resolve(process.cwd(), runPath);
        const runInfo = Object.assign({}, path.parse(absRunPath), {
            abs: absRunPath
        });
        const params = {
            serviceName: process.env.SK_SEVNAME || runInfo.abs,
            skyapmPath: process.env.SK_NPM_PATH || path.resolve(moduleDir, './node_modules/skyapm-nodejs/index.js'),
            entryJS: process.env.SK_ENTRY_JS || 'skyapm-app.js',
            skyapmServer: process.env.SK_SERVER,
        };
        // 参数检验
        if (!params.skyapmServer) {
            throw Error('ERROR! There is no SK_SERVER in environment variables!');
        }
        if (params.entryJS === runInfo.base) {
            throw Error(`ERROR! The SK_ENTRY_JS(${params.entryJS}) should not be the same as the original running file(${runPath})!`);
        }
        if (!fs.existsSync(params.skyapmPath)) {
            throw Error(`ERROR! The dependency(skyapm-nodejs) does not exit in ${params.skyapmPath}`);
        }
        if (!fs.existsSync(runInfo.abs)) {
            throw Error(`ERROR! The original running file does not exit in ${runInfo.abs}`);
        }
        if (params.serviceName === runInfo.abs) {
            console.warn(`WARNNING! It is best to set SK_SEVNAME. Now it is default to the running path(${runInfo.abs})!`);
        }

        let {skyapmPath, serviceName} = params;
        let targetPath = path.resolve(runInfo.dir, `./${params.entryJS}`);
        let runPathStr = runInfo.abs;

        // windows下特殊处理路径
        if (/^win/.test(require('os').platform())) {
            skyapmPath = skyapmPath.replace(/\\/g, '\\\\');
            serviceName = serviceName.replace(/\\/g, '\\\\');
            runPathStr = runPathStr.replace(/\\/g, '\\\\');
        }

        console.log({
          'Generated in': targetPath, 
          'Original running file': absRunPath,
          'Skyapm-cli params': params
        });

        let now = new Date();

        // 生成或覆盖skyapm 启动文件
        const skyapmScript = `
// start SkyWalking Agent
let _serviceName='${serviceName}';
let _collectorServer='${params.skyapmServer}';
try {
    console.info('Generated', 'with skywalking-nodejs-kit', '${version}', ' at', '${now.toLocaleString()}' );
    console.info('Starting SkyWalking Agent', 'serviceName:', _serviceName, 'collectorServer:', _collectorServer);
    
    require('${skyapmPath}').start({
      serviceName: _serviceName,
      directServers: _collectorServer,
    });
    
} catch (error) {
    console.error('SkyWalking Agent error:', error, 'serviceName', _serviceName, 'collectorServer', _collectorServer);
} finally {
    console.info('-----------------------------------------------------');
}

// app entry
require('${runPathStr}');
`;

        try {
            fs.writeFileSync(targetPath, skyapmScript, {encoding: 'utf8', flat: 'w',});
            console.info('创建skyapm启动文件成功！', targetPath);
        } catch (error) {
            console.error('创建skyapm启动文件失败！', targetPath, 'error:', error);
            // 清空旧文件
            fs.existsSync(targetPath) && fs.unlinkSync(targetPath)
        }
    });

commander.parse(process.argv);