<ul data-type="list">
    <% for(var i = 0; i < data.items.length; i++){
    var item = data.items[i];%>
    <li data-type="item" class="G-videoLoading">
        <div class="M-carouselSubTitle"><%=(data.showSubTitle && item.subtitle ? ("<p>"+item.subtitle +"</p>"): "")%></div>
        <img onerror="this.style.display='none';" onload="this.style.display='block';" src="<%=item.url%>">
    </li>
    <%}%>
</ul>
<div class="M-carouselControler">
    <div class="ui-carousel-prev" data-type="prev">&lsaquo;</div>
    <em>
        <%for(var i = 0; i < data.items.length; i++){%>
        <i class="<%= (i ? '' : 'act') %>" data-type="dot"></i>
        <%}%>
    </em>
    <div class="ui-carousel-next" data-type="next">&rsaquo;</div>
</div>