// Settings

var PORT=3000,                // Server port
    LOGLEVEL=0,               // Log level
    CLIENTROOT="../client/",  // Game client path
    ROOMTIMELIMIT=1200000;    // Autoclose rooms after 20 minutes of no join in/out

// Initialization

var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    os = require('os'),
    netplayserver = require(CLIENTROOT+"js/netplay-server.js");

// Webapp server

var app = http.createServer(function (request, response) {

    var filePath = '.' + request.url.replace(/\?.*/,"");
    if (filePath == './')
        filePath = './index.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
         case '.svg':
            contentType = 'image/svg+xml';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
        case '.ogg':
            contentType = 'audio/ogg';
            break;
        case '.mp4':
            contentType = 'audio/mp4';
            break;
    }

    fs.readFile(CLIENTROOT+filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end(); 
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});

// Socket server

var io = require('socket.io')(app);
var netplayServer=new netplayserver.NetplayServer({
    logLevel:LOGLEVEL,
    roomTimeLimit:ROOMTIMELIMIT,
    netcodes:netplayserver,
    sendToPlayer:function(socket,type,data) {
        socket.emit(type,data);
    }
});

// Server core

io.on('connection', function(socket) {

    netplayServer.log(2,"<connect>","-",socket.id);
    
    socket.on(netplayserver.NETCODE_JOINROOM, function (data) {
        netplayServer.log(2,"joinRoom","-",netplayServer.joinRoom(data[0],data[1],data[2],socket.id,socket));
    });

    socket.on(netplayserver.NETCODE_LEAVEROOM, function () {
        netplayServer.log(2,"leaveRoom","-",netplayServer.leaveRoom(socket.id));
    });

    socket.on(netplayserver.NETCODE_SETCONFIRM, function (data) {
        netplayServer.log(3,"setConfirm","-",netplayServer.setConfirm(socket.id,data));
    });

    socket.on(netplayserver.NETCODE_FREEZEROOM, function (data) {
        netplayServer.log(3,"freezeRoom","-",netplayServer.freezeRoom(socket.id,data));
    });

    socket.on(netplayserver.NETCODE_UPDATESETUP, function (data) {
         netplayServer.log(3,"updateSetup","-",netplayServer.updateSetup(socket.id,data));
    });

    socket.on(netplayserver.NETCODE_BROADCAST, function (data) {
        netplayServer.broadcast(socket.id,netplayserver.NETCODE_DATA,data);
    });

    socket.on(netplayserver.NETCODE_SENDEVENT, function (data) {
        netplayServer.send(data[0],netplayserver.NETCODE_EVENT,data[1]);
    });

    socket.on("disconnect", () => {
        netplayServer.log(2,"<disconnect>","-",socket.id);
        netplayServer.leaveRoom(socket.id);
    });

});

setInterval(function(){
   netplayServer.flushRooms();
},10000)

const nets = os.networkInterfaces();

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal)
            netplayServer.log(0,"<startup>","-","Server ready at http://"+net.address+":"+PORT);
    }
}

app.listen(PORT);