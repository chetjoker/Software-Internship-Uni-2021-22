const vscode = acquireVsCodeApi();

console.log("test");
// Check if we have an old state to restore from
const previousState = vscode.getState();
document.getElementById("parameters").innerHTML = previousState ? previousState.innerHTML : "";


function readsettings() {//wenn button zum abspeichern gedrueckt wird
  var parametersDiv = document.getElementById('parameters');
  let innerHTML = "";
	const checkboxes = Array.from(parametersDiv.querySelectorAll('input[type="checkbox"]'));  
	
	var values=[];										

  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked ? values[i] = 1 : values[i] = 0;   
    let checked = checkboxes[i].checked ? 'checked' : '';
    let key = checkboxes[i].name;
    innerHTML += `<div><input type="checkbox" id="d${i}" name="${key}" ${checked}><label for="d${i}">${key}</label></div>`;  
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

  
  vscode.setState({innerHTML});
  console.log(innerHTML);
};



window.addEventListener('message', event => {
  const message = event.data; 

  switch (message.command) {
      case 'setParameters':
        let innerHTML = "";

        message.parameterKeys.forEach((key, index) => {
          let checked = message.defaultConfigData[index] ? 'checked' : '';
          innerHTML += `<div><input type="checkbox" id="d${index}" name="${key}" ${checked}><label for="d${index}">${key}</label></div>`;
        });

        document.getElementById("parameters").innerHTML = innerHTML;

        vscode.setState({innerHTML});//zwischenspeichert zustand der offenen html 
        console.log("test2");

        break;
  }
});



var defaultSettingsArray = document.getElementById('defaultSettings').addEventListener('click', function(){readsettings();});