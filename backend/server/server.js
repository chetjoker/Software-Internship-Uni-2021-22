//import Fkt
import_csv_reader = require('./csv_reader_function');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.post('/getMethodParameters', async (req, res) => {
  if(req.body.config && req.body.greenidePackage){ // && req.body.oldConfig
    //test alteconfig
    let oldConfig = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

    let methods = await import_csv_reader.readAndCalcParameters(req.body.config, "./" + req.body.greenidePackage + ".csv");
    let hotspotArray = await 

    res.send({methods: methods, hotspotArray: hotspotArray});
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

 
