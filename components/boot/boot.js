"use strict";

var config = require("config");
var app = require("core");
app.init({
    "data":config("data")
});

var pageManager = require("pageManager");
var router = require("router");

/**
 * 获取系统配置
 * @param  {Mix} keys 要获取的配置。支持.运算符或数组。
 *                    .eg
 *                        app.getConf('data.ds');
 *                        app.getConf(['data','ds']);
 * @return {Mix}      配置数据
 */
app.getConf = function(keys){
    return config(keys);
};

// @todo 实现简单的路由，只需要能route与响应hashChange就行

app.layout = require("layout");

// 把路由挂在app下方便调用
app.router = router;

// 把路由跳转挂在app下方便调用
app.route = function () {
    return router.route.apply(router, arguments);
};

// 默认页面
var defPage = config("defPage");
app.defPage = defPage;

var PAGE_REG_EXP = /^\/([^\/]+)/;
var QUERYS_REG_EXP = /&|!!/;


/**
 * 获取 query 参数
 * @param  {String} search  参数字符串
 * @param  {Mix}    spliter 分割字符串的符号或正则
 * @return {Object}         格式化后的参数对象
 */
function getQueries (search, spliter) {
    if (!search) {
        return null;
    }

    var query = search.replace(/^\?/, ""),
        queries = {};

    if (query && query.split(spliter || "&").length > 0) {
        query = query.split(spliter || "&");
        query.forEach(function (item) {
            item = item.split("=");
            var key = item[0],
                value = item[1];
            queries[key] = value;
        });
    }
    return queries;
}

var Q = getQueries(window.location.search);
app.core.urlQueries = Q || {};
var tmp = app.core.urlQueries.ch;
// 统计用的公用参数
app.core.wahhhVar = {
    ch: tmp && tmp.replace(/\//g, "") || ""
};

// 切换页面显示模块
var lastPage = null;

app.switchPage = pageManager.go;

/**
 * 修复我厂浏览器的某些傻逼行为
 * @param  {String} page 页面名称
 * @return {String}      处理完后的名称
 */
function fixPageName (page) {
    // 某些版本的浏览器有时候会把公参拼到hash里面
    if (page.indexOf("&") !== -1) {
        page = page.split("&")[0];
    }
    return page;
}
app.fixPageName = fixPageName;

/**
 * 自动加载次数
 * 0为不限制
 * @type {Number}
 */
var SCROLL_LOAD_LIMIT = 3;

/**
 * 有自动加载数据的页面
 * @type {Object}
 */
var SCROLL_LOAD_PAGES = {};

/**
 * 设置允许自动加载的页面
 * @param {Mix} name 页面名称，当为null时默认为当前页面
 * @param {Mix} tag  记录加载次数的标签或某为true的值
 */
function setScrollpage (name, tag) {
    if (name === null) {
        lastPage = pageManager.getLastPageName();
        name = lastPage;
    }
    SCROLL_LOAD_PAGES[name] = tag;
    if (tag && tag.attr && !tag.attr("data-limit")) {
        tag.attr("data-limit", SCROLL_LOAD_LIMIT);
    }
}
app.setScrollpage = setScrollpage;

/**
 * 滚动处理函数
 * @return {Undefined} 无返回值
 */
function scrollHandler () {
    lastPage = pageManager.getLastPageName();
    var has = SCROLL_LOAD_PAGES[lastPage];
    var db = document.body;
    if (has && db.scrollTop && (db.scrollHeight - db.scrollTop - 200) <= document.documentElement.clientHeight) {
        var page = pageManager.getPage();
        if(!page){
            return;
        }
        if (page.loadMore) {
            // 优先调用页面模块提供的loadMore接口
            page.loadMore(app);
        } else {
            var loading = has ? +has.attr("data-loading") : 0;
            var limit = +has.attr("data-limit");
            limit = isNaN(limit) ? null : limit;
            if (limit && !loading) {
                --limit;
                has.attr("data-limit", limit).click();
            }
        }
        page = null;
    }
    db = null;
}
window.addEventListener("scroll", scrollHandler);

/**
 * 分类或栏目匹配正则
 * @type {RegExp}
 */
var CATE_REG = /^#(?:[!\/]+)?(\w+)(\?(\w+)\=([\w\s]+))?/;
/**
 * 获取当前页面(分类)
 * @return {String} 分类名称
 */
function getCate () {
    var c = window.location.hash.match(CATE_REG);
    if (c) {
        if (c[1] === "categoryVideoList") {
            c = c[4];
        } else {
            c = c[1];
        }
    }
    if (!c) {
        c = defPage;
    }
    c = c.toLowerCase();
    c = app.fixPageName(c);
    return c;
}
app.getCate = getCate;


/**
 * 页面加载完成后的回掉函数
 * @param  {Int}       ts   页面开始加载时的时间戳
 * @param  {String}    page 页面名称
 * @param  {String}    type 页面加载形式
 * @return {Undefined}      无返回值
 */
function onPageload(ts, page ,type){
    // app.common.toggleLoading(0);
    // sendLoadSourcesTime(ts, page, type);
}

var dasdas = {
    "/cart": true
}

module.exports = function () {
    // 初始化pm
    pageManager.init(app);
    app.layout.render();
    
    // 页面渲染的主区域
    app.mainCon = $("#main");

    router("*", function (ctx) {
        var match = ctx.pathname.match(PAGE_REG_EXP);
        var page = match && match.length > 1 ? fixPageName(match[1]) : defPage;
        var fromPage = app.core.wahhhVar.toPage || "_";
        var toPage = "/" + getCate();

        app.core.wahhhVar.fromPage = decodeURIComponent(fromPage);
        app.core.wahhhVar.toPage = decodeURIComponent(toPage);

        ctx.queries = getQueries(ctx.search, QUERYS_REG_EXP);

        // 放弃正在发送的请求
        app.dc.abort();
        
        // 显示菊花
        app.common.toggleLoading(1, "body");

        // 切换页面
        pageManager.go(
            "pages/"+page,
            ctx,
            onPageload
        );
    });

    // 启动路由
    router();
};