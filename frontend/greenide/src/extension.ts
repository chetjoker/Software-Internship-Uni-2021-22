// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "greenide" is now active!');

	let definedFunctions: any[] = [];

	const data = {
		config: [1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0]
	};
	
	axios.post("http://server-backend-swtp-13.herokuapp.com/getMethodParameters", data, {}).then(res => {
		console.log(res.data);
		definedFunctions = res.data;

		let disposable = vscode.languages.registerHoverProvider({language: 'java', scheme: 'file'},{
			provideHover(document, position, token) {
	
				const range = document.getWordRangeAtPosition(position, /([^\s]+)/);
				const word = document.getText(range);
	
				//Boolean if current word is in function list
				let hoverTriggered = false;
				
				//Values to display on hovering
				let hoverLanguage = "";
				let hoverText = "";
				
				//Check if any of provided function names gets triggered
				definedFunctions.forEach((definedFunction) => {
					if (word === definedFunction.name) {
						console.log("Hey");
						hoverText = "Runtime: " + definedFunction.runtime + " Energy: " + definedFunction.energy;
						hoverTriggered = true;
					}
				});
	
				if(hoverTriggered){
					return new vscode.Hover({
						language: hoverLanguage,
						value: hoverText
					});
				}
			}
		});
	
	
		context.subscriptions.push(disposable);
	}).catch((error) => {
		console.log(error.response);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
