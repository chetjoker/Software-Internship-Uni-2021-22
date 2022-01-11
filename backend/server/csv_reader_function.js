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

                //Methodenname der aktuellen Zeile
                
                let zeilenConfig = zeilenarray.slice(1,24); //[1] bis [23] genommen = ganze konfig


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
                    currentRuntime += parseFloat(zeilenarray[24]); //addiere Runtime der Zeile
                    currentEnergy += parseFloat(zeilenarray[25]); //addiere Energy der Zeile
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

//readAndCalcParameters([1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "./model_kanzi_method_level.csv");
