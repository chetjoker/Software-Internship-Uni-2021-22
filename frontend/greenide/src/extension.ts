// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

// is required to read and wirte files with Node.js
import * as fs from 'fs';

const path = require('path');

// Save current path of the project, it is important to be in the direct folder
let folderPath = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath);

const configName = "greenide.config";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "greenide" is now active!');

	let disposable = vscode.commands.registerCommand('greenide.init', (greenidePackage: string = 'kanzi') => {
		initializeGreenide(context, greenidePackage);
	})

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function initializeGreenide(context: vscode.ExtensionContext, greenidePackage : string){

	//Request Parameterlist from Server
	axios.post("http://server-backend-swtp-13.herokuapp.com/getParameters", {greenidePackage: greenidePackage}, {}).then(res => {
		
		if(folderPath){
			let standardConfigKeys : string[] = res.data;

			let standardConfig : {[key: string]: number} = {};

			for (let i = 0; i < standardConfigKeys.length; i ++){
				if(i === 0){
					standardConfig[standardConfigKeys[i]] = 1;
				}else{
					standardConfig[standardConfigKeys[i]] = 0;
				}
			}

			try {
				if (!fs.existsSync(path.join(folderPath[0], configName))) {
					fs.writeFileSync(path.join(folderPath[0], configName), JSON.stringify(standardConfig));
				}
			} catch(err) {
				console.error(err);
			}

			let configArray = readConfig();

			registerNewMethodHover(context, configArray, greenidePackage);
		}

		vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
			if(folderPath){
				if (document.fileName === path.join(folderPath[0], configName)) {
					let configArray = readConfig();
	
					registerNewMethodHover(context, configArray, greenidePackage);
				}
			}
		});
	});
}

function readConfig(){
	let configArray = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	if(folderPath){
		let fileContent = fs.readFileSync(path.join(folderPath[0], configName));

		try{
			let configObject = JSON.parse(fileContent.toString());
			configArray = Object.values(configObject);
		}catch{
			console.log("FEHLER in der greenide.config");
		}
	}
	return configArray;
}


function registerNewMethodHover(context: vscode.ExtensionContext, configArray: any[], greenidePackage : string){
	
	//Abfrage zum Server
	axios.post("http://server-backend-swtp-13.herokuapp.com/getMethodParameters", {config: configArray, greenidePackage: greenidePackage}, {}).then(res => {
		let definedFunctions: any = res.data;

		//Example Hotspot Array
		let hotspotArray = ["kanzi.Global.computeHistogramOrder0", "kanzi.Global.initSquash", "kanzi.entropy.ANSRangeEncoder.encodeChunk"]

		context.subscriptions.forEach((disposable: vscode.Disposable) => {
			disposable.dispose();
		});

		let disposable = vscode.languages.registerHoverProvider({language: 'java', scheme: 'file'},{
			provideHover(document, position, token) {
				//Standardwerte bei Hover
				let hoverTriggered = false;
				let hoverLanguage = "";
				let hoverText = "";


				const wordRange = document.getWordRangeAtPosition(position, /\w[\w]*/g);
				let suffixText = "";
				let prefixText = "";
				
				if(wordRange){
					prefixText = document.getText(new vscode.Range(new vscode.Position(0,0), wordRange.start));
					suffixText = document.getText(new vscode.Range(wordRange.end, new vscode.Position(document.lineCount - 1, Math.max(document.lineAt(document.lineCount - 1).text.length - 1, 0))));
				}
				//Das Wort über welches gerade gehovered wird
				const word = document.getText(wordRange);

				//Speichere am Ende die Subclass, die am nächsten dran ist 
				let highestSubClassIndex = -1;

				//Gehe durch alle Methodennamen
				definedFunctions.forEach((definedFunction: any) => {
						let functionDef = definedFunction.name;
						let isFunctionParameterCountSet = false;
						let functionParameterCount = 0;

						//Anzahl der Parameter erhalten und Klammern entfernen
						if(definedFunction.name.indexOf('(') > -1){
							isFunctionParameterCountSet = true;
							let functionDefParts = definedFunction.name.split('(');
							functionDef = functionDefParts[0];
							functionParameterCount = (functionDefParts[1].match(/,/g) || []).length;
						}

						//In Pfad aufspalten und Namen erhalten
						let functionComponents = functionDef.split('.');
						let functionName = functionComponents[functionComponents.length - 1];

						
						let documentPath = document.uri.toString().replace(".java","").split('/');

						
						let isSubClass = false;
						let subClassName = "";
						let isInSubclass = false;
						let subClassIndex = -1;
						//Sonderfall Subclass
						if(functionComponents[functionComponents.length - 2].indexOf('$') > -1){
							let tempSubClassParts = functionComponents[functionComponents.length - 2].split('$');
							isSubClass = true;
							functionComponents[functionComponents.length - 2] = tempSubClassParts[0];
							subClassName = tempSubClassParts[1];

							subClassIndex = prefixText.search(new RegExp("(static[\\s]*class[\\s]*" + subClassName + ")", "g"));

							if(subClassIndex > -1){
								let subClassPrefixBody = prefixText.slice(subClassIndex);
					
								//Zähle die geschweiften Klammern und schaue ob sie ungerade sind => Man befindet sich in Subclass
								if((subClassPrefixBody.match(/[\{\}]/g) || []).length % 2 !== 0){
									isInSubclass = true;
								}
							}
						}


						//Sonderfall Konstruktor
						if(functionName === "<init>" || functionName === "<clinit>"){
							documentPath.pop();
							functionComponents.pop();
							if(isInSubclass){
								functionName = subClassName;
							}else{
								functionName = functionComponents[functionComponents.length - 1];
							}
						}


						
						//Checke ob mit Leerzeichen beginnt und Klammern folgen
						if(suffixText.match(/^\(.*\)/) && prefixText.match(/\s$/)){

							//Teste ob entgültiger Funktionsname mit Wort übereinstimmt
							if (functionName === word) {
								let pathMatches = true;

								//Teste ob Pfad übereinstimmt
								for(let i = 1; i < functionComponents.length; i++){
									if(functionComponents[functionComponents.length - 1 - i] !== documentPath[documentPath.length - i]){
										pathMatches = false;
										break;
									}
								}

								if(pathMatches){
									//Anzahl der Parameter der Hoverfunktion erhalten
									let suffixParts = suffixText.split(')');
									let suffixParameterCount = (suffixParts[0].match(/,/g) || []).length;
									
									//Teste ob Parameteranzahl mitgegeben ist und wenn ja, ob sie passt
									if(!isFunctionParameterCountSet || suffixParameterCount === functionParameterCount){
										//Sonderbehandlung für Subclasses
										if((!isSubClass || isInSubclass) && subClassIndex >= highestSubClassIndex){
											highestSubClassIndex = subClassIndex;
											hoverTriggered = true;
											hoverText = "Function: " + definedFunction.name + "\nRuntime: " + definedFunction.runtime + " ms\nEnergy: " + definedFunction.energy + " mWs";	
										}
									}
								}
							}
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