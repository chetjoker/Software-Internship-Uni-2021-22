const fs = require('fs')

function readConfigParameters(filePath){
  return new Promise(resolve => {
    fs.readFile(filePath, 'utf8' , (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      let zeilen = data.split('\n');
      let ersteZeile = zeilen[0];
      ersteZeile = ersteZeile.replace(/"/g, '');
      let parameters = ersteZeile.split(',');
      
      //Entferne unnötige Einträge
      parameters.shift()
      parameters.pop()
      parameters.pop()

      resolve(parameters);
    });
  });
}
exports.readConfigParameters = readConfigParameters;//exports function


function readAndCalcParameters(eingabeConfig, filePath){
    return new Promise(resolve => {
        fs.readFile(filePath, 'utf8' , (err, data) => {
            if (err) {
              console.error(err);
              return;
            }

            let zeilen = data.split('\n');
            zeilen.shift();//nimmt erste Zeile raus

            //Zwischenspeicher für Berechnungen
            let ersteZeile = zeilen[0].split('"');
            let currentMethodName = ersteZeile[1];
            let currentRuntime = 0;
            let currentEnergy = 0;

            //Rückkgabearray
            let calculatedMethods = [];

            //Gehe Zeile für Zeile durch
            zeilen.forEach((zeile) => {
              if(zeile !== ""){      
                  let zeilenTemp = zeile.split('"');
                  let zeilenMethodenname = zeilenTemp[1];
                  let zeilenarray = zeilenTemp[2].split(',');
                  zeilenarray.shift()
                  zeilenarray.pop()
                  zeilenarray.pop()

                  let zeilenConfig = zeilenarray;

                  //Methodenname der aktuellen Zeile
                  if(currentMethodName !== zeilenMethodenname){
                      //Fertig berechnete Methode wird in Rückgabearray gepusht
                        //console.log(currentMethodName,currentEnergy, currentRuntime);
                      calculatedMethods.push({name: currentMethodName, runtime: currentRuntime, energy: currentEnergy});
                      //Setze CurrentMethodenname auf neue sMethode und resette Runtime und Energy für Neuberechnung
                      currentMethodName = zeilenMethodenname;
                      currentRuntime = 0;
                      currentEnergy = 0;
                  }

                  //Wenn die Zeilenconfig mit der Eingabeconfig passt, dann addiere Werte der Zeile
                  if(configMatches(eingabeConfig, zeilenConfig)){
                      currentRuntime += parseFloat(zeilenarray[zeilenarray.length-2]); //addiere Runtime der Zeile
                      currentEnergy += parseFloat(zeilenarray[zeilenarray.length-1]); //addiere Energy der Zeile
                  }
              }
            });
            resolve(calculatedMethods);
        });
    })
}
exports.readAndCalcParameters = readAndCalcParameters;//exports function

function configMatches(eingabeConfig, zeilenConfig){ //eingabeKonfig vom Frontend | zeilenkonfig sind alle konfigs für die fkt als der csv
  let configsMatch = true;

  for(let i = 0; i < zeilenConfig.length; i++){
    if(eingabeConfig[i] === 1 && parseInt(zeilenConfig[i]) === 1){ //wenn match bei nur einer 1 dann addiere 
      configsMatch = true;
    }
    if(eingabeConfig[i] === 0 && parseInt(zeilenConfig[i]) === 1){ //abbruchbedingung falls in zeilenconfig ne 1 zu viel(missmatch)
          configsMatch = false;
          break;
    }
  }

  return configsMatch;
}

function hotspotDetector(methods, oldConfigMethods){//.runtime, .energy
  let hotspotArray = [];
  for(i=0;i<methods.length;i++){
      if(methods[i].name===oldConfigMethods[i].name){//falls es sich nicht gleicht, fehler im array
          let runtimeHotspot = compareMethodparameters(methods[i].runtime, oldConfigMethods[i].runtime);
          let energyHotspot = compareMethodparameters(methods[i].energy, oldConfigMethods[i].energy);
          if(runtimeHotspot || energyHotspot){
              hotspotArray.push({name: methods[i].name, runtimeHotspot: runtimeHotspot, energyHotspot: energyHotspot}); //{name, runtime?, energy?}
          }
      }
  }
  return hotspotArray;
}
exports.hotspotDetector = hotspotDetector;//exports function

function greenspotDetector(methods, oldConfigMethods){//.runtime, .energy
  let greenspotArray = [];
  for(i=0;i<methods.length;i++){
      if(methods[i].name===oldConfigMethods[i].name){//falls es sich nicht gleicht, fehler im array
          let runtimeGreenspot = compareMethodparameters(methods[i].runtime, oldConfigMethods[i].runtime);
          let energyGreenspot = compareMethodparameters(methods[i].energy, oldConfigMethods[i].energy);
          if(runtimeGreenspot || energyGreenspot){ //runtime- oder energyhotspot
            greenspotArray.push({name: methods[i].name, runtimeGreenspot: runtimeGreenspot, energyGreenspot: energyGreenspot}); //{name, runtimeHotspot?: true/false, energyHotspot?: true/false}
          }
      }
  }
  return greenspotArray;
}
exports.greenspotDetector = greenspotDetector;//exports function

function compareMethodparameters(wertNeu, wertAlt){
  if(wertNeu>0 && wertAlt>0){//wenn vorher negative oder danach, kann keine aussage getroffen werden
    if(wertNeu>wertAlt){ //für Hotspots
      if((parseFloat(wertNeu)/parseFloat(wertAlt))>=1,5){//50% steigerung oder mehr
        return true;
      }
    }
    if(wertNeu<wertAlt){ //für Greenspots
      if((parseFloat(wertNeu)/parseFloat(wertAlt))<=0,5){//50% niedriger oder mehr
        return true;
      }
    }
  }
  return false;
}