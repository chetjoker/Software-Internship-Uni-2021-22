//Server
const http = require('http').createServer();
const port = process.env.PORT || 1000; //process.env.PORT ist für Heroku da PORT dort nicht gewählt werden kann | 1000 ist wenn man die App lokal benutzen möchte

const io = require('socket.io')(http);

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`); //verändern!
});

//import Fkt
testimportfkt = require('./testimport');

io.on("connection", (socket) => {
    console.log('\n1. Das Frontend hat connected\n');

    //hier empfängt server konfigdata von frontend
    socket.on("Beispielkonfig", (fktname, konfigarray) => {    
        console.log("3. erfolgreich Konfig empfangen\n4. Energieconsumption berechnen und senden");

        //import Fkt von csv_rechner
        //Fkt zur Verarbeitung der Daten gibt var energyconsumption zurück

        //schickt energyconsumption an frontend
        socket.emit("energyconsumption", "energy"+testimportfkt.addCon("-"));
    });
});

//cd webserver_nodejs/server_git_for_heroku