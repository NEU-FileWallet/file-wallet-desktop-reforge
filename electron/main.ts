import { app, BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import isDev from "electron-is-dev";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { Notification } from "electron";
import {
  addFiles,
  downloadFile,
  DownloadFileProps,
  getFileSize,
  InitIPFS,
  pingIPFS,
  stopIPFS,
} from "./ipfs";
import { execSync } from "child_process";
import { platform } from "os";
import { join } from "path";

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:3000/index.html");
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  win.on("closed", () => (win = null));

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require("electron-reload")(__dirname, {
      electron: path.join(
        __dirname,
        "..",
        "..",
        "node_modules",
        ".bin",
        "electron"
      ),
      forceHardReset: true,
      hardResetMethod: "exit",
    });
  }

  // DevTools
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));

  if (isDev) {
    win.webContents.openDevTools();
  }

  win.setMenuBarVisibility(false);
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on("notify", (event, { title, body, path }) => {
  const notification = new Notification({ title, body });
  notification.once("click", () => {
    if (path) {
      shell.showItemInFolder(path);
    }
  });
  notification.show();
});

ipcMain.handle("close", () => {
  win?.close();
});

ipcMain.handle("getPath", (event, path: any) => {
  return app.getPath(path);
});

ipcMain.handle("init-Ipfs", (event, path) => {
  console.log("Initializing ipfs");
  return InitIPFS(path);
});

ipcMain.handle("find-Ipfs-Path", () => {
  let path = "ipfs";
  const os = platform();
  try {
    return execSync(`${os === "win32" ? "where" : "which"} ipfs`)
      .toString()
      .trim();
  } catch (error) {}
  try {
    path = join(app.getPath("userData"), path);
    execSync(`${path} version`);
    return path;
  } catch (error) {}
  return "";
});

ipcMain.handle("add-file", (event, files: string[]) => {
  return addFiles(files);
});

ipcMain.on("download-file", (event, props: DownloadFileProps) => {
  const reply = (report: any) => {
    event.reply("download-progress", report);
  };
  return downloadFile({ ...props, onProgress: reply });
});

ipcMain.handle("ping-ipfs", () => {
  return pingIPFS();
});

ipcMain.handle("stop-ipfs", () => stopIPFS());

ipcMain.handle("get-file-size", (event, cid: string) => {
  return getFileSize(cid);
});
