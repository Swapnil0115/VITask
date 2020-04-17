const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

app.on('ready',function(){
    createMainWindow();
});

function createMainWindow()
{
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    /*mainWindow.maximize();*/
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Quit app when closed
    mainWindow.on('closed',function(){
        mainWindow = null;
    });
    //Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);
}



//Add Window
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true
        }
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Garbage Collection Handle
    addWindow.on('click',function(){
        addWindow = null;
    });
};

function createDashboard(){
    dashWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    /*dashWindow.maximize();*/
    dashWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'dashboard.html'),
        protocol: 'file:',
        slashes: true
    }));
    dashWindow.on('closed',function(){
        app.quit();
    });
    
};


//catch login:new
ipcMain.on('login:new',function(e,item){
    console.log(item);
    createDashboard();
    dashWindow.webContents.send('login:new',item);
});

//catch page:change
ipcMain.on('page:change',function(e,item){
    console.log(item);
    dashWindow.webContents.send('page:change',item);
});

//catch item:add
ipcMain.on('item:add',function(e,item){
    console.log(item);
    mainWindow.webContents.send('item:add',item);
    addWindow.close();
});

//create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label: 'Add Items',
                click()
                {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items'
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//for mac add empty object
if(process.platform=="darwin"){
    mainMenuTemplate.unshift({});
}

//add developer tools item if not in production
if(process.env.NODE_ENV!=='production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
        {
            role: 'reload'
        }
    ]
    })
}