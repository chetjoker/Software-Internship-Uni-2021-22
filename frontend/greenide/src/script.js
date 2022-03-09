const vscode = acquireVsCodeApi();

var dcon = false;							//Voreinstellung kanzi
var kanzion = true;
var r = document.getElementById("d");				
   r.style.display = "none";

function readsettings() {


  if(dcon)
	var spanid = document.getElementById('d');			// checkboxen als array abgespeichert
	else if(kanzion)
	var spanid = document.getElementById('k')
	
	const checkboxes = Array.from(spanid.querySelectorAll('input[type="checkbox"]'));  
	
	var values=[];										

for (var i = 0; i < checkboxes.length; i++) {
		(checkboxes[i].checked) ? values[i] = 1 : values[i] = 0;     
    }
var ausgabe = "";
for (var j = 0; j < values.length-1; j++) {
ausgabe += values[j] + ",";
}

document.getElementById('result').innerHTML = ausgabe + values[values.length-1];
  vscode.postMessage({
    command: 'configChange',
    text: ausgabe + values[values.length-1]
  })
	
    return values;
	
}

function programmwechsel(nummer){		 // wechsel zwischen kanzi / dc durch radiobuttons
 if(nummer===1){
 if(!dcon){
kanzion=false;
dcon=true;
 var s = document.getElementById("d");
   s.style.display = "";
 var t = document.getElementById("k");
   t.style.display = "none";
 }}else if(nummer===0){
 if(!kanzion){
 kanzion=true;
dcon=false;
 var u = document.getElementById("k");
   u.style.display = "";
   var v = document.getElementById("d");
   v.style.display = "none";
 }}
  
return false;
}


var defaultSettingsArray = document.getElementById('defaultSettings').addEventListener('click', function(){readsettings()});				//Eventlistener
document.getElementById('dc').addEventListener('click', function(){programmwechsel(1)});
document.getElementById('kanzi').addEventListener('click', function(){programmwechsel(0)});

