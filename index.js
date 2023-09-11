const { app, BrowserWindow, globalShortcut } = require('electron');
const fs = require('fs');

const config = {
    networkUrl: "https://whackerlink.com",
    pttKey: "V",
    emergKey: "J"
}

let win;
let spaceBarPressed = false;
let checkSpaceInterval;

const createWindow = () => {
    win = new BrowserWindow({
        width: 2000,
        height: 1000,
        webPreferences: {
            nodeIntegration: false
        }
    });

    win.loadURL(config.networkUrl).then(r => () =>{
        console.log(r);
    });

    win.on('closed', () => {
        win = null;
    });
};

app.on('ready', () => {
    createWindow();

    const ret = globalShortcut.register(config.pttKey, () => {
        if (!spaceBarPressed) {
            spaceBarPressed = true;
            if (win && win.webContents) {
                win.webContents.sendInputEvent({
                    type: 'keyDown',
                    keyCode: 'Space'
                });
            }

            checkSpaceInterval = setInterval(() => {
                if (spaceBarPressed) {
                    if (win && win.webContents) {
                        win.webContents.sendInputEvent({
                            type: 'keyUp',
                            keyCode: 'Space'
                        });
                    }
                    clearInterval(checkSpaceInterval);
                    spaceBarPressed = false;
                }
            }, 500);
        } else {
            clearInterval(checkSpaceInterval);
            spaceBarPressed = false;
        }
    });
    let emerg = globalShortcut.register(config.emergKey,()=>{
        if (win && win.webContents) {
            win.webContents.sendInputEvent({
                type: 'char',
                keyCode: 'j'
            });
            console.log("emerg")
        }
    });

    if(!emerg){
        console.log("Could not reg emerg button")
    }
    if (!ret) {
        console.log('Could not reg ptt button');
    }
});

app.on('will-quit', () => {
    globalShortcut.unregister('Space');
    globalShortcut.unregisterAll();
    if (checkSpaceInterval) {
        clearInterval(checkSpaceInterval);
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});