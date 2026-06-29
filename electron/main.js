const { app, BrowserWindow, ipcMain, Menu, globalShortcut, Tray } = require('electron');
const path = require('path');
const qrcode = require('qrcode');
const { initMain } = require("electron-audio-loopback");

initMain();

let win;
let trayIcon;

const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        show: true,
        webPreferences: {
            preload: path.join(__dirname, "./preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    win.loadFile(path.join(__dirname, "./index.html"));
}

const createTrayMenu = () => {
    trayIcon = new Tray(path.join(__dirname, '../images/icon.png'));
    const trayContext = Menu.buildFromTemplate([
        {
            label: "Show Control Panel",
            click: () => {
                if (win) win.show();
            }
        },
        {
            label: "Hide Control Panel",
            click: () => {
                if (win) win.hide();
            }
        },
        { type: "separator" },
        {
            label: "Terminate App completely",
            click: () => {
                app.isQuitting = true,
                    app.quit();
            }
        }
    ])

    // it connects iconMenu to the trayIcon
    trayIcon.setContextMenu(trayContext);
    trayIcon.setToolTip("My Electron App");

    trayIcon.on('double-click', () => {
        if (win && win.isVisible()) {
            win.hide()
        } else {
            win.show();
        }
    })
};


app.whenReady().then(() => {
    createWindow();
    createTrayMenu();

    const global_shortcut_registered = globalShortcut.register("Control+Shift+H", () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
        }
    })

    if (!global_shortcut_registered) {
        console.log('global shortcut registration failed');
    }
});

ipcMain.handle("toggle-stealth:mode", () => {
    win.hide()
});

ipcMain.handle('generate-qr', async (event, text, options) => {
    try {
        const dataUrl = await qrcode.toDataURL(text, options);
        return dataUrl;
    } catch (error) {
        console.error("Error generating QR code in main process:", error);
        throw error; // Sends the error back to the renderer process
    }
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});