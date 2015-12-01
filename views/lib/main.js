__inline("./scrat.js");
// __inline("./config.js");
__inline("./zepto.js");
__inline("./tap.js");
// __inline('./totop.js');
require.config(__FRAMEWORK_CONFIG__);
require.async("boot", function (boot) {
    if(boot){
        boot();
    }
});