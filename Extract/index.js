let coreAPP = null;
//let html_file = 'index.html';
let html_file = 'electron_index.html';

const licence_agreement='**END USER LICENSE AGREEMENT**\n This End User License Agreement ("Agreement") is entered into between Investor Data Solutions LLC, a US corporation, and you, the end user ("Licensee").\n **1. SOFTWARE LICENSE**\n 1.1 **License Grant**: Subject to the terms and conditions of this Agreement, Investor Data Solutions LLC grants Licensee a non-exclusive, non-transferable, revocable license to use the pdf data extractor software ("Software") for personal or business use.\n 1.2 **Usage Restrictions**: Licensee shall not, and shall not permit others to: (a) copy, modify, or distribute the Software; (b) reverse engineer, decompile, or disassemble the Software; (c) remove any proprietary notices or labels from the Software.\n **2. UPDATES AND SUPPORT**\n 2.1 **Updates**: Investor Data Solutions LLC may, at its discretion, provide updates or modifications to the Software. Licensee is not entitled to automatic updates.\n 2.2 **Support**: Investor Data Solutions LLC may offer support services for the Software at its discretion.\n **3. TERM AND TERMINATION**\n 3.1 **Term**: This Agreement is effective upon Licensee\'s acceptance and shall continue until terminated.\n 3.2 **Termination**: Investor Data Solutions LLC may terminate this Agreement immediately if Licensee breaches any material term. Upon termination, Licensee must cease all use of the Software.\n **4. ACCEPTANCE**\n By clicking the "Accept" button or by installing, copying, or otherwise using the Software, you agree to be bound by the terms and conditions of this Agreement.\n **5. DISCLAIMER OF WARRANTY**\n 5.1 **No Warranty**: The Software is provided "as is" without warranty of any kind, express or implied.\n **6. LIMITATION OF LIABILITY**\n 6.1 **Limitation**: In no event shall Investor Data Solutions LLC be liable for any damages, including but not limited to, direct, indirect, special, incidental, or consequential damages.\n **7. GOVERNING LAW**\n 7.1 **Governing Law**: This Agreement shall be governed by and construed in accordance with the laws of the state of Delaware.\n **8. MISCELLANEOUS**\n 8.1 **Entire Agreement**: This Agreement constitutes the entire agreement between the parties.\n';


function run() {
	const U = new(require('./lib/utils'))();

	const { app, BrowserWindow, Menu, ipcMain, dialog, contextBridge, ipcRenderer, shell } = require('electron');
	const path = require('path');
	
	let userDataPath = app.getPath('userData');
	
	userDataPath = U.replaceAll(userDataPath,'\\','/');
	
	
	// Handle creating/removing shortcuts on Windows when installing/uninstalling.
	if (require('electron-squirrel-startup')) {
		app.quit();
	}
	
	let mainWindow=null;

function openDefaultBrowser(url) {
  shell.openExternal(url);
}


	//done
	const createWindow = () => {
		// Create the browser window.
		mainWindow = new BrowserWindow({
			width: 800,
			height: 600,
			icon: path.join(__dirname, 'img/extract_black.png'),
			webPreferences: {
				preload: path.join(__dirname, 'preload.js'),
				nodeIntegration: true, // Enable Node.js integration in the renderer process	
			},
		});
		

		// and load the index.html of the app.
		mainWindow.loadFile(path.join(__dirname, html_file));
		showEULADialog();

		const menu = Menu.buildFromTemplate([
			/*{
				label: 'File',
				submenu: [
					{
						click: function(){
							handleFileOpen();
						},
						label: 'Add Folders'
					}
				]
			},*/
		]);

		Menu.setApplicationMenu(menu);

		// Open the DevTools.
		mainWindow.webContents.openDevTools();
	};

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', runApp);

	// Quit when all windows are closed, except on macOS. There, it's common
	// for applications and their menu bar to stay active until the user quits
	// explicitly with Cmd + Q.
	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.on('activate', () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) {
			runApp();
		}
	});

	let action_fct = {
		pick_directory:handleFileOpen,
		open_hyperlink:openDefaultBrowser,
	};

	function showEULADialog() {
		const options = {
			type: 'info',
			title: 'End User License Agreement',
			message: licence_agreement,
			buttons: ['Cancel', 'Accept'],
			defaultId: 1,
			cancelId: 0,
		};

		dialog.showMessageBox(null, options, (response) => {
			if (response === 1) {
				// User clicked "Accept," continue with the application
				mainWindow.show();
			} else {
				// User clicked "Cancel," close the application
				app.quit();
			}
		});
	}


	//send to html
	function sendPush(action, value) {
		mainWindow.webContents.send('main_to_html', action, value);
	}
	coreAPP = new(require('./data_extrcart'))(sendPush);
	
	//receive from html
	function receivePush(action,obj) {
		if(action_fct[action]) return action_fct[action](obj);
		obj.userDataPath = userDataPath;
		return coreAPP.receivePush(action,obj);
	}

	async function handleFileOpen (defaultPath) {

		const obj = { 
			properties: ['openDirectory','multiSelections'],
		};
		if(defaultPath) {
			if(process.platform == 'win32') defaultPath = U.replaceAll(defaultPath,'/','\\');
			obj.defaultPath = defaultPath;
		}
				
		const { canceled, filePaths } = await dialog.showOpenDialog(obj);
		if (!canceled) return filePaths;
	}



	function runApp(){
		createWindow();
		
		ipcMain.handle('html_to_main', function(e,action,obj){
			if(action_fct[action]) return action_fct[action](obj);
			else return receivePush(action,obj);			
		});

		ipcMain.handle('html_response', function(e,action,obj){
			console.log('html_response',action);
		});		

		sendPush('electron_init');	
		
		
	}

	// In this file you can include the rest of your app's specific main process
	// code. You can also put them in separate files and import them here.
}

run();