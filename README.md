派+ 商城前端 1.0.0
---------------------

## 开发环境配置
1. 安装开发工具 [scrat](https://github.com/fis/scrat)
    ```shell
    npm install -g scrat
    ```

1. clone项目（以下为示例）

    ```shell
    git clone git@git.wxpai.cn:pi-plusplus/frontend-shop.git
    ```

1. 执行项目文件夹下的 init 脚本
	```shell
	./init
	```

1. 如果之前有使用其他项目使用scrat,使用 `scrat server clean` 初始化调试目录

1. 使用 `scrat release -wL` 构建项目并监听改变

     > 如果发现提示fis-parser-less未安装之类的问题，暂时先手动全局安装fis-parser-less。

1. 使用 `scrat server start` 启动项目服务器

1. 浏览项目效果 http://localhost:3721/

## init 过程
1. 初始化前端服务

	```shell
	mkdir server
	cd server
	git clone git@git.wxpai.cn:pi-plusplus/fe-server.git .
	npm install
	```

1. 初始化公共组件库

	```shell
	mkdir component_modules
	cd component_modules
	git clone git@git.wxpai.cn:pi-plusplus/frontend-componets.git .
	```
