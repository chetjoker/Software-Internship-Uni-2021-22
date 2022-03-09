const vscode = acquireVsCodeApi();

var dcon = false;							//Voreinstellung kanzi
var kanzion = true;

function readsettings() {
  var parametersDiv = document.getElementById('parameters');

	const checkboxes = Array.from(parametersDiv.querySelectorAll('input[type="checkbox"]'));  
	
	var values=[];										

  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked ? values[i] = 1 : values[i] = 0;     
  }

  var ausgabe = "";

  for (var j = 0; j < values.length-1; j++) {
    ausgabe += values[j] + ",";
  }

  vscode.postMessage({
    command: 'configChange',
    configType: "default",
    configData: values
  });
}



window.addEventListener('message', event => {
  const message = event.data; 

  switch (message.command) {
      case 'setParameters':
        let innerHTML = "";

        message.parameterKeys.forEach((key, index) => {
          let checked = message.defaultConfigData[index] ? 'checked' : '';
          innerHTML += `<div><input type="checkbox" id="d${index}" name="${index}" ${checked}><label for="d${index}">${key}</label></div>`;
        });

        document.getElementById("parameters").innerHTML = innerHTML;
        break;
  }
});



var defaultSettingsArray = document.getElementById('defaultSettings').addEventListener('click', function(){readsettings();});