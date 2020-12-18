"use strict";

const electron = require("electron");
const path = require("path");
const stringify = require("./modules/stringify");
const url = require("url");

let menu = menu_build();
let win;						// We're supposed to keep global references to every window we make.

if (electron.app.isReady()) {
	startup();
} else {
	electron.app.once("ready", () => {
		startup();
	});
}

// --------------------------------------------------------------------------------------------------------------

function alert(msg) {
	electron.dialog.showMessageBox({message: stringify(msg), title: "Alert", buttons: ["OK"]}, () => {});
	// Providing a callback makes the window not block the process.
};

function startup() {

	win = new electron.BrowserWindow({
		width: 1600,
		height: 900,
		backgroundColor: "#000000",
		resizable: true,
		show: false,
		useContentSize: true,
		webPreferences: {
			backgroundThrottling: false,
			contextIsolation: false,
			nodeIntegration: true,
			spellcheck: false,
			zoomFactor: 1 / electron.screen.getPrimaryDisplay().scaleFactor		// Unreliable, see https://github.com/electron/electron/issues/10572
		}
	});

	win.once("ready-to-show", () => {
		try {
			win.webContents.setZoomFactor(1 / electron.screen.getPrimaryDisplay().scaleFactor);	// This seems to work, note issue 10572 above.
		} catch (err) {
			win.webContents.zoomFactor = 1 / electron.screen.getPrimaryDisplay().scaleFactor;	// The method above "will be removed" in future.
		}
		win.show();
		win.focus();
	});

	electron.app.on("window-all-closed", () => {
		electron.app.quit();
	});

	electron.ipcMain.on("alert", (event, msg) => {
		alert(msg);
	});

	// Actually load the page last, I guess, so the event handlers above are already set up.
	// Send some possibly useful info as a query.

	let query = {};
	query.user_data_path = electron.app.getPath("userData");

	win.loadFile(
		path.join(__dirname, "renderer.html"),
		{query: query}
	);

	electron.Menu.setApplicationMenu(menu);
}

function menu_build() {
	const template = [
		{
			label: "Menu",
			submenu: [
				{
					label: "About",
					click: () => {
						alert("Orbiter running under Electron " + process.versions.electron);
					}
				},
				{
					role: "quit"
				},
				{
					role: "toggledevtools"
				}
			]
		}
	];

	return electron.Menu.buildFromTemplate(template);
}

