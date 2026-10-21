/* Persistent SVG geometry driven only by transient input length, never password text. */
(() => {
  'use strict';
  const input=document.getElementById('loginPassword'),image=document.querySelector('.gate-emblem');
  if(!input||!image)return;
  const NS='http://www.w3.org/2000/svg',reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=t=>Math.max(0,Math.min(1,t)),mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const color=(a,b,t)=>'#'+[0,2,4].map(i=>Math.round(mix(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),t)).toString(16).padStart(2,'0')).join('');
  const make=(tag,attributes={})=>{const el=document.createElementNS(NS,tag);for(const [key,value]of Object.entries(attributes))el.setAttribute(key,value);return el;};
  // Equal arc-length contour samples give both endpoints the same topology.
  // Every intermediate path is real interpolated geometry, not an opacity swap.
  function contour(svg,d,count=160){
    const path=make('path',{d,visibility:'hidden'});svg.append(path);
    const length=path.getTotalLength(),points=Array.from({length:count},(_,i)=>{const p=path.getPointAtLength(i/count*length);return [p.x,p.y];});path.remove();return points;
  }
  const ellipse=(angle)=>{const a=angle*Math.PI/180;return Array.from({length:160},(_,i)=>{const t=i/160*Math.PI*2,x=58*Math.cos(t),y=109*Math.sin(t);return [250+x*Math.cos(a)-y*Math.sin(a),337+x*Math.sin(a)+y*Math.cos(a)];});};
  function align(source,target){
    let best=Infinity,result=target;
    for(const direction of [1,-1])for(let shift=0;shift<target.length;shift++){
      let cost=0;for(let i=0;i<source.length;i+=4){const p=target[(shift+direction*i+target.length)%target.length];cost+=(p[0]-source[i][0])**2+(p[1]-source[i][1])**2;}
      if(cost<best){best=cost;result=source.map((_,i)=>target[(shift+direction*i+target.length)%target.length]);}
    }return result;
  }
  const leaf=(x,y,angle,size=1)=>{const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),p=(dx,dy)=>`${x+(dx*c-dy*s)*size} ${y+(dx*s+dy*c)*size}`;return `M${p(0,0)}C${p(-7,-8)} ${p(-5,-20)} ${p(0,-28)}C${p(7,-18)} ${p(8,-7)} ${p(0,0)}Z`;};
  async function init(){
    const response=await fetch(image.src);if(!response.ok)return;
    const documentSvg=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
    if(documentSvg.querySelector('parsererror'))return;
    const svg=document.importNode(documentSvg.documentElement,true);svg.classList.add('gate-emblem','morph-emblem');
    svg.setAttribute('aria-label','Yarmouk University emblem transforming into the Golden Jubilee emblem');svg.removeAttribute('aria-labelledby');
    const style=make('style');style.textContent='.morph-emblem *{animation:none!important}';svg.append(style);
    image.replaceWith(svg);
    const defs=svg.querySelector('defs');
    const materialStops=[];
    for(const [id,source]of [['fiveGold','101914'],['orbitGold','df393e'],['grainGold','4a9b45']]){
      const gold=make('linearGradient',{id,x1:'0%',y1:'0%',x2:'100%',y2:'100%'});
      for(const [offset,target]of [['0%','e6bf63'],['40%','ffe19a'],['75%','c5a059'],['100%','e4bb60']]){
        const stop=make('stop',{offset,'stop-color':'#'+source});gold.append(stop);materialStops.push({stop,source,target});
      }defs.append(gold);
    }
    const oldMotif=svg.querySelector('.motif'),oldOrbits=svg.querySelector('.orbits'),oldWheat=svg.querySelector('.wheat');
    const group=make('g',{'data-morph-geometry':''});oldMotif.before(group);oldMotif.remove();oldOrbits.remove();oldWheat.remove();
    const tracks=[];
    function track(from,to,attributes,options={}){
      const path=make('path',attributes);group.append(path);
      const source=Array.isArray(from)?from:contour(svg,from),target=align(source,contour(svg,to));
      tracks.push({path,source,target,...options});return path;
    }
    // Black silhouette becomes the filled 5. Its light internal opening contracts
    // into the 5's inner counter while the original red loops become Y and 0.
    track('M185 106L228 230H235L240 198H261L267 230H274L315 106L266 365L250 478L234 365Z',
      'M157 159H238V183H179L175 221C211 207 244 230 244 262C244 292 220 312 191 313L181 290C204 291 222 280 222 262C222 239 197 234 173 246L149 240Z',
      {fill:'#101914','data-piece':'five'},{kind:'five'});
    track('M214 254L250 448L286 254Z','M193 259L194 260L195 259Z',
      {fill:'#f8f5eb','data-piece':'counter'},{kind:'counter'});
    track(ellipse(-43),'M148 282H174L198 317L220 282H247L211 337V411H185V337Z',
      {fill:'#df393e','fill-opacity':0,stroke:'#df393e','stroke-width':4.5,'stroke-linejoin':'round','data-piece':'y'},{kind:'orbit'});
    track(ellipse(43),'M275 260H298V309C298 332 311 343 331 343C351 343 365 330 365 309V254H389V309C389 345 365 368 331 368C297 368 275 346 275 309Z',
      {fill:'#df393e','fill-opacity':0,stroke:'#df393e','stroke-width':4.5,'stroke-linejoin':'round','data-piece':'zero'},{kind:'orbit'});
    // The existing stalk bends into the zero's upper-left crown.
    const stem=make('path',{fill:'none',stroke:'#4a9b45','stroke-width':2.2,'stroke-linecap':'round','data-piece':'stem'});group.append(stem);
    const starts=[[250,313,0],[249,336,-35],[251,336,35],[249,368,-35],[251,368,35],[249,399,-35],[251,399,35]];
    for(let i=0;i<14;i++){
      const [x,y,a]=starts[i%7],theta=Math.PI-(i/13)*Math.PI*.92;
      const bx=334+57*Math.cos(theta),by=258-84*Math.sin(theta);
      const angle=(i%2?50:-28)+(i/13)*95;
      track(leaf(x,y,a,.9),leaf(bx,by,angle,.78),{fill:'#4a9b45','data-piece':'grain'},{kind:'grain'});
    }
    const subtitle=make('g',{'data-piece':'jubilee-caption',fill:'#c5a059'});
    const ar=make('text',{x:313,y:390,'text-anchor':'middle','font-size':16,'font-family':'Tahoma,Arial,sans-serif',direction:'rtl',lang:'ar'});ar.textContent='اليوبيل الذهبي';
    const line=make('path',{d:'M250 400H390',stroke:'#c5a059','stroke-width':1});
    const en=make('text',{x:320,y:421,'text-anchor':'middle','font-size':14,'font-family':'Arial,sans-serif','font-weight':700});en.textContent='GOLDEN JUBILEE';subtitle.append(ar,line,en);group.append(subtitle);
    const years=make('g',{'data-piece':'years',fill:'#c5a059','font-size':13,'font-family':'Arial,sans-serif'});
    for(const [x,text]of [[79,'2026'],[392,'1976']]){const label=make('text',{x,y:545,'text-anchor':'middle'});label.textContent=text;years.append(label);}svg.querySelector('.nameplate').append(years);
    const plate=svg.querySelector('.nameplate path'),texts=[...svg.querySelectorAll('.nameplate>text')],rim=svg.querySelector('.rim-line'),paper=svg.querySelector('.rim-fill>path'),rimSurface=svg.querySelector('.rim-fill use:nth-of-type(2)');
    let current=0,target=0,lastTime=0,frame=0;
    function draw(progress){
      const t=smooth(progress),material=smooth(progress/.65);svg.dataset.morphProgress=progress.toFixed(4);
      materialStops.forEach(({stop,source,target})=>stop.setAttribute('stop-color',color(source,target,material)));
      for(const item of tracks){
        const local=item.kind==='five'||item.kind==='counter'?smooth((progress-.02)/.56)
          :item.kind==='grain'?smooth((progress-.2)/.65)
          :smooth((progress-.25)/.7);
        const points=item.source.map((p,i)=>[mix(p[0],item.target[i][0],local),mix(p[1],item.target[i][1],local)]);
        item.path.setAttribute('d',points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('')+'Z');
        if(item.kind==='counter')item.path.setAttribute('fill',color('f8f5eb','00331d',smooth(progress/.65)));
        else if(item.kind==='five')item.path.setAttribute('fill','url(#fiveGold)');
        else if(item.kind==='grain')item.path.setAttribute('fill','url(#grainGold)');
        else{item.path.setAttribute('stroke','url(#orbitGold)');item.path.setAttribute('fill','url(#orbitGold)');item.path.setAttribute('fill-opacity',String(smooth((local-.12)/.7)));item.path.setAttribute('stroke-width',String(mix(4.5,.8,local)));}
      }
      const stemPoints=Array.from({length:40},(_,i)=>{const f=i/39,theta=Math.PI-f*Math.PI*.92;return [mix(250,334+57*Math.cos(theta),t),mix(430-f*127,258-84*Math.sin(theta),t)];});
      stem.setAttribute('d',stemPoints.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(''));stem.setAttribute('stroke',color('4a9b45','e5c16a',t));
      rim.setAttribute('stroke',color('eee7d7','e0b95e',t));rim.setAttribute('stroke-width',String(mix(7,3,t)));
      paper.setAttribute('fill',color('fbf9f2','00331d',smooth(progress/.65)));paper.setAttribute('stroke',color('c5a059','b99b55',t));
      rimSurface.setAttribute('fill',color('e9e2d1','004026',smooth(progress/.65)));
      plate.setAttribute('fill',color('08744c','00331d',t));plate.setAttribute('stroke',color('e9e2d1','e0b95e',t));
      texts.forEach((text,i)=>{text.setAttribute('fill',color('fffefa','e0b95e',t));text.setAttribute('font-size',String(mix(i?24:37,i?22:29,t)));});
      // Only supporting words reveal; the emblem itself is never crossfaded.
      subtitle.setAttribute('opacity',String(smooth((progress-.65)/.3)));years.setAttribute('opacity',String(smooth((progress-.75)/.25)));
      svg.dataset.morphState=progress===0?'original':progress===1?'jubilee':'transforming';
    }
    function tick(time){const dt=Math.min((time-(lastTime||time-16))/1000,.05);lastTime=time;current=mix(current,target,1-Math.exp(-dt/.085));if(Math.abs(current-target)<.0005)current=target;draw(current);frame=current!==target?requestAnimationFrame(tick):0;}
    function update(){target=Math.min(Array.from(input.value).length/10,1);if(reduce.matches){cancelAnimationFrame(frame);frame=0;current=target;draw(current);}else if(!frame){lastTime=0;frame=requestAnimationFrame(tick);}}
    input.addEventListener('input',event=>{if(!event.isComposing)update();});input.addEventListener('compositionend',update);input.addEventListener('change',update);reduce.addEventListener('change',update);
    draw(0);update();
  }
  init().catch(()=>{/* Keep the original accessible SVG image if loading is unavailable. */});
})();
