import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { Menu } from "electron";
import { globalShortcut } from "electron";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;
let pendingOpenPath = null;

const OPEN_EXTS = [".txt", ".log", ".md", ".json", ".csv"];

const LOG_PATH = path.join(os.tmpdir(), "CyberPad-main.log");

const LOGGER_ENABLED = false;

export async function logMain(...args) {
    if(LOGGER_ENABLED) {
        const line = `${new Date().toISOString()} ${args.join(" ")}\n`;
        await fs.appendFile(LOG_PATH, line, "utf-8");
    }
}

function looksLikeFileArg(arg) {
    if (!arg || typeof arg !== "string") return false;
    const a = arg.toLowerCase();
    return OPEN_EXTS.some(ext => a.endsWith(ext));
}

function extractFilePathFromArgv(argv) {
    // фильтруем служебные аргументы и берём первый похожий на файл
    const fileArg = (argv || []).find(a => looksLikeFileArg(a));
    return fileArg ?? null;
}

async function openFileInApp(filePath) {
    try {
        if (!filePath) return;

        const content = await fs.readFile(filePath, "utf-8");

        if (win && !win.isDestroyed()) {
            win.webContents.send("file:opened", { filePath, content });

            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
        } else {
            pendingOpenPath = filePath;
        }
    } catch (e) {
        console.error("[CyberPad] openFileInApp error:", e);
    }
}

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

    const isDev = !app.isPackaged;

    win.once("ready-to-show", () => win.show());
    // Guard: never navigate away on dropped files / links
    win.webContents.on("will-navigate", (e, url) => {
        // Разрешаем обычные перезагрузки/навигацию в dev (http://localhost:5173)
        // Блокируем только попытки уйти на file:// (часто это drag'n'drop файлов)
        if (url?.startsWith("file://")) {
            e.preventDefault();
        }
    });

    // Guard: never allow window.open / target=_blank popups
    win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

    // Dev: Vite server
    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools({ mode: "detach" });
    } else {
        // Prod: built files
        win.loadFile(path.join(__dirname, "..", "dist", "index.html"));

        win.webContents.on("did-finish-load", () => {
            const p = pendingOpenPath ?? extractFilePathFromArgv(process.argv);

            pendingOpenPath = null;
            if (p) openFileInApp(p);
        });
    }
}



const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
    app.quit();
} else {
    app.on("second-instance", async (_event, argv) => {
        const filePath = extractFilePathFromArgv(argv);
        if (filePath) {
            if (win && !win.isDestroyed()) await openFileInApp(filePath);
            else pendingOpenPath = filePath;
        }

        if (win) {
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
        }
    });
}

// macOS: открыть файл через Finder "Open With"
app.on("open-file", (event, filePath) => {
    event.preventDefault();
    openFileInApp(filePath);
});

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

ipcMain.handle("file:openPath", async (_event, filePath) => {
    if (!filePath) return null;
    const content = await fs.readFile(filePath, "utf-8");
    return { filePath, content };
});

ipcMain.handle("file:openByPath", async (_e, filePath) => {
    // optional security: allow only local files, validate extension, etc.
    const data = await fs.readFile(filePath, "utf8");
    return { filePath, data };
});


ipcMain.handle("shell:openExternal", (_e, url) => shell.openExternal(url));
ipcMain.handle("app:getVersion", () => app.getVersion());