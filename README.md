# 欧拉教育-作业
打包上传：npm run build打包之后 将index.html文件改成home.html ,然后把所以文件放到新建HuaziHomework文件下，进行svn-commit提交
package.json文件配置如下:
"scripts": {
  //windows系统
  "start": "set NODE_ENV=dev && webpack-dev-server --progress --colors",
  "mock": "node --harmony ./mock/server.js",
  "build": "rd/s/q build && set NODE_ENV=production && webpack --config ./webpack.production.config.js --progress --colors"
  //mac系统
  "start": "NODE_ENV=dev && webpack-dev-server --progress --colors",
  "mock": "node --harmony ./mock/server.js",
  "build": "rm -rf ./build && NODE_ENV=production webpack --config ./webpack.production.config.js --progress --colors"
},
