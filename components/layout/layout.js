'use strict';

var app = require('core');
var tpl = __inline('layout.tpl');
var config = require('config');
var template = require('template');
var SCRAT_HASH = window.require.options.hash;
var lKey = '__HONEY_LAYOUT_';
var hKey = '__HONEY_HOTWORDS_';
var LAYOUT = JSON.parse(localStorage.getItem(lKey));
var uiproxy = require("uiproxy");

if (LAYOUT && LAYOUT.hash !== SCRAT_HASH) {
    LAYOUT = null;
} else {
    LAYOUT = LAYOUT && LAYOUT.tpl || null;
}
if (!LAYOUT) {
    LAYOUT = template.render(
        tpl,
        {
            items: config('nav'),
            feedback: config('feedback')
        }
    );
    localStorage.setItem(lKey, JSON.stringify({
        hash: SCRAT_HASH,
        tpl: LAYOUT
    }));
}

/**
 * 主体结构对象
 * @type {Object}
 */
LAYOUT = $(LAYOUT);
var tmp;

/**
 * 结构主要区域映射表
 * @type {Object}
 */
var LAYOUT_MAP = {};
for (var i = 0; i < LAYOUT.length; i++) {
    tmp = LAYOUT.eq(i);
    LAYOUT_MAP[tmp.attr('data-area')] = tmp;
}

LAYOUT_MAP.minTitle = LAYOUT_MAP.minHead.find('.C-layoutMinHeaderTitle p');

/**
 * 是否已经渲染过
 * @type {Boolean}
 */
var RENDERED = false;

/**
 * 分类或栏目匹配正则
 * @type {RegExp}
 */
var CATE_REG = /^#(?:[!\/]+)?(\w+)(\?(\w+)\=([\w\s]+))?/;

var CATE;

var NAV_ITEMS = {};

var ITEMS;

var EX_PAGE = {
    detail: 1,
    search: 1,
    topic: 1
};
tmp = null;

var hotWordsCon = LAYOUT.find('.search-tip'),
    hotWordList = hotWordsCon.find('ul'),
    keyInput = LAYOUT.find('.G-input');

/**
 * 获取当前页面(分类)
 * @return {String} 分类名称
 */
function getCate () {
    var cat = window.location.hash.match(CATE_REG);
    if (cat) {
        cat = cat[1];
    }
    if (!cat) {
        cat = config('defPage');
    }
    cat = cat.toLowerCase();
    cat = app.fixPageName(cat);
    return cat;
}
exports.getCate = getCate;

function getRHW () {
    var tmp = Math.floor(Math.random() * hotwords.length);
    // 索引范围不能超过列表
    tmp = Math.min(hotwords.length - 1, tmp);
    tmp = hotwords[tmp];
    return tmp.title;
}

/**
 * 布局事件处理函数
 * @param  {Object}    ev 事件对象
 * @return {Undefined}    无返回值
 */
function eventHandler (ev) {
    var el = $(ev.currentTarget);
    var wahhh, type = el.attr('data-action');
    switch (type) {
        // 导航按钮事件
        case 'nav':
            wahhh = {
                pos: (el.attr('data-name') || el.attr('data-go')) + '-nav-btn',
                region: 'header_navigator'
            };
        break;

        // 后退
        case 'back':
            wahhh = {
                pos: 'return-btn',
                region: 'header_back'
            };
            history.back();
        break;

        // 搜索
        case 'search':
            wahhh = {
                pos: 'search-btn',
                region: 'header_search'
            };
            app.common.storage.set('kwtype', 'input');
            app.common.goSearch('q=' + ($.trim(keyInput.val()) || keyInput.attr('placeholder')));
        break;

        // 返回首页
        case 'home':
            wahhh = {
                pos: 'home',
                region: 'header_home'
            };
        break;

        // 回到顶部
        case 'toTop':
            document.body.scrollTop = 0;
        break;
    }
    if (wahhh) {
        wahhh.clkPage = '/' + getCate();
        wahhh.type = 'click';
        app.core.wahhh(wahhh);
    }
}

function toggleHeader (status) {
    // LAYOUT_MAP.head.toggleClass('C-layoutShow', !status);
    // LAYOUT_MAP.minHead.toggleClass('C-layoutMinShow', status);
}

function buildHotWords (data) {
    
}

var uie;
/**
 * 界面渲染方法
 * @return {Boolean} 操作结果
 */
exports.render = function () {
    CATE = getCate();
    if (!RENDERED) {
        $('.wtff').remove();
        $('body').addClass('C-layout').append(LAYOUT);

        ITEMS = $('.C-layoutHeader nav li');
        uie = uiproxy(LAYOUT);

        // 导航事件
        uie.on({
            'click .C-layoutHeader nav li':eventHandler,
            'click .C-layoutHeaderDownload,.C-layoutMinHeaderBack,.srh-btn,.C-layoutMinHeaderHome,.search-tip-btn,.search-tip-list li,.toTop':eventHandler
        });

        keyInput.on('blur focus', eventHandler);

        for (var i = 0; i < ITEMS.length; i++) {
            NAV_ITEMS[ITEMS.eq(i).attr('data-name').toLowerCase()] = ITEMS.eq(i);
        }
        toggleHeader(!!EX_PAGE[CATE]);

        if (NAV_ITEMS[CATE]) {
            NAV_ITEMS[CATE].addClass('act');
        }

        $('.C-layoutHeaderDownload').toggle(false);

        var $toTop = $(".C-layoutToTop");

        $toTop.hide();
        var show = !0;

        function scrollGoTop() {
            var a = document.documentElement.scrollTop || document.body.scrollTop,
                b = $(window).height();
                a >= Math.ceil(b / 4) + 50 ? $toTop.show() : $toTop.hide();
        }

        
        scrollGoTop();
        $toTop[0].ontouchend = $toTop[0].onclick = function(a) {
            a.preventDefault();
            for (var b = window.pageYOffset, c = -b / 25, a = 1; 25 >= a; a++){
                (function(a) {
                    window.setTimeout(function() {
                            scrollTo(0, a * c + b);
                        }, 10 * a);
                })(a);
            }
        };

        

        window.addEventListener("touchend",
            function() {
                scrollGoTop()
            }, !1);
        window.addEventListener(
            "scroll",
            function() {
                scrollGoTop()
            }
            ,!1
        );


        RENDERED = true;
    }
    return RENDERED;
};

/**
 * 获取某个指定的区域
 * @param  {String} area 区域名称
 * @return {Object}      区域对象
 */
exports.get = function (area) {
    return LAYOUT_MAP[area] || null;
};

/**
 * 获取主要内容添加区域
 * @return {Object} 区域对象
 */
exports.getMain = function () {
    return LAYOUT_MAP.main;
};

/**
 * 页面切换时的响应函数
 */
exports.onPageChange = function () {
    var tmp = getCate();
    if (tmp !== CATE) {
        CATE = tmp;
        if (!EX_PAGE[tmp]) {
            ITEMS.removeClass('act');
            if (NAV_ITEMS[CATE]) {
                NAV_ITEMS[CATE].addClass('act');
            }
        }
        toggleHeader(!!EX_PAGE[CATE]);
    }
};

exports.setMinTitle = function (title) {
    return LAYOUT_MAP.minTitle.text(title);
};
