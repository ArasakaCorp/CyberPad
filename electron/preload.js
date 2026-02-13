const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("api", {
    onFileOpened: (cb) => ipcRenderer.on("file:opened", (_e, payload) => cb(payload)),
    openFile: () => ipcRenderer.invoke("file:open"),
    minimize: () => ipcRenderer.invoke("window:minimize"),
    close: () => ipcRenderer.invoke("window:close"),
    saveFile: (filePath, content) => ipcRenderer.invoke("file:save", filePath, content),
    saveAs: (suggestedName, content) => ipcRenderer.invoke("file:saveAs", suggestedName, content),
    openPath: (filePath) => ipcRenderer.invoke("file:openPath", filePath),
    openFileByPath: (filePath) => ipcRenderer.invoke("file:openByPath", filePath),
    getPathForFile: (file) => webUtils.getPathForFile(file),
    getAppVersion: () => ipcRenderer.invoke("app:getVersion"),
    openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
});