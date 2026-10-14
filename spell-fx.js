/* Procedural Canvas2D spell art. Cached glow sprites; bounded particle budget; no pixel reads or blur filters. */
'use strict';
window.SpellFX = (() => {
  const sprites = new Map();
  const tau = Math.PI * 2;
  const noise = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function sprite(colour) {
    if (sprites.has(colour)) return sprites.get(colour);
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), fill = g.createRadialGradient(32,32,0,32,32,32);
    fill.addColorStop(0,'#fff'); fill.addColorStop(.12,colour); fill.addColorStop(.4,colour+'99'); fill.addColorStop(1,colour+'00');
    g.fillStyle=fill; g.fillRect(0,0,64,64); sprites.set(colour,c); return c;
  }
  function glow(c,x,y,size,colour,alpha=1) {
    c.globalAlpha=Math.max(0,Math.min(1,alpha)); c.drawImage(sprite(colour),x-size,y-size,size*2,size*2);
  }
  function ring(c,r,colour,width,alpha) {
    c.globalAlpha=Math.max(0,alpha); c.strokeStyle=colour; c.lineWidth=width;
    c.beginPath(); c.arc(0,0,Math.max(.01,r),0,tau); c.stroke();
  }
  function fire(c,r,t,n,z,intensity) {
    const charge=.35, burst=Math.max(0,t-charge),life=3.8;
    c.globalCompositeOperation='lighter';
    if(t<charge){ const p=t/charge; glow(c,0,0,r*(.12+.22*p),'#ff7a20',intensity); ring(c,r*(1-p)*.6,'#ffd487',2/z,p*intensity); return; }
    const expansion=1-Math.exp(-burst*7), fade=Math.max(0,1-burst/life);
    glow(c,0,0,r*.94*expansion,'#ff4b12',fade*.8*intensity);
    glow(c,0,0,r*.56*expansion,'#ffb42a',fade*intensity);
    for(let i=0;i<10;i++){const a=i/10*tau+Math.sin(burst*3+i)*.18,R=r*(.22+.27*expansion)*Math.min(1,burst*4);glow(c,Math.cos(a)*R,Math.sin(a)*R,r*(.16+.08*Math.sin(i+burst*4)**2)*fade,'#ff5a13',fade*.65*intensity)}
    ring(c,Math.min(r,r*(.08+burst*1.8)),'#ffd889',Math.max(1,5*(1-burst))/z,Math.max(0,1-burst)*intensity);
    for(let i=0;i<n;i++){
      const a=noise(i+3)*tau,velocity=.35+noise(i+90)*.6,travel=Math.min(.95,burst*velocity),x=Math.cos(a)*r*travel,y=Math.sin(a)*r*travel;
      const f=Math.max(0,1-burst/(1.1+noise(i+52)*2.6));
      glow(c,x,y,r*(.015+.035*noise(i+41))*f,'#ff9b27',f*intensity);
      c.globalAlpha=f*intensity;c.strokeStyle='#ffe2a0';c.lineWidth=1.4/z;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(a)*r*.055*f,y-Math.sin(a)*r*.055*f);c.stroke();
    }
    // Soft smoke is ordinary alpha compositing, so it remains visible above a map.
    c.globalCompositeOperation='source-over';
    for(let i=0;i<Math.min(n,14);i++){
      const a=noise(i+400)*tau,R=r*(.3+noise(i+450)*.5)*expansion;
      glow(c,Math.cos(a)*R,Math.sin(a)*R-burst*r*.05,r*(.16+burst*.025),'#514859',Math.min(.22,burst*.12)*fade*intensity);
    }
  }
  function lightning(c,length,t,n,z,intensity,width) {
    const fade=Math.max(0,1-t/1.35),flicker=.6+.4*Math.sin(t*42)**2;
    if(!fade)return;
    const seed=Math.floor(t*12), segments=22,points=[];
    for(let i=0;i<=segments;i++)points.push({x:length*i/segments,y:i===0||i===segments?0:(noise(i+seed*91)-.5)*width*.72});
    c.globalCompositeOperation='lighter';
    for(const [stroke,w,a] of [['#427bff',14,.18],['#8adfff',6,.65],['#ffffff',1.8,1]]){
      c.strokeStyle=stroke;c.lineWidth=w/z;c.globalAlpha=a*fade*flicker*intensity;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
    }
    for(let i=3;i<segments;i+=4){const p=points[i];c.globalAlpha=.65*fade*intensity;c.lineWidth=1/z;c.strokeStyle='#b9e9ff';c.beginPath();c.moveTo(p.x,p.y);const side=i%2?1:-1;for(let j=1;j<=3;j++)c.lineTo(p.x+length*j*.018,p.y+side*width*j*.12+(noise(i+j+seed)-.5)*width*.13);c.stroke();}
    glow(c,length,0,width*.55,'#7acfff',fade*.85*intensity);
    for(let i=0;i<n;i++){
      const p=(noise(i+61)+t*.8)%1;
      glow(c,p*length,(noise(i+79)-.5)*width*.5,Math.max(2/z,width*.055),'#b4e8ff',fade*intensity);
    }
  }
  function portal(c,r,t,n,z,intensity) {
    c.globalCompositeOperation='lighter';
    glow(c,0,0,r,'#7435ed',.2*intensity);
    ring(c,r*.8,'#8b65ff',9/z,.15*intensity);ring(c,r*.8,'#c8acff',1.5/z,.9*intensity);
    ring(c,r*.92,'#54deff',1/z,.6*intensity);
    for(let k=0;k<3;k++){
      c.save();c.rotate(t*(k%2?-.32:.24)+k*2);c.globalAlpha=.8*intensity;c.strokeStyle=k%2?'#69dcff':'#c09aff';c.lineWidth=3/z;c.beginPath();c.arc(0,0,r*(.5+k*.14),0,Math.PI*1.25);c.stroke();c.restore();
    }
    for(let i=0;i<12;i++){
      const a=i/12*tau-t*.15,x=Math.cos(a)*r*.86,y=Math.sin(a)*r*.86;
      c.save();c.translate(x,y);c.rotate(a);c.globalAlpha=.85*intensity;c.strokeStyle='#e4cfff';c.lineWidth=1/z;c.beginPath();c.moveTo(-r*.025,-r*.025);c.lineTo(r*.025,0);c.lineTo(-r*.025,r*.025);c.stroke();c.restore();
    }
    for(let i=0;i<n;i++){
      const p=(noise(i+4)+t*.22)%1,a=i*2.399+t*.4+p*3,R=r*(.2+.53*p);
      glow(c,Math.cos(a)*R,Math.sin(a)*R,r*.035,'#b69aff',(1-p)*intensity);
    }
  }
  function draw(c,o,t,options) {
    c.save();c.translate(o.x,o.y);c.rotate(o.angle||0);
    const r=o.radius,z=options.zoom,n=options.particles,intensity=options.intensity;
    if(o.effect==='fireball')fire(c,r,t,n,z,intensity);
    if(o.effect==='lightning')lightning(c,r,t,n,z,intensity,options.square);
    if(o.effect==='portal')portal(c,r,t,n,z,intensity);
    c.restore();
  }
  return {draw,duration:effect=>effect==='fireball'?4.2:effect==='lightning'?2.2:Infinity};
})();
