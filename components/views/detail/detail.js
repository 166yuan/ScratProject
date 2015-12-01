"use strict";

var app = require("core");
var Container = require("container");
var template = require("template");
var tpl = __inline("tpls/layout.tpl");
var goods_info_tpl = __inline("tpls/goods_info.tpl");
var carousel = require("carousel");
var cdn_host = app.getConf("cdn_host");

var DetailPage = Container.extend(
    function Detail(conf) {
        conf = app.common.extend({
            cls: "P-detail",
            html: template.render(tpl)
        }, conf);
        DetailPage.master(this, null, [conf]);
    }
    ,{
        init: function() {
            DetailPage.master(this,"init");
            this.doms = {
                "goods":this.$el.find(".P-detailGoods")
                ,"swiper":this.$el.find(".P-detailSwiper")
                ,"showBtn":this.$el.find(".P-detailShow")
                ,"note":this.$el.find(".P-detailNote")
            };
            app.common.toggleLoading(0);
            this.bindEvent();
            this.getData();
        }
        ,bindEvent:function(){
            var me = this;
            this.doms.showBtn.on("click",function(){
                me.showDetail();
            });
            this.$el.find(".P-detailCon div[data-act]").on("click",function(){
                var target = $(this);
                me.eventHandler(
                    target.attr("data-act")
                    ,target
                );
            });
        }
        ,eventHandler: function(act){
            if (app.common.isFunc(this[act])) {
                this[act]();
            } else {
                console.log(act);
            }
        }
        ,showDetail: function() {
            if (!this.showed) {
                this.doms.showBtn.attr({
                    "data-status":1
                    ,"data-adorn":""
                });
                this.doms.note.html(
                    this.data.productDetail.details
                )
                .attr("data-status",1);
                this.showed = true;
            }
            return this;
        }
        /**
         * 获取数据
         * @return {Undefined} 无返回值
         */
        ,getData: function(){
            if (this.req) {
                app.dc.abort(this.req);
            }
            this.req = app.dc.get(
                "/detail"
                ,{"id":345}
                ,this
            );
        }
        /**
         * 数据请求响应函数
         * @param  {Object}    err  错误信息
         * @param  {Object}    data 业务数据
         * @return {Undefined}      无返回值
         */
        ,onData: function(err, data) {
            this.req = null;
            this.setData(data);
        }
        /**
         * 设置模块数据
         * @param {Object} data 原始数据
         */
        ,setData: function(data) {
            this.data = data;
            document.title = this.data.productName + " - 爱水果";
            this.render();
        }
        /**
         * 渲染函数
         * @return {Object} 模块实例
         */
        ,render: function() {
            var good_html = template.render(goods_info_tpl, this.data);
            this.doms.goods.append(good_html);

            this.data.productImages.forEach(function(item){
                item.url = cdn_host+item.url
            });

            // this.data.productImages = this.data.productImages.concat(this.data.productImages);

            this.create(
                "carousel"
                ,carousel
                ,{
                    "target":this.doms.swiper
                    ,"enableCtrl":false
                    ,"data":this.data.productImages
                    ,"cycle":false
                }
            );

            return this;
        }
        ,onItemTap: function(ev) {
            console.log(ev);
            console.log("done!");
            return false;
        }
    }
);

module.exports = DetailPage;