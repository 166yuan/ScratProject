// toTop的控制交给main, 业务模块使用的置顶功能
var $toTop = $('.G-toTop');

var sideBar = {
    init: function() {
        $toTop.hide();
        this.show = true;
        this.scrollGoTop();
        $toTop[0].ontouchend = $toTop[0].onclick = function(e) {
            e.preventDefault();
            for (var yoff = window.pageYOffset, yoff25 = - yoff / 25, index = 1; 25 >= index; index++) (function(index) {
                window.setTimeout(function() {
                        scrollTo(0, index * yoff25 + yoff);
                    }, 10 * index);
            })(index);
        };
        window.addEventListener("touchend",
            function() {
                sideBar.scrollGoTop();
            }, false);
        window.addEventListener("scroll",
            function() {
                sideBar.scrollGoTop();
            }, false);
    },
    scrollGoTop: function() {
        var scrollTopH = document.documentElement.scrollTop || document.body.scrollTop,
            winH = $(window).height();

        if (scrollTopH >= winH / 2 + 50) {
            $toTop.show();
        } else {
            $toTop.hide();
        }
    }
};

sideBar.init();