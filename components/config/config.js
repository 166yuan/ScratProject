"use strict";

var common = require("common");

/**
 * 默认配置
 * @type {Object}
 */
var CONFIG = {
    // 生产环境
    "name":"微信商城"
    ,"debug":true
    ,"data":{
        "ds":["videos","channel",{"name":"search","config":{"def_cache_time":21600000,"min_cache_time": 21600000}}]
        // ,"host":"gjvimini.test.uae.uc.cn"
        ,"points":{
            "/compact":"/interface/compact.php"
        }
        // ,"jsonp_callback":"dc_jsonp"
        // ,"dataType":"jsonp"
        ,"uri_map": {
            // 首页
            "/home": {
                uri:"/moke/home"
                ,ds:"channel"
            }
            ,"/detail": {
                uri:"http://backend.pt.wxpai.cn/v1/ecom/products/get_product?cus_code=100034&product_id={id}"
                ,ds:"channel"
                ,resolve:"replace"
            }
        }
    }
    ,"defPage":"home"
    //导航栏配置
    ,"nav": [
        {
            "type": "channel",
            "go": "signin",
            "name": "signin",
            "text": "签到"
        }
        ,{
            "type": "channel",
            "go": "profile",
            "name": "profile",
            "text": "积分"
        }
        ,{
            "type": "channel",
            "go": "cate",
            "name": "cate",
            "text": "分类"
        }
        ,{
            "type": "channel",
            "go": "my",
            "name": "my",
            "text": "我的"
        }
    ]
    // 导航栏浮动
    ,"navFloat":1
    // 友情站点
    ,'feedback':'#'
    ,"cdn_host":"http://fs.wxpai.cn/"
};

window.__APP_CONFIG = CONFIG;

module.exports = function (keys) {
    if (keys && (common.isArray(keys) || common.isString(keys))) {
        if (common.isString(keys)) {
            keys = keys.split(".");
        }
        var re = CONFIG[keys.shift()];
        while (keys.length) {
            re = re[keys.shift()];
            if (!re) {
                keys = [];
            }
        }
        keys = null;
        return re;
    }
    return null;
};