const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    onFileOpened: (cb) => ipcRenderer.on("file:opened", (_e, payload) => cb(payload)),
    openFile: () => ipcRenderer.invoke("file:open"),
    minimize: () => ipcRenderer.invoke("window:minimize"),
    close: () => ipcRenderer.invoke("window:close"),
    saveFile: (filePath, content) => ipcRenderer.invoke("file:save", filePath, content),
    saveAs: (suggestedName, content) => ipcRenderer.invoke("file:saveAs", suggestedName, content),
});