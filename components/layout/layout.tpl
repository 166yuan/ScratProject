<header class="C-layoutHeader" data-area="head">
    <nav>
        <ul><% for(var i = 0;i<data.items.length;i++){ var tmp = data.items[i],url = tmp.go; %><li data-type="<%=(tmp.type)%>" data-go="<%=(tmp.go)%>" data-p="<%=(tmp.p || '')%>" data-name="<%=(tmp.name || tmp.go)%>" data-action="nav">
            <a href="#!/<%=url%>"><%=(tmp.text || tmp.name || tmp.go)%></a>
        </li><% } %></ul>
    </nav>
</header>
<header class="C-layoutMinHeader" data-area="minHead">
    <div class="C-layoutMinHeaderBack" data-action="back"></div>
    <div class="C-layoutMinHeaderTitle"><p></p></div>
    <div class="C-layoutBgImg C-layoutMinHeaderHome" data-action="home"></div>
</header>

<section class="C-layoutMain" data-area="main" id="main"></section>

<div class="C-layoutToTop"></div>