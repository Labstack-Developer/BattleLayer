const {app,BrowserWindow,ipcMain,globalShortcut,screen,Tray,Menu,nativeImage,dialog}=require('electron');
const path=require('node:path');
let win,tray,clickThrough=false,shortcutReady=false;
const toggleKey='CommandOrControl+Shift+Space';
function info(){return {clickThrough,shortcutReady,displays:screen.getAllDisplays().map((d,i)=>({id:d.id,label:d.label||'Display '+(i+1)}))}}
function notify(){if(win&&!win.isDestroyed())win.webContents.send('overlay:state',info());menu()}
function interactive(pass){if(pass&&!shortcutReady)return;clickThrough=pass;win.setIgnoreMouseEvents(pass,{forward:true});if(!pass){win.show();win.focus()}notify()}
function move(id){const d=screen.getAllDisplays().find(d=>d.id===id);if(d){win.setBounds(d.bounds);interactive(false)}}
function menu(){if(!tray)return;tray.setContextMenu(Menu.buildFromTemplate([{label:clickThrough?'Enable drawing':'Click through to apps below',enabled:!clickThrough?shortcutReady:true,click:()=>interactive(!clickThrough)},{label:'Move to display',submenu:screen.getAllDisplays().map((d,i)=>({label:d.label||'Display '+(i+1),click:()=>move(d.id)}))},{label:'Quit BattleLayer',click:()=>app.quit()}]));tray.setToolTip('BattleLayer — Ctrl+Shift+Space toggles drawing')}
function allowed(e){if(!win||e.sender!==win.webContents)throw Error('Untrusted sender')}
if(!app.requestSingleInstanceLock()){app.quit()}else{
app.on('second-instance',()=>{if(win)interactive(false)});
app.whenReady().then(()=>{
win=new BrowserWindow({...screen.getPrimaryDisplay().bounds,transparent:true,backgroundColor:'#00000000',frame:false,resizable:false,hasShadow:false,alwaysOnTop:true,show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
win.setAlwaysOnTop(true,'screen-saver');win.setMenuBarVisibility(false);
win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());win.webContents.session.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
ipcMain.handle('overlay:info',e=>{allowed(e);return info()});
ipcMain.handle('overlay:click-through',(e,value)=>{allowed(e);if(typeof value!=='boolean')throw Error('Invalid mode');interactive(value);return info()});
ipcMain.handle('overlay:display',(e,id)=>{allowed(e);if(!Number.isInteger(id))throw Error('Invalid display');move(id);return info()});
ipcMain.handle('overlay:quit',e=>{allowed(e);app.quit()});
shortcutReady=globalShortcut.register(toggleKey,()=>interactive(!clickThrough));
globalShortcut.register('CommandOrControl+Shift+Escape',()=>app.quit());
const icon=nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==').resize({width:16,height:16});
tray=new Tray(icon);tray.on('double-click',()=>interactive(false));menu();
screen.on('display-removed',()=>move(screen.getPrimaryDisplay().id));screen.on('display-added',notify);
win.once('ready-to-show',()=>{win.show();notify();if(!shortcutReady)dialog.showMessageBox(win,{type:'warning',message:'Ctrl+Shift+Space is already in use. Click-through is disabled so you can always recover the controls. Close the other app and restart BattleLayer.'})});
win.loadFile(path.join(__dirname,'..','index.html'));win.on('closed',()=>{win=null;app.quit()});
});app.on('will-quit',()=>globalShortcut.unregisterAll());app.on('window-all-closed',()=>app.quit());
}
