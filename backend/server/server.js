//import Fkt
import_csv_reader = require('./csv_reader_function');
//compare arrays
const sortArray = require('sort-array')
//Server
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.post('/getMethodParameters', async (req, res) => {
  if(req.body.config && req.body.greenidePackage && req.body.oldConfig){ // && req.body.oldConfig
    //test alteconfig
    req.body.oldConfig = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    let hotspotRuntime = [];
    let hotspotEnergy = [];

    let methods = await import_csv_reader.readAndCalcParameters(req.body.config, "./" + req.body.greenidePackage + ".csv"); //neue config

    if( req.body.oldConfig.length>0 && !arrayEquals(req.body.oldConfig, req.body.config) ){
      let oldConfigMethods = await import_csv_reader.readAndCalcParameters(req.body.oldConfig, "./" + req.body.greenidePackage + ".csv"); //alte config wird berechnet
      let comparisonArray = await import_csv_reader.compareNewOld(methods ,oldConfigMethods); //Aufbau: Array={Element1,...}; Element1={name: string, runtimeHotspot: (new/old), energyHotspot: (new/old)}
      hotspotRuntime = sortArray(comparisonArray,  //array ist wie comparisonarray aufgebaut nur nach hotspots geordnet
                               {by: 'compare', 
                                order: 'desc', //descending order
                                computed: { compare: comparisonArray => comparisonArray.runtimeSpot}} //runtime ist die Vergleichsgröße
                              ); 
      hotspotEnergy = sortArray(comparisonArray,  //array ist wie comparisonarray aufgebaut nur nach hotspots geordnet
                                {by: 'compare', 
                                 order: 'desc', //descending order
                                 computed: { compare: comparisonArray => comparisonArray.energySpot}} //runtime ist die Vergleichsgröße
                               ); 
    }
    res.send({methods: methods, hotspotRuntime: hotspotRuntime, hotspotEnergy: hotspotEnergy});//sendet methodArray, hotspotruntime und -energy(für greenspots muss hotspot nur reversed werden)
  }else{
    res.send("config not found");  
  }
})

app.post('/getParameters', async (req, res) => {
  if(req.body.greenidePackage){
    //Read config parameters from greenidePackage.csv
    parameters = await import_csv_reader.readConfigParameters("./" + req.body.greenidePackage + ".csv");

    res.send(parameters)
  }
})

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})

function arrayEquals(array1, array2){
  let isEqual = true
  if(array1.length === array2.length){
    array1.forEach((element, index) => {
      if(element !== array2[index]){
        isEqual=false;
      }
    });
  } else {
    isEqual=false;
  }
  return isEqual;
}