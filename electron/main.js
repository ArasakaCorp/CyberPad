import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { Menu } from "electron";
import { globalShortcut } from "electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;

function createWindow() {
    const iconPath = path.join(__dirname, "assets", "icons", "icon.ico");
    win = new BrowserWindow({
        width: 1100,
        height: 700,

        frame: false,
        transparent: true,
        show: false,                 // покажем когда будет готово
        backgroundColor: "#00000000",

        autoHideMenuBar: true,

        icon: iconPath,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // или preload.js как у тебя
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.once("ready-to-show", () => win.show());

    const isDev = !app.isPackaged;

    // Dev: Vite server
    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools({ mode: "detach" });
    } else {
        // Prod: built files
        win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
    }
    win.webContents.on("did-fail-load", (_e, code, desc) => {
        console.log("did-fail-load:", code, desc);
    });
}



app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow({autoHideMenuBar: true,});
    });

    globalShortcut.register("F12", () => {
        if (win) win.webContents.toggleDevTools();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

// IPC: open file and return {path, content}
ipcMain.handle("file:open", async () => {
    const result = await dialog.showOpenDialog(win, {
        properties: ["openFile"],
        filters: [
            { name: "Text", extensions: ["txt", "log", "md"] },
            { name: "All Files", extensions: ["*"] }
        ]
    });

    if (result.canceled || !result.filePaths?.[0]) return null;

    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, "utf-8");
    return { filePath, content };
});

//IPC: minimize
ipcMain.handle("window:minimize", () => {
    if (win) win.minimize();
    return true;
});

//IPC: close
ipcMain.handle("window:close", () => {
    if (win) win.close();
    return true;
});

//IPC: Save
ipcMain.handle("file:save", async (_event, filePath, content) => {
    if (!filePath) return { ok: false, reason: "no_path" };

    await fs.writeFile(filePath, content, "utf-8");
    return { ok: true };
});

ipcMain.handle("file:saveAs", async (_event, suggestedName, content) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: suggestedName || "note.txt",
        filters: [
            { name: "Text", extensions: ["txt", "md", "log", "json"] },
            { name: "All", extensions: ["*"] }
        ]
    });

    if (canceled || !filePath) return null;

    await fs.writeFile(filePath, content, "utf-8");

    return { filePath };
});