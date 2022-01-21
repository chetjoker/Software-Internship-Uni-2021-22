// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

// is required to read and wirte files with Node.js
import * as fs from 'fs';
import { reverse } from 'dns';

const path = require('path');

// Save current path of the project, it is important to be in the direct folder
let folderPath = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath);

const configName = "greenide.config";
const defaultConfigName = "greenide.default.config";

// decortor type for hotspots
const hotspotsDecoration = vscode.window.createTextEditorDecorationType({
	overviewRulerLane: vscode.OverviewRulerLane.Full,
	light: {
		backgroundColor: '#bf6161',//'#d65c5e',
		overviewRulerColor: '#bf6161',//'#d65c5e',
	},
	dark: {
		backgroundColor: '#a82a2d',
		overviewRulerColor: '#a82a2d',
	}
});

const greenspotDecoration = vscode.window.createTextEditorDecorationType({
	overviewRulerLane: vscode.OverviewRulerLane.Full,
	light: {
		backgroundColor: '#6aa84f',//'#51d655',
		overviewRulerColor: '#6aa84f',//'#51d655',
	},
	dark: {
		backgroundColor: '#274e13',//'#07ad0c',
		overviewRulerColor: '#274e13'//'#07ad0c',
	}
});

let configArrayCache : any[] = [];
let defaultConfigArrayCache : any[] = [];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "greenide" is now active!!');

	let disposable = vscode.commands.registerCommand('greenide.init', (greenidePackage: string = 'kanzi') => {
		initializeGreenide(context, greenidePackage);
	});

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
				if (!fs.existsSync(path.join(folderPath[0], defaultConfigName))) {
					fs.writeFileSync(path.join(folderPath[0], defaultConfigName), JSON.stringify(standardConfig));
				}
			} catch(err) {
				console.error(err);
			}

			let configArray = readConfig(configName);
			let defaultConfigArray = readConfig(defaultConfigName);

			configArrayCache = configArray;
			defaultConfigArrayCache = defaultConfigArray;

			registerNewMethodHover(context, configArray, defaultConfigArray, greenidePackage);
		}

		vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
			if(folderPath){
				if (document.fileName === path.join(folderPath[0], configName)) {
					let configArray = readConfig(configName);

					registerNewMethodHover(context, configArray, defaultConfigArrayCache, greenidePackage);
				}
				if (document.fileName === path.join(folderPath[0], defaultConfigName)) {
					let defaultConfigArray = readConfig(defaultConfigName);

					registerNewMethodHover(context, configArrayCache, defaultConfigArray, greenidePackage);
				}
			}
		});

	});
}

