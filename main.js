const electron = require("electron");
const url = require("url");
const path = require("path");
const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

// Listen for the app to be ready
app.on('ready', function () {

    // Create new window
    mainWindow = new BrowserWindow(
        {
            webPreferences: {
                nodeIntegration: true
            }
        }
    );

    // Load HTML into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    // Quit app when closed
    mainWindow.on('closed', function () {
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create Add Window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true
        }

    });
    // Load HTML into the window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    //Garbage Collection handle
    addWindow.on('close', function () {
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('item:add', function (e, item) {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create Menu Template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If Mac, Add empty object to Menu
if (process.platform == 'darwin') {
    // unshift adds to the beginning of the array
    mainMenuTemplate.unshift({});
}


// Add Developer tools itme if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}