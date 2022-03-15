const vscode = acquireVsCodeApi();


// Check if we have an old state to restore from
//const previousState = vscode.getState();
//document.getElementById("parameters").innerHTML = previousState ? previousState.HTMLstring : "";


function readsettings() {//wenn button zum abspeichern gedrueckt wird
  var parametersFieldset = document.getElementById('parameters');
  //let HTMLstring = "";
	const checkboxes = Array.from(parametersFieldset.querySelectorAll('input[type="checkbox"]'));  
	
	var values=[];										

  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked ? values[i] = 1 : values[i] = 0;   

    /*let checked = checkboxes[i].checked ? 'checked' : '';
    let key = checkboxes[i].name;
    HTMLstring += `<div><input type="checkbox" id="d${i}" name="${key}" ${checked}><label for="d${i}">${key}</label></div>`; */ 

  }

  

 const defaultValues = values.slice( 0, values.length/2);
 const customValues = values.slice(values.length/2, values.length);
console.log(defaultValues);
console.log(customValues);

  vscode.postMessage({
    command: 'configChange',
    configType: "default",
    configData: defaultValues
  });
  
  

  
  //vscode.setState({HTMLstring});
  //console.log(HTMLstring);
};



window.addEventListener('message', event => {
  const message = event.data; 

  switch (message.command) {
      case 'setParameters':
        let HTMLstring = "";
        let HTMLstring1 = "";
        let HTMLstring2 = "";

        message.parameterKeys.forEach((key, index) => {
          let checked1 = message.defaultConfigData[index] ? 'checked' : '';
          let checked2 = message.configData[index] ? 'checked' : '';
          HTMLstring1 += `<div><input type="checkbox" id="d${index}" name="${key}" ${checked1}><label for="d${index}">${key}</label></div>`;
          HTMLstring2 += `<div><input type="checkbox" id="c${index}" name="${key}" ${checked2}><label for="c${index}">${key}</label></div>`;
        });
        HTMLstring=`<fieldset>` + HTMLstring1 + `</fieldset><fieldset>` + HTMLstring2 + `</fieldset>`;
        document.getElementById("parameters").innerHTML = HTMLstring;

       // vscode.setState({HTMLstring});//zwischenspeichert zustand der offenen html 
      
        break;
  }
});



var defaultSettingsArray = document.getElementById('defaultSettings').addEventListener('click', function(){readsettings();});