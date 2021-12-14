// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// is required to read and wirte files with Node.js
import * as fs from 'fs';

// Save current path of the project, it is important to be in the direct folder
let folderPath = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath);

const configName = "/greenide.config";
const standardConfig = [1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('folderPath: ' + folderPath);

	fs.readFile(folderPath + configName, function(err, data) {
		if(err)
		{
			console.error(err.message);
			fs.writeFileSync(folderPath +configName ,standardConfig.join(','));;
		}
		else {
			var array = data.toString().split(',');
			console.log(array);
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
