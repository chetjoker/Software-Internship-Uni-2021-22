// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// is required to read and wirte files with Node.js
import * as fs from 'fs';

// Save current path of the project, it is important to be in the direct folder
let folderPath = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath);

const configName = "/greenideconfig.txt";
const standardConfig = "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('folderPath: ' + folderPath);
	fs.readFile(folderPath + configName, 'utf8', (err, data) => {
		// check if configuration file exist
		if(err) {
			console.error(err.message );
			console.log('Es wird eine neue Standradkonfiguration angelegt!');

			// if configuration file does not exist, a new one will be created
			fs.writeFile(folderPath + configName, standardConfig, err => {
				if(err) {
					console.error(err.message);
				}
				console.log('Datei wurde erfolgreich hinzugefügt!');
			});
		}

		// if configuration file exist, it will be displayed in the console
		console.log(data);
	});

}

// this method is called when your extension is deactivated
export function deactivate() {}
