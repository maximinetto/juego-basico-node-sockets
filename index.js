var handler = function(req, res) {
    fs.readFile('./page.html', function (err, data) {
        if(err) throw err;
        res.writeHead(200);
        res.end(data);
    });
}

var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

var session = require('express-session');

var sharedsession = require("express-socket.io-session");

var FileStore = require('session-file-store')(session);
var fileStoreOptions = {};

var sessionMiddleware = session(
{
    store: new FileStore(fileStoreOptions),
    secret: 'ultrasecreto',
    resave: true,
    saveUninitialized: true
});


app.use(sessionMiddleware);
 
// Use shared session middleware for socket.io
// setting autoSave:true
io.use(sharedsession(sessionMiddleware));

const startGame = require('./users');
startGame(io);

var fs = require('fs');
var port = 8000;

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/page.html');
});

server.listen(port, () => {
    console.log("Server on PORT: ", port)
});
