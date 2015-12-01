'use strict';

var container = require("container");
var tpl = __inline('carousel.tpl');
var template = require('template');

/**
 * 要监听的事件
 * @type {String}
 */
var EVENTS = "touchstart touchmove touchend touchcancel webkitTransitionEnd";
/**
 * 判断点击或滚动用的触摸间隔时间
 * @type {Int}
 */
var TIME_LIMIT = 250;
/**
 * 判断点击或滚动时可以容忍的触摸偏移
 * @type {Int}
 */
var CLICK_LIMIT = (window.devicePixelRatio > 1 ? 40 : 20);

var Carousel = container.extend(
    function Carousel (conf) {
        conf = $.extend(
            {
                // 滑动类型，现在只支持横向滚动
                type: 'slide',
                // 自动切换,
                cycle: 1,
                // 自动切换的间隔时间,
                delay: 3000,
                // 结构构建函数，预留字段，暂时没用,
                builder: null,
                // 动画执行时间,
                speed: 300,
                // 滚动方向，暂时只支持horizontal，其他类型需要的时候再扩展
                // horizontal, vertical , top, left, right, bottom,
                dir: 'horizontal',
                cls: 'M-carousel',
                // 要用到的样式,
                mCls: {
                    dotAct: 'act'
                },
                // 显示副标题,
                showSubTitle: 0,
                // 切换临界点，0.01~1，越小越灵敏,
                dPoint: 0.2,
                // 回调函数的作用域,
                context: null,
                // 列表节点名称,
                listName: 'ul',
                // 循环容器的节点名称,
                itemName: 'li',
                // 允许显示控制按钮,
                enableCtrl: 1,
                // 允许显示数量表示的圆点,
                enableDot: 1,
                // ,'stat':-1
                // 点击时的回调函数,
                onTap: null,
                // 拖动前的回调,
                onBeforeDrag: null,
                // 拖动后的回调,
                onAfterDrag: null,
                data: null
            },
            conf
        );

        this.type = conf.type;

        // 0 - hide, 1 - show, -1 - auto
        // 滚动的次数，用来就算最终要滚的数值
        this.stat = +conf.stat;
        this.stat = isNaN(this.stat) ? 0 : this.stat;

        // 上一次滚的次数
        this.last_stat = 0;

        // 滚动方向
        this.dir = conf.dir;

        // 计时器索引
        this.timer = null;

        // 模块状态
        this.ready = 0;

        // 要用到的dom对象集合对象
        this.doms = {};

        // 模块数据
        this.data = {};

        this.pData = null;

        // 拖动时的数据对象
        this.tData = null;

        Carousel.master(this, null, [conf]);
        // this.init();
    },
    {
        /**
         * 初始化
         * @return {Object} 模块实例
         */
        init: function () {
            Carousel.master(this, 'init');
            if (!this.ready) {
                var conf = this.config;

                if (conf.data) {
                    this.setData(conf.data);
                }

                // 主容器
                var main = this.$el;
                this.doms = {
                    main: main,
                    // 列表,
                    list: main.find(conf.listName + '[data-type="list"]'),
                    // 显示的对象,
                    items: main.find(conf.itemName + '[data-type="item"]')
                };
                // 上一个下一个控制对象
                this.doms.next = main.find('*[data-type="next"]');
                this.doms.prev = main.find('*[data-type="prev"]');

                var hideCtrl = !conf.enableCtrl || !this.pData || this.pData.length <= 1;
                if (this.doms.next && hideCtrl) {
                    this.doms.next[hideCtrl ? "hide" : "show"]();
                    this.doms.prev[hideCtrl ? "hide" : "show"]();
                }

                if (conf.enableDot) {
                    // 点点点
                    this.doms.dots = main.find('*[data-type="dot"]');
                }

                // 动画执行时的目标dom对象
                this.doms.tEl = this.doms.list[0];

                // 目标对象上的样式
                this.style = this.doms.tEl.style;

                // 初始化动画设定
                if (!this.style.webkitTransform) {
                    this.style.webkitTransform = 'translate3d(0,0,0)';
                }
                this.style.webkitTransitionDuration = this.config.speed + 'ms';

                this.data = {
                    currentX: 0,
                    currentY: 0,
                    width: this.doms.list.width(),
                    height: this.doms.list.height(),
                    len: this.doms.items.length
                };

                this.data.max = 0 - (this.data.width * (this.data.len - 1));
                this.data.dPoint = Math.ceil(this.data.width * conf.dPoint);

                this.bindEvent();

                if (conf.stat === -1) {
                    this.last_stat = this.stat;
                    this.initStat(1);
                }
                this.ready = 1;
                if (conf.cycle) {
                    this.cycle();
                }
            }
            return this;
        },
        /**
         * 事件绑定
         * @return {Object} 模块实例
         */
        bindEvent: function () {
            if (!this.ready) {
                var me = this;
                this.doms.list.bind(EVENTS, function (ev) {
                    me.eventHandler(ev);
                });
                if (this.config.enableCtrl) {
                    /*this.doms.next = main.find('*[data-type="next"]');
                    this.doms.prev = main.find('*[data-type="prev"]');*/
                    this.on({
                        'click *[data-type="next"]':function () {
                            me.next();
                        },
                        'click *[data-type="prev"]':function () {
                            me.prev();
                        }
                    });
                }
            }
            return this;
        },
        /**
         * 解除事件绑定
         * @return {Undefined} 无返回值
         */
        unbindEvent: function () {
            this.doms.list.unbind(EVENTS);
            if (this.config.enableCtrl) {
                this.off();
            }
            this.ready = 0;
        },
        /**
         * 事件处理函数
         * @param  {Object}    ev 触摸事件对象
         * @return {Undefined}    无返回值
         */
        eventHandler: function (ev) {
            switch (ev.type) {
                case 'webkitTransitionEnd':
                    // 动画执行完
                    if (!this.tData && ev.target === this.doms.list) {
                        this.initStat();
                    }
                    if (this.config.cycle && !this.timer) {
                        this.cycle();
                    }
                    break;

                case 'touchstart':
                    // 开始点击
                    if (ev.touches.length > 1) {
                        return;
                    }
                    this.onStart(ev);
                    break;

                case 'touchmove':
                    // 点完正跑
                    this.onMove(ev);
                    break;

                case 'touchcancel':
                case 'touchend':
                    // 点完
                    this.onEnd(ev);
                    break;
            }
        },
        /**
         * 获取目标对象上的css transform的数值
         * @param  {Object} tag 目标对象
         * @return {Object}     目标对象上transform数值对象
         */
        getTranslate: function (tag) {
            var css = window.getComputedStyle(tag || this.doms.tEl).webkitTransform;
            css = css.substring(7, css.length - 1).split(',');
            return {
                x: parseFloat(css[4]) || 0,
                y: parseFloat(css[5]) || 0
            };
        },
        /**
         * 设置动画参数
         * @param  {Bool}   noEvent 不执行回调
         * @return {Object}         模块实例
         */
        initStat: function (noEvent) {
            var dx, dy;
            if (arguments.length === 2) {
                dx = arguments[0];
                dy = arguments[1];
            } else {
                var val = this.getTranslate();
                dx = val.x;
                dy = val.y;
            }
            this.data.currentX = dx;
            this.data.currentY = dy;

            if (this.dir === 'horizontal') {
                this.stat = Math.floor(Math.abs(dx) / this.data.width);
            } else {
                this.stat = Math.floor(Math.abs(dy) / this.data.height);
            }

            if (!noEvent && this.last_stat !== this.stat) {
                this.last_stat = this.stat;
                if (this.config.afterDrag) {
                    this.config.afterDrag.call(
                        this.config.context || this
                    );
                }
            }
            return this;
        },
        /**
         * 滚
         * @param  {Int}    slideX x轴偏移值
         * @param  {Int}    slideY y轴便宜值
         * @return {Object}        模块实例
         */
        slide: function (slideX, slideY/*, info*/) {
            if (this.config.cycle) {
                this.stop();
            }
            var dx = 0,
                dy = 0,
                tmp,
                tmp2,
                keyType,
            // 是否是横着滚,
                horizontal = this.dir === 'horizontal';

            if (horizontal) {
                tmp = slideX;
            } else {
                tmp = slideY;
            }
            keyType = horizontal ? 'width' : 'height';
            tmp2 = this.data[keyType];
            if (!tmp2) {
                tmp2 = this.data[keyType] = this.doms.list[keyType]();
            }
            // 本次滚动的比例
            tmp = tmp % tmp2 / tmp2;

            if (Math.abs(tmp) >= this.config.dPoint) {
                // 本次滚动的比例超过临界
                if (tmp > 0) {
                    this.stat++;
                } else {
                    this.stat--;
                }
                if (Math.abs(this.stat) === this.data.len) {
                    this.stat = 0;
                } else if (this.stat > 0) {
                    this.stat = this.stat - this.data.len;
                }
            }
            dx = this.data.width * this.stat;

            var val = this.getTranslate();
            if (this.config.enableDot) {
                // 有小点点
                tmp = this.config.mCls.dotAct;
                this.doms.dots.removeClass(
                        tmp
                    ).eq(Math.abs(this.stat))
                    .addClass(tmp);
            }

            if (dx === val.x && dy === val.y) {
                this.initStat(dx, dy);
            } else {
                this.style.webkitTransform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
            }

            return this;
        },
        /**
         * 触摸开始的处理函数
         * @param  {Object}    ev 触摸事件
         * @return {Undefined}    无返回值
         */
        onStart: function (ev) {
            if (this.config.cycle) {
                this.stop();
            }
            var val = this.getTranslate();
            this.tData = {
                id: ev.touches[0].identifier,
                timeStamp: ev.timeStamp,
                pageX: ev.touches[0].pageX,
                pageY: ev.touches[0].pageY,
                move1: null,
                move2: null,
                stat: 'start',
                last: this.style.webkitTransform,
                // 开始滚动时的X坐标,
                baseX: val.x,
                // 开始滚动时的y坐标,
                baseY: val.y
            };
        },
        /**
         * 触摸移动的处理函数
         * @param  {Object}    ev 触摸事件
         * @return {Undefined}    无返回值
         */
        onMove: function (ev) {
            var s = this.tData;
            if (!s) {
                // 没滚动初始数据
                return;
            }
            var t = null;
            for (var i = 0; i < ev.changedTouches.length; i++) {
                if (ev.changedTouches[i].identifier === s.id) {
                    // 没换手 orz
                    t = ev.changedTouches[i];
                    break;
                }
            }
            if (!t) {
                return;
            }

            // 防止一些浏览器的默认行为，比如切屏什么的
            ev.preventDefault();

            // 移动的数值
            if (!s.move1 || s.move1.ts + 50 < ev.timeStamp) {
                s.move2 = s.move1;
                s.move1 = {'ts': ev.timeStamp, 'x': t.pageX, 'y': t.pageY};
            }
            if (s.stat === 'start') {
                if (this.config.onBeforeDrag) {
                    this.config.onBeforeDrag.call(
                        this.config.context || this
                    );
                }
                s.stat = 'move';
            }

            this.dx = t.pageX - s.pageX;
            this.dy = t.pageY - s.pageY;
            var dx = 0, dy = 0;

            if (this.dir === 'horizontal') {
                dx = Math.min(this.data.width, Math.max(this.dx, -this.data.width)) + s.baseX;
                dx = dx > 0 ? 0 : dx < this.data.max ? this.data.max : dx;
            } else {
                dy = Math.min(this.data.height, Math.max(this.dy, -this.data.height)) + s.baseY;
            }

            this.style.webkitTransform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
        },
        /**
         * 滚完
         * @param  {Object}    ev 触摸事件对象
         * @return {Undefined}    无返回值
         */
        onEnd: function (ev) {
            var s = this.tData;
            if (!s) {
                return;
            }
            var t = null;
            for (var i = 0; i < ev.changedTouches.length; i++) {
                if (ev.changedTouches[i].identifier === s.id) {
                    t = ev.changedTouches[i];
                    break;
                }
            }
            if (!t) {
                return;
            }

            this.tData = null;

            // 更新最后的移动
            if (!s.move2) {
                s.move2 = s.move1;
            }
            s.move1 = {'ts': ev.timeStamp, 'x': t.pageX, 'y': t.pageY};

            // 判断滑动
            var slideX = 0, slideY = 0;
            s.deltaTime = ev.timeStamp - s.timeStamp;
            if (s.deltaTime < TIME_LIMIT) {
                slideX = Math.abs(this.dx || 0) > CLICK_LIMIT ? this.dx : 0;
                slideY = Math.abs(this.dy || 0) > CLICK_LIMIT ? this.dy : 0;
                if (slideX === 0 && slideY === 0) {
                    // 点击
                    this.style.webkitTransform = s.last;
                    var index = Math.abs(this.stat), me = this;
                    setTimeout(function () {
                        me.fire('carouselTap', {
                                ev: ev,
                                el: me.doms.items[index],
                                data: me.data,
                                itemData: me.pData[index],
                                index: index
                            }
                        );
                    }, 100);

                    return false;
                }
            }
            if (Math.abs(this.dx) > this.data.width / 2) {
                slideX = this.dx;
            }
            if (Math.abs(this.dy) > this.data.height / 2) {
                slideY = this.dy;
            }
            // 滚
            this.slide(slideX, slideY, s);
            this.dx = 0;
            this.dy = 0;
        },
        /**
         * 停止自动切换
         * @return {Object} 模块实例
         */
        stop: function () {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = 0;
            return this;
        },
        /**
         * 自动切换
         * @return {Object} 模块实例
         */
        cycle: function () {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            var me = this;
            this.timer = setTimeout(function () {
                me.timer = 0;
                me.next();
            }, this.config.delay);
            return this;
        },
        /**
         * 执行一次滚动
         * @param  {Bool}   status 滚动方向
         * @return {Object}        模块实例
         */
        doScroll: function (status) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.slide(
                (status ? -this.data.width : this.data.width) * this.config.dPoint,
                (status ? -this.data.height : this.data.height) * this.config.dPoint
            );
            return this;
        },
        /**
         * 下一个
         * @return {Object} 模块实例
         */
        next: function () {
            this.doScroll(1);
            return this;
        },
        /**
         * 上一个
         * @return {Object} 模块实例
         */
        prev: function () {
            this.doScroll(0);
            return this;
        },
        /**
         * 销毁
         * @return {Undefined} 无返回值
         */
        destroy: function () {
            this.stop();
            this.doms.list.removeAttr('style');
            this.doms.dots
                .removeClass(this.config.mCls.dotAct)
                .eq(0).addClass(this.config.mCls.dotAct);
            this.unbindEvent();
            this.data = this.doms = this.tData = this.style = null;
        },
        setData: function (data) {
            if (data) {
                this.pData = data;
                this.$el.append(
                    template.render(tpl, {
                        items: this.pData,
                        showSubTitle: this.config.showSubTitle
                    })
                );
            }
        }
    }
);

module.exports = Carousel;