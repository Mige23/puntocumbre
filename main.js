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
  function initHeroMotion(){
    var hero=document.getElementById("hero");if(!hero)return;
    var frame=0,targetX=0,targetY=0,currentX=0,currentY=0;
    function render(){currentX+=(targetX-currentX)*.08;currentY+=(targetY-currentY)*.08;hero.style.setProperty("--hero-x",currentX.toFixed(2)+"px");hero.style.setProperty("--hero-y",currentY.toFixed(2)+"px");if(Math.abs(targetX-currentX)>.05||Math.abs(targetY-currentY)>.05)frame=requestAnimationFrame(render);else frame=0}
    hero.addEventListener("pointermove",function(e){if(window.innerWidth<851)return;var r=hero.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*-16;targetY=((e.clientY-r.top)/r.height-.5)*-10;if(!frame)frame=requestAnimationFrame(render)});
    hero.addEventListener("pointerleave",function(){targetX=0;targetY=0;if(!frame)frame=requestAnimationFrame(render)});
    window.addEventListener("scroll",function(){var y=Math.min(window.scrollY,hero.offsetHeight);hero.style.setProperty("--hero-scroll",(y*.09).toFixed(1)+"px")},{passive:true});
  }
  function initYear(){document.querySelectorAll("#year").forEach(function(el){el.textContent=new Date().getFullYear()})}
  document.addEventListener("DOMContentLoaded",function(){safe(initMenu,"menú");safe(initLightbox,"galería");safe(initUploads,"subida de fotos");safe(initFilters,"filtros");safe(initHeroMotion,"hero premium");safe(initYear,"fecha")});
})();
