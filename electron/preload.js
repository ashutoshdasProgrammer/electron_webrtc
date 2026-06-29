const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld("stealth", {
    toggle_stealth_mode: () => ipcRenderer.invoke('toggle-stealth:mode')
});

// exposing a function

contextBridge.exposeInMainWorld('qr', {
    generate: async ( text, options) => {
        return ipcRenderer.invoke('generate-qr', text, options);
    }
}); 

// for audio loopback
contextBridge.exposeInMainWorld("loopback", {
    enable: () => ipcRenderer.invoke("enable-loopback-audio"),
    disable: () => ipcRenderer.invoke("disable-loopback-audio")
});