(function(win){
    /**
     * 默认配置
     * @type {Object}
     */
    win.__APP_CONFIG = {
        // 生产环境
        "name":"微信商城"
        ,"debug":true
        ,"data":{
            "ds":["videos","channel",{"name":"search","config":{"def_cache_time":21600000,"min_cache_time": 21600000}}]
            // ,"host":"gjvimini.test.uae.uc.cn"
            ,"points":{
                "/compact":"/interface/compact.php"
            }
            ,"jsonp_callback":"dc_jsonp"
            ,"dataType":"jsonp"
        }
        ,"defPage":"home"
        //导航栏配置
        ,"nav": [
            {
                "type": "channel",
                "go": "movie",
                "name": "Movie"
            },
            {
                "type": "cat",
                "go": "Trailer",
                "name": "Trailer"
            }
        ]
        // 导航栏浮动
        ,"navFloat":1
    };
})(window);