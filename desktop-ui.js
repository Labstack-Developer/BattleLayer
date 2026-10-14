'use strict';
(async()=>{
if(!window.battleDesktop)return;
document.body.classList.add('desktop');
const section=document.createElement('section');
section.innerHTML='<h3>Desktop overlay</h3><p>Ctrl + Shift + Space: drawing / click-through<br>Ctrl + Shift + Escape: quit</p><label>Projector / monitor<select id="desktopDisplay"></select></label><button id="desktopPass">Click through to Photos</button><button id="desktopQuit">Quit desktop app</button>';
document.getElementById('panel').prepend(section);
const option=document.createElement('option');option.value='desktop';option.textContent='Transparent desktop overlay';document.getElementById('mode').append(option);
function update(data){document.body.classList.toggle('click-through',data.clickThrough);const b=document.getElementById('desktopPass');b.disabled=!data.shortcutReady;b.textContent=data.clickThrough?'Click-through active':'Click through to Photos';const select=document.getElementById('desktopDisplay'),value=select.value;select.replaceChildren();data.displays.forEach(d=>{const o=document.createElement('option');o.value=d.id;o.textContent=d.label;select.append(o)});if([...select.options].some(o=>o.value===value))select.value=value;}
window.battleDesktop.onState(update);update(await window.battleDesktop.info());
document.getElementById('desktopPass').onclick=()=>window.battleDesktop.setClickThrough(true);
document.getElementById('desktopQuit').onclick=()=>window.battleDesktop.quit();
document.getElementById('desktopDisplay').onchange=e=>window.battleDesktop.setDisplay(Number(e.target.value));
state.mode='desktop';sync();status('Desktop overlay · Ctrl+Shift+Space switches drawing / click-through');
})();
