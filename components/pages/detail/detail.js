"use strict";
var Detail = require("views/detail");
var DetailPage;
// 最后的位置
// var lastPosition = 0;
// var pageTitle;
exports.show = function (app, boot) {
    // if (!pageTitle) {
    //     pageTitle =  " - " + app.getConf("name");
    // }
    // document.title = pageTitle;
    // app.layout.onPageChange();
    if (!DetailPage) {
        DetailPage = app.core.create("detail", Detail, {
            target: app.mainCon,
            routerTs: boot.routerTs
        });
    } else {
        DetailPage.show();
    }
    
    document.body.scrollTop = 0;
};

exports.hide = function () {
    // lastPosition = document.body.scrollTop;
    if (DetailPage) {
        DetailPage.hide();
    }
};