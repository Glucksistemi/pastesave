const {app, BrowserWindow, ipcMain, shell, dialog} = require('electron');
const path = require('path');
const url = require('url');
var files = require('./files');
var fs = require('fs');

let win;
let config = files.loadConfig();
function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
        title: "PasteSave",
        width: 600,
        height: 400
    });
    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'window/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    //win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
    app.quit()
}
});


app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()

    }
});

ipcMain.on('savefile', (event, arg) => {
   files.saveImage(arg)
});

ipcMain.on('showfiles', (event, arg) => {
    shell.openItem(files.config.folder)
});

ipcMain.on('changeroot', (event, arg) => {
    dialog.showOpenDialog(win, {properties: ["openDirectory"], defaultPath: files.config.folder}, (pth) => {
        if (pth) {
            files.editConfig("folder", pth[0]);
            event.sender.send('setpath', pth[0])
        }
    })
});
ipcMain.on('givepath', (event, arg) => {
   event.sender.send('setpath', files.config.folder)
});

ipcMain.on('givesubfolders', (event, arg)=> {
    event.sender.send('subfolders', files.getSubFolders())
});
ipcMain.on('createsubfolder', (event, arg)=> {
    event.returnValue = files.createSubFolder(arg);
});
ipcMain.on('setheight', (event, height) => {
    win.setSize(
        600,
        height+60
    )
});