function readConfig(configName: string){ 
	let configArray: number[] = [];

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

function registerNewMethodHover(context: vscode.ExtensionContext, configArray: any[], defaultConfigArray: any[], greenidePackage : string){

	//Abfrage zum Server
	axios.post("http://server-backend-swtp-13.herokuapp.com/getMethodParameters", {config: configArray, greenidePackage: greenidePackage, oldConfig: defaultConfigArray}, {}).then(res => {
		let definedFunctions: any = res.data.methods;
		let hotspotRuntime: any = res.data.hotspotRuntime;
		let hotspotEnergy: any = res.data.hotspotEnergy;
		let greenspotRuntime: any = [].concat(hotspotRuntime).reverse();//Achtung die ersten Element werden immer -1 als runtime- und energyHotspot haben
		let greenspotEnergy: any = [].concat(hotspotEnergy).reverse();  //same thing
		// console.log("Funktionen:", definedFunctions);
		// console.log("Runtime-Hotspots:", hotspotRuntime);
		// console.log("Energy-Hotspots:", hotspotEnergy);
		// console.log("Runtime-Greenspots:", greenspotRuntime);
		// console.log("Energy-Greenspots:", greenspotEnergy);

		//greenspotarray analog 

		//Entferne vorherige HoverProvider
		context.subscriptions.forEach((disposable: vscode.Disposable) => {
			disposable.dispose();
		});

		highlightHotAndGreenspots(hotspotRuntime, hotspotEnergy, greenspotRuntime, greenspotEnergy, 10, "energy");

		vscode.window.onDidChangeVisibleTextEditors(event => {
			highlightHotAndGreenspots(hotspotRuntime, hotspotEnergy, greenspotRuntime, greenspotEnergy, 10, "energy");
		}, null, context.subscriptions);

		let disposable = vscode.languages.registerHoverProvider({language: 'java', scheme: 'file'},{
			provideHover(document, position, token) {
				//Standardwerte bei Hover
				let hoverTriggered = false;
				let hoverLanguage = "";
				let hoverText = "";


				const wordRange = document.getWordRangeAtPosition(position, /\w[\w]*/g);

				queryFunctionNames(document, definedFunctions, wordRange, (definedFunction: any) => {
					hoverTriggered = true;
					hoverText = "Function: " + definedFunction.name + "\nRuntime: " + definedFunction.runtime.toFixed(2) + " ms\nEnergy: " + definedFunction.energy.toFixed(2) + " mWs";
					let isInArray = false;
					for(const hotspot of hotspotRuntime){
						if(hotspot.name === definedFunction.name){
							const runtimeChange = (definedFunction.runtime - (definedFunction.runtime / hotspot.runtimeSpot));
							const energyChange = (definedFunction.energy - (definedFunction.energy / hotspot.energySpot));

							hoverText += "\nRuntimeChange: " + (runtimeChange > 0 ? '+' : '') + runtimeChange.toFixed(2) + " ms";
							hoverText += "\nEnergyChange: " + (runtimeChange > 0 ? '+' : '') + energyChange.toFixed(2) + " mWs";
							isInArray = true;
						}
					}

					if(!isInArray){
						//Negativer Hotspot
						hoverText += "\nRuntimeChange: NaN";
						hoverText += "\nEnergyChange: NaN";
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


function highlightHotAndGreenspots(hotspotRuntime: any, hotspotEnergy: any, greenspotRuntime: any, greenspotEnergy: any, count: number, type: String = "runtime"){
	const activeEditor = vscode.window.activeTextEditor;
	if(!activeEditor)
		{return;}
	

	if(type === "runtime"){
		const hotspots: vscode.DecorationOptions[] | undefined = highlightSpots(hotspotRuntime, count);
		if(hotspots !== undefined){
			activeEditor.setDecorations(hotspotsDecoration, hotspots);
		}
		const greenspots: vscode.DecorationOptions[] | undefined = highlightSpots(greenspotRuntime, count);
		if(greenspots !== undefined){
			activeEditor.setDecorations(greenspotDecoration, greenspots);
		}
	}else if(type === "energy"){
		const hotspots: vscode.DecorationOptions[] | undefined = highlightSpots(hotspotEnergy, count);
		if(hotspots !== undefined){
			activeEditor.setDecorations(hotspotsDecoration, hotspots);
		}
		const greenspots: vscode.DecorationOptions[] | undefined = highlightSpots(greenspotEnergy, count);
		if(greenspots !== undefined){
			activeEditor.setDecorations(greenspotDecoration, greenspots);
		}
	}
}


function highlightSpots(funktionsnamen: any, count: number)
{
	const activeEditor = vscode.window.activeTextEditor;
	if(!activeEditor)
		{return;}

	const regex = /\w+/g;
	const text = activeEditor.document.getText();
	const hotspots: vscode.DecorationOptions[] = [];

	let match: any;
	while ((match = regex.exec(text))) {

		const startPos = activeEditor.document.positionAt(match.index);
		const endPos = activeEditor.document.positionAt(match.index + match[0].length);
		let decoration = { range: new vscode.Range(startPos, endPos) };

		const wordRange = activeEditor.document.getWordRangeAtPosition(startPos, /\w+/g);

		queryFunctionNames(activeEditor.document, funktionsnamen.slice(0,count), wordRange, (definedFunction: any) => {
			hotspots.push(decoration);
		});

	}

	return hotspots;
}



function queryFunctionNames(document: vscode.TextDocument, definedFunctions: any, wordRange: vscode.Range | undefined, callback: Function){
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
			if(suffixText.match(/^\(.*\)\s*{/) && prefixText.match(/\s$/)){

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
								callback(definedFunction);
							}
						}
					}
				}
			}
	});
}