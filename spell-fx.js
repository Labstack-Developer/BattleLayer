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
  function spiritGuardians(c,r,t,n,z,I){
    c.globalCompositeOperation='lighter';ring(c,r,'#ffe6a0',1.5/z,.5*I);ring(c,r*.92,'#81e9ff',4/z,.12*I);
    for(let i=0;i<Math.min(n,18);i++){const a=i*2.399+t*.48,R=r*(.35+.57*noise(i+7));glow(c,Math.cos(a)*R,Math.sin(a)*R,r*.04,'#ffe9ae',.65*I)}
    for(let i=0;i<3;i++){const a=t*.7+i*tau/3,x=Math.cos(a)*r*.7,y=Math.sin(a)*r*.7;c.save();c.translate(x,y);c.rotate(a+Math.PI/2);glow(c,0,0,r*.2,'#99eaff',.65*I);c.globalAlpha=.9*I;c.strokeStyle='#fff4d0';c.lineWidth=2/z;c.beginPath();c.moveTo(0,-r*.13);c.lineTo(0,r*.13);c.moveTo(-r*.06,r*.04);c.lineTo(r*.06,r*.04);c.stroke();c.beginPath();c.moveTo(-r*.1,0);c.quadraticCurveTo(-r*.25,-r*.1,-r*.14,r*.12);c.moveTo(r*.1,0);c.quadraticCurveTo(r*.25,-r*.1,r*.14,r*.12);c.stroke();c.restore()}
  }
  function hypnotic(c,r,t,n,z,I){
    c.beginPath();c.rect(-r/2,-r/2,r,r);c.clip();c.globalCompositeOperation='lighter';
    const palette=['#ff64d8','#7a8aff','#54f1d2','#ffd479'];
    for(let i=0;i<Math.min(n,40);i++){const x=(noise(i+70)-.5)*r,y=(noise(i+90)-.5)*r,size=r*(.035+.045*(.5+.5*Math.sin(t*1.2+i)));c.save();c.translate(x,y);c.rotate(t*.25+i);c.globalAlpha=(.35+.3*Math.sin(t*.8+i)**2)*I;c.strokeStyle=palette[i%4];c.lineWidth=2/z;c.strokeRect(-size,-size,size*2,size*2);glow(c,0,0,size*2,palette[i%4],.22*I);c.restore()}
  }
  function coneCloud(c,r,t,n,z,I,ice){
    c.beginPath();c.moveTo(0,0);c.lineTo(r,-r/2);c.lineTo(r,r/2);c.closePath();c.clip();c.globalCompositeOperation='lighter';
    const colour=ice?'#70d8ff':'#ff751b';
    for(let i=0;i<n;i++){const p=(noise(i+17)+t*(ice?.48:.75))%1,x=p*r,y=(noise(i+51)-.5)*x;
      glow(c,x,y,r*(ice?.11:.085)*(p+.25),colour,(1-p)*.8*I);
      c.globalAlpha=(1-p)*I;c.strokeStyle=ice?'#e3faff':'#ffe4a1';c.lineWidth=1.5/z;c.beginPath();if(ice){const s=r*.018;c.moveTo(x-s,y);c.lineTo(x+s,y);c.moveTo(x,y-s);c.lineTo(x,y+s)}else{c.moveTo(x,y);c.lineTo(x-r*.06,y+r*.025*Math.sin(t*5+i))}c.stroke();
    }
  }
  function thunder(c,r,t,n,z,I){
    c.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const p=(t*.65+i*.25)%1,side=r*p;c.globalAlpha=(1-p)*I;c.strokeStyle=i%2?'#b09aff':'#9ceaff';c.lineWidth=(2+6*(1-p))/z;c.strokeRect(-side/2,-side/2,side,side)}
    for(let i=0;i<Math.min(n,16);i++){const a=i/16*tau,p=(t*.7+noise(i))%1;glow(c,Math.cos(a)*r*p*.5,Math.sin(a)*r*p*.5,r*.035,'#b3ddff',(1-p)*I)}
  }
  function shatter(c,r,t,n,z,I){
    const p=Math.min(1,t/1.1),fade=Math.max(0,1-t/2);c.globalCompositeOperation='lighter';ring(c,r*p,'#badfff',3/z,fade*I);glow(c,0,0,r*(1-p)*.45,'#b8a1ff',fade*I);
    for(let i=0;i<n;i++){const a=noise(i+8)*tau,R=r*(.12+.8*p),x=Math.cos(a)*R,y=Math.sin(a)*R,s=r*(.02+.03*noise(i+22));c.save();c.translate(x,y);c.rotate(a+t*(noise(i+3)-.5)*4);c.globalAlpha=fade*I;c.strokeStyle='#d9f7ff';c.fillStyle='#7db5d855';c.lineWidth=1/z;c.beginPath();c.moveTo(-s,-s);c.lineTo(s*.8,0);c.lineTo(-s*.4,s*1.8);c.closePath();c.fill();c.stroke();c.restore()}
  }
  function web(c,r,t,n,z,I){
    c.beginPath();c.rect(-r/2,-r/2,r,r);c.clip();const spokes=Math.min(14,Math.max(8,n));c.strokeStyle='#e7f8ff';c.globalAlpha=.7*I;c.lineWidth=1.3/z;
    for(let i=0;i<spokes;i++){const a=i/spokes*tau;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*r,Math.sin(a)*r);c.stroke()}
    for(let j=1;j<=6;j++){c.beginPath();for(let i=0;i<=spokes;i++){const a=i/spokes*tau,R=r*j/9,x=Math.cos(a)*R,y=Math.sin(a)*R;if(!i)c.moveTo(x,y);else{const mid=a-Math.PI/spokes,sag=R*.9+Math.sin(t*.6+j)*r*.005;c.quadraticCurveTo(Math.cos(mid)*sag,Math.sin(mid)*sag,x,y)}}c.stroke()}
    c.globalCompositeOperation='lighter';for(let i=0;i<Math.min(n,12);i++){const a=noise(i+34)*tau,R=r*noise(i+5)*.65;glow(c,Math.cos(a)*R,Math.sin(a)*R,r*.025,'#d5edff',(.25+.3*Math.sin(t+i)**2)*I)}
  }
  function wall(c,r,t,n,z,I,width){
    c.globalCompositeOperation='lighter';c.globalAlpha=.3*I;c.strokeStyle='#ff7925';c.lineWidth=width;c.beginPath();c.moveTo(0,0);c.lineTo(r,0);c.stroke();
    for(let i=0;i<n;i++){const x=(i+.5)/n*r,phase=t*3+i*2.3,s=width*(1.2+.5*Math.sin(phase)**2);glow(c,x,Math.sin(phase)*width*.2,s,'#ff6518',.85*I);glow(c,x,0,width*.65,'#ffe29b',.9*I);const p=(noise(i+3)+t*.65)%1;glow(c,x+Math.sin(phase)*width*.2,-p*width*2,width*.13,'#ffb23b',(1-p)*I)}
  }

  function draw(c,o,t,options) {
    c.save();c.translate(o.x,o.y);c.rotate(o.angle||0);
    const r=o.radius,z=options.zoom,n=options.particles,intensity=options.intensity;
    if(o.effect==='fireball')fire(c,r,t,n,z,intensity);
    if(o.effect==='lightning')lightning(c,r,t,n,z,intensity,options.square);
    if(o.effect==='portal')portal(c,r,t,n,z,intensity);
    if(o.effect==='spiritguardians')spiritGuardians(c,r,t,n,z,intensity);
    if(o.effect==='hypnotic')hypnotic(c,r,t,n,z,intensity);
    if(o.effect==='burninghands')coneCloud(c,r,t,n,z,intensity,false);
    if(o.effect==='cold')coneCloud(c,r,t,n,z,intensity,true);
    if(o.effect==='thunderwave')thunder(c,r,t,n,z,intensity);
    if(o.effect==='shatter')shatter(c,r,t,n,z,intensity);
    if(o.effect==='web')web(c,r,t,n,z,intensity);
    if(o.effect==='wallfire')wall(c,r,t,n,z,intensity,o.width||options.square/5);
    c.restore();
  }
  return {draw,supports:effect=>['fireball','lightning','portal','spiritguardians','hypnotic','burninghands','thunderwave','shatter','web','wallfire','cold'].includes(effect),duration:effect=>effect==='fireball'?4.2:effect==='lightning'?2.2:effect==='shatter'?2.2:effect==='thunderwave'?2:effect==='burninghands'?2.5:effect==='cold'?3:Infinity};
})();
