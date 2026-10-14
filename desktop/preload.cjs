const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('battleDesktop',{
 info:()=>ipcRenderer.invoke('overlay:info'),
 setClickThrough:value=>ipcRenderer.invoke('overlay:click-through',value),
 setDisplay:id=>ipcRenderer.invoke('overlay:display',id),
 quit:()=>ipcRenderer.invoke('overlay:quit'),
 onState:callback=>{const listener=(_e,state)=>callback(state);ipcRenderer.on('overlay:state',listener);return ()=>ipcRenderer.removeListener('overlay:state',listener)}
});
