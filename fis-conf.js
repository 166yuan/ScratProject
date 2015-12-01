var meta = require("./package.json");

fis.config.set("modules.parser.less", "less");
fis.config.set("roadmap.ext.less", "css");

fis.config.merge({
    "name":"mobile"
    ,"version":meta.version
    // ,"project.exclude":meta.version
    // ,"urlPrefix":"/views"
    ,"project.exclude":"node_modules/**"
    ,"framework":{
        "cache": true
        ,"urlPattern": "/c/%s"
        // ,"combo": true
        ,"comboPattern": "/co??%s"
        ,"debug":true
        ,"alias":{
            'uiproxy': 'component_modules/zepto-event/1.0.0/zepto-event.js',
        }
    }
    ,"modules.optimizer.tpl":function(content){
        return content.replace(/<!--(?!\[)([\s\S]*?)(-->|$)/g,"");
    }
});

/*fis.config.get("roadmap.path").unshift({
    "reg":/^\/views\/(.*)$/
    ,"url":'${urlPrefix}/$1'
    ,"release":'/public/$1'
    ,"useSprite":true
    ,"isViews":true
});*/

fis.config.get("roadmap.path").unshift({
    "reg":/^\/server\/test\/(.*)$/
    ,"release":false
});

fis.config.get("roadmap.path").unshift({
    "reg":/^\/server\/node_modules\/(.*)$/
    ,"release":false
});

fis.config.get("roadmap.path").unshift({
    "reg":/^\/node_modules\/(.*)$/
    ,"release":false
});

fis.config.get("roadmap.path").unshift({
    "reg":/^\/init|package$/
    ,"release":false
});

// favicon.ico
fis.config.get("roadmap.path").unshift({
    "reg":/^\/views\/favicon.ico$/i
    ,"url":'${urlPrefix}/favicon.ico'
    ,"release":'/public/favicon.ico'
});

fis.config.get("roadmap.path").unshift({
    "reg":/^\/components\/(.*)\.(less|css)$/i
    ,"id":"${name}/${version}/$1.css"
    ,"isMod":true
    ,"useSprite":true
    ,"useHash":false
    ,"url":"${urlPrefix}/c/${name}/${version}/$1.$2"
    ,"release":"/public/c/${name}/${version}/$1.$2"
});

// fis.config.set('settings.optimizer.png-compressor.type', 'pngquant');