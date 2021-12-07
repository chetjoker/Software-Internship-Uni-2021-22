// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "greenide" is now active!');

	const definedFunctionNames = ["getMaxEncodedLength", "funktionsName2"];

	let disposable = vscode.languages.registerHoverProvider({scheme: 'file'},{
        provideHover(document, position, token) {

            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);

			//Boolean if current word is in function list
			let hoverTriggered = false;
			
			//Values to display on hovering
			let hoverLanguage = "";
			let hoverText = "";

			//Check if any of provided function names gets triggered
			definedFunctionNames.forEach((definedFunctionName) => {
				if (word == definedFunctionName) {
					hoverText = "Hovering over " + definedFunctionName;
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
}

// this method is called when your extension is deactivated
export function deactivate() {}
