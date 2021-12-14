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
  console.log(req.body);//gibt empfangene config in console aus
  if(req.body.config){
    let methods = await import_csv_reader.readAndCalcParameters(req.body.config, "./model_Kanzi_Method_Level.csv");
    res.send(methods);
  }else{
    res.send("config not found");  
  }
})

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})

//cd webserver_nodejs/server_git_for_heroku