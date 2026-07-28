(function(){
  "use strict";
  function safe(fn,name){try{fn()}catch(error){console.warn("Punto Cumbre · "+name,error)}}
  function initMenu(){
    var toggle=document.querySelector(".menu-toggle"),nav=document.querySelector(".nav");
    if(!toggle||!nav)return;
    toggle.addEventListener("click",function(){var open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open))});
    nav.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){nav.classList.remove("open");toggle.setAttribute("aria-expanded","false")})});
  }
  function initLightbox(){
    var box=document.getElementById("lightbox");if(!box)return;
    var img=box.querySelector("img");
    document.getElementById("gallery-grid").addEventListener("click",function(e){var item=e.target.closest(".gallery-item");if(!item)return;img.src=item.dataset.src||item.querySelector("img").src;box.showModal()});
    box.querySelector("button").addEventListener("click",function(){box.close()});
    box.addEventListener("click",function(e){if(e.target===box)box.close()});
  }
  function initUploads(){
    var input=document.getElementById("photo-upload"),grid=document.getElementById("gallery-grid");if(!input||!grid)return;
    function addPhoto(src){var button=document.createElement("button");button.className="gallery-item uploaded";button.dataset.src=src;button.innerHTML='<img alt="Foto subida desde este dispositivo"><span>Tu foto</span>';button.querySelector("img").src=src;grid.appendChild(button)}
    var saved=[];try{saved=JSON.parse(localStorage.getItem("puntoCumbrePhotos")||"[]")}catch(e){} saved.forEach(addPhoto);
    input.addEventListener("change",function(){Array.from(input.files).slice(0,6).forEach(function(file){if(!file.type.startsWith("image/"))return;var reader=new FileReader();reader.onload=function(){var all=[];try{all=JSON.parse(localStorage.getItem("puntoCumbrePhotos")||"[]")}catch(e){};all.push(reader.result);try{localStorage.setItem("puntoCumbrePhotos",JSON.stringify(all.slice(-6)))}catch(e){}addPhoto(reader.result)};reader.readAsDataURL(file)})});
  }
  function initFilters(){
    var controls=document.querySelector(".menu-filter");if(!controls)return;
    controls.addEventListener("click",function(e){var button=e.target.closest("button");if(!button)return;controls.querySelectorAll("button").forEach(function(b){b.classList.remove("active")});button.classList.add("active");var filter=button.dataset.filter;document.querySelectorAll(".menu-category").forEach(function(section){section.classList.toggle("hidden",filter!=="all"&&section.dataset.category!==filter)})});
  }
  function initGallerySlider(){
    var track=document.getElementById("gallery-grid"),dots=document.getElementById("gallery-dots");if(!track||!dots)return;
    var slider=track.closest(".gallery-slider"),slides=Array.from(track.querySelectorAll(".gallery-item")),prev=document.querySelector(".gallery-prev"),next=document.querySelector(".gallery-next"),index=0,timer;
    function go(newIndex){
      index=(newIndex+slides.length)%slides.length;
      track.scrollTo({left:slides[index].offsetLeft-track.offsetLeft,behavior:"smooth"});
      dots.querySelectorAll("button").forEach(function(dot,i){dot.classList.toggle("active",i===index);dot.setAttribute("aria-current",i===index?"true":"false")});
    }
    function pause(){clearInterval(timer)}
    function restart(){pause();timer=setInterval(function(){go(index+1)},4000)}
    slides.forEach(function(slide,i){
      var dot=document.createElement("button");dot.type="button";dot.setAttribute("aria-label","Ver foto "+(i+1));dot.addEventListener("click",function(){go(i);restart()});dots.appendChild(dot);
    });
    prev.addEventListener("click",function(){go(index-1);restart()});
    next.addEventListener("click",function(){go(index+1);restart()});
    track.addEventListener("scroll",function(){clearTimeout(track._sliderScroll);track._sliderScroll=setTimeout(function(){
      var closest=0,distance=Infinity;slides.forEach(function(slide,i){var current=Math.abs(slide.offsetLeft-track.offsetLeft-track.scrollLeft);if(current<distance){distance=current;closest=i}});index=closest;go(index);
    },120)},{passive:true});
    slider.addEventListener("mouseenter",pause);
    slider.addEventListener("mouseleave",restart);
    slider.addEventListener("touchstart",pause,{passive:true});
    slider.addEventListener("touchend",restart,{passive:true});
    document.addEventListener("visibilitychange",function(){if(document.hidden)pause();else restart()});
    go(0);restart();
  }
  function initWhatsApp(){
    var button=document.getElementById("whatsapp-button");if(!button)return;
    var items=Array.from(document.querySelectorAll(".menu-list article"));
    if(!items.length)return;
    var count=document.getElementById("whatsapp-count"),label=button.querySelector(".whatsapp-label");
    var summary=document.getElementById("cart-summary"),totalEl=document.getElementById("cart-total"),cancel=document.getElementById("cart-cancel");
    function money(value){return new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(value)}
    function update(){
      var selected=items.filter(function(item){return Number(item.dataset.qty)>0});
      var units=selected.reduce(function(sum,item){return sum+Number(item.dataset.qty)},0);
      var total=selected.reduce(function(sum,item){return sum+(Number(item.dataset.price)*Number(item.dataset.qty))},0);
      count.textContent=units;count.hidden=!units;
      label.textContent=units?"Enviar · "+money(total):"Elegí productos";
      summary.hidden=!units;totalEl.textContent=money(total);
      var text=selected.length
        ?"Hola Punto Cumbre, quisiera hacer este pedido:\n\n"+selected.map(function(item){
          var qty=Number(item.dataset.qty),price=Number(item.dataset.price);
          return "• "+qty+" x "+item.querySelector("h3").textContent.trim()+" — "+money(qty*price);
        }).join("\n")+"\n\nTotal estimado: "+money(total)+"\n\n¿Me confirman disponibilidad y precio final?"
        :"Hola Punto Cumbre, quisiera hacer una consulta sobre la carta.";
      button.href="https://wa.me/5493516864764?text="+encodeURIComponent(text);
    }
    function setQuantity(item,quantity){
      var qty=Math.max(0,quantity),value=item.querySelector(".quantity-value");
      item.dataset.qty=qty;value.textContent=qty;item.classList.toggle("selected",qty>0);
      item.querySelector(".quantity-minus").disabled=qty===0;
      update();
    }
    items.forEach(function(item){
      var side=document.createElement("div"),name=item.querySelector("h3").textContent.trim();
      item.dataset.qty="0";side.className="menu-item-actions";
      side.innerHTML=item.querySelector("b").outerHTML+'<div class="quantity-control"><button class="quantity-minus" type="button" disabled aria-label="Quitar una unidad de '+name+'">−</button><span class="quantity-value" aria-label="Cantidad">0</span><button class="quantity-plus" type="button" aria-label="Agregar una unidad de '+name+'">+</button></div>';
      item.querySelector("b").replaceWith(side);
      side.querySelector(".quantity-minus").addEventListener("click",function(){setQuantity(item,Number(item.dataset.qty)-1)});
      side.querySelector(".quantity-plus").addEventListener("click",function(){setQuantity(item,Number(item.dataset.qty)+1)});
    });
    cancel.addEventListener("click",function(){items.forEach(function(item){setQuantity(item,0)})});
    update();
  }
  function initHeroMotion(){
    var hero=document.getElementById("hero");if(!hero)return;
    var frame=0,targetX=0,targetY=0,currentX=0,currentY=0;
    function render(){currentX+=(targetX-currentX)*.08;currentY+=(targetY-currentY)*.08;hero.style.setProperty("--hero-x",currentX.toFixed(2)+"px");hero.style.setProperty("--hero-y",currentY.toFixed(2)+"px");if(Math.abs(targetX-currentX)>.05||Math.abs(targetY-currentY)>.05)frame=requestAnimationFrame(render);else frame=0}
    hero.addEventListener("pointermove",function(e){if(window.innerWidth<851)return;var r=hero.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*-16;targetY=((e.clientY-r.top)/r.height-.5)*-10;if(!frame)frame=requestAnimationFrame(render)});
    hero.addEventListener("pointerleave",function(){targetX=0;targetY=0;if(!frame)frame=requestAnimationFrame(render)});
    window.addEventListener("scroll",function(){var y=Math.min(window.scrollY,hero.offsetHeight);hero.style.setProperty("--hero-scroll",(y*.09).toFixed(1)+"px")},{passive:true});
  }
  function initYear(){document.querySelectorAll("#year").forEach(function(el){el.textContent=new Date().getFullYear()})}
  document.addEventListener("DOMContentLoaded",function(){safe(initMenu,"menú");safe(initLightbox,"galería");safe(initGallerySlider,"carrusel");safe(initUploads,"subida de fotos");safe(initFilters,"filtros");safe(initWhatsApp,"WhatsApp");safe(initHeroMotion,"hero premium");safe(initYear,"fecha")});
})();
