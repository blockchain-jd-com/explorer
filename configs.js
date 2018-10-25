﻿﻿module.exports = {
  devPort: 3001,
  port: 3031,
  local: { //构建在server文件夹内测试用
    resourcePath: './server/public/resources/',
    distName: 'app',
    resourcesName: 'resources',
    webDomain: 'http://localhost:3031',
    indexExtName: '.html',
    indexPath: './server/views/',
    bs: {
      proxy: 'http://localhost:3001',
      port: 3021,
      ui: {
        port: 3011
      }
    },
    ver: '20171107'
  },
  dev: { //构建在web项目内，开发环境
    resourcePath: './dist/resources/',
    distName: 'app',
    resourcesName: 'resources',
    webDomain: 'http://projectName.dev.jd.com',
    indexExtName: '.html',
    indexPath: './dist/pages/',
    bs: {
      proxy: 'http://projectName.dev.jd.com',
      port: 3021,
      ui: {
        port: 3011
      }
    },
    ver: '20171107'
  },
  web: { //构建在web项目内，生产环境
    resourcePath: './src/main/resources/',
    distName: 'app',
    resourcesName: 'resources',
    webDomain: 'http://projectName.jd.com',
    indexExtName: '.html',
    indexPath: './src/main/resources/pages',
    bs: {
      proxy: 'http://projectName.jd.com',
      port: 3021,
      ui: {
        port: 3011
      }
    },
    ver: '20171107'
  }
};