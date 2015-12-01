"use strict";

var app = require("core");
var tpl = __inline("tpls/home.tpl");
var Container = require("container");
var common = require("common");

var config = window.__APP_CONFIG;
var lazyLoad = require("lazyLoad");
var list = require("list");
var template = require("template");

var Home = Container.extend(
    function Home (conf) {
        conf = common.extend({
            cls: "P-home",
            html: template.render(tpl),
            // 区域配置,
            childs: {
            },
            retry: 3
        }, conf);
        this.retry = conf.retry;
        Home.master(this, null, [conf]);
    },
    {
        init: function () {
            Home.master(this, "init");
            this.doms = {
                header: $("." + this.config.cls).find(".P-header"),
                banner: $("." + this.config.cls + "Banner"),
                listsArea: $("." + this.config.cls + "ListsArea"),
                // ,"bottom":$("."+this.config.cls+"Bottom"),
                topSite: $("." + this.config.cls + "Topsite"),
                lCon: $("." + this.config.cls + "LoadingCon"),
                footer: $("." + this.config.cls).find(".P-footer")
            };

            app.common.toggleLoading(0);
            // this.render(1);
            // this.getData(1, {"screen": 1});
        },
        getData: function (remote, keep) {
            if (remote) {
                if (this.req) {
                    app.dc.abort(this.req);
                }
                // keep.screen = 1;
                this.doms.lCon.show();
                app.common.toggleLoading(1);
                this.getDataTs = Date.now();
                this.dataStatus = 0;
                this.req = app.dc.get("/home", this, "onData", keep);
            } else {
                return this.data;
            }
        },
        /**
         * 列表事件
         * @param  {Object} data 消息对象
         * @return {Bool}        false
         */
        onItemTap: function (data) {
            if (data.name === "topsite") {
                data = data.param.data;
                if (data && data.addr) {
                    app.core.wahhh({
                        type: "click",
                        pos: data.title,
                        index: data.index,
                        region: "home_topSites"
                    });
                    window.open(data.addr);
                }
            } else {
                /*var tmp = data.source.config.id;
                 var name = data.name;*/
                data = data && data.param || null;
                if (data) {
                    var dat = data.data;
                    app.dc.ds.go("videos", dat.id, dat, null, true);
                    app.common.goVideo(dat, "home_" + data.name);
                }
            }
            return false;
        },
        /**
         * 数据回调
         * @param  {Bool}      err  请求状态
         * @param  {Object}    data 数据对象
         * @return {Undefined}      无返回值
         */
        onData: function (err, data, keep) {
            this.req = 0;
            if ((err || !data || !data.items) && this.retry) {
                --this.retry;
                this.getData(1, keep);
            } else {
                if (data && data.serial && ("" + data.serial).indexOf("index") === -1) {
                    // 清除老版的数据并重新获取新的数据
                    app.dc.ds.go("channel").del("/api/home");
                    this.getData(1, {"screen": 1});
                    return;
                }
                data = {
                    items: data.items.items
                };
                this.dataStatus = 1;
                this.setData(data, keep);
                app.common.toggleLoading(0);
                this.doms.lCon.hide();
            }
        },
        /**
         * 设置模块数据
         * @param {Object} data 数据对象
         */
        setData: function (data, keep) {
            if (data) {
                if (this.data) {
                    this.data = this.data.concat(data.items);
                } else {
                    this.data = data.items;
                }

                if (this.fsDataLen === undefined) {
                    this.fsDataLen = data.len || 0;
                    this.fsTs = data.cacheTime && Date.now() + data.cacheTime || 0;
                }
                if (!keep.page) {
                    this.render(keep);
                }
            }
            /*if(keep && !keep.screen){
             this.getData(1,{'screen':1,'page':0},1);
             }*/
            return this;
        },

        /**
         * 渲染
         * @return {[type]} [description]
         */
        render: function (keep) {
            if (this.rendered || this.doms.listsArea.html()) {
                this.rendered = 1;
                this.reset(keep);
            }
            var data = [].concat(this.data);
            var tmp;

            this.create(
                "test_list"
                ,list.hList
                ,{
                    target:this.doms.listsArea
                    ,data:{items:data}
                    ,title:"What?"
                }
            );

            this.rendered = 1;

            // 首次进入页面时，收起地址栏
            setTimeout(function () {
                if ($(window).scrollTop() < 10) {
                    window.scrollTo(0, 1);
                }
            }, 100);
        },
        reset: function (keep) {
            var tmp;
            tmp = this.get("home_list_" + (keep && keep.screen || 0));
            if (tmp) {
                tmp.reset();
                tmp.destroy();
            }
            tmp = null;
            this.doms.banner.empty();
        },
        /**
         * 显示
         * @return {Object} 模块实例
         */
        show: function () {
            Home.master(this, "show");
        }
    }
);
exports.base = Home;

var HomePage;
// 最后的位置
var lastPosition = 0;
var pageTitle;
exports.show = function (app, boot) {
    if (!pageTitle) {
        pageTitle = app.getConf("name") + " - Home";
    }
    document.title = pageTitle;
    app.layout.onPageChange();
    if (!HomePage) {
        HomePage = app.core.create("home", Home, {
            target: app.mainCon,
            routerTs: boot.routerTs
        });
    } else {
        HomePage.show();
    }

    document.body.scrollTop = lastPosition;
};

exports.hide = function () {
    lastPosition = document.body.scrollTop;
    if (HomePage) {
        HomePage.hide();
    }
};