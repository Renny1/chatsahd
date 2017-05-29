var express = require('express')
  , http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server, {'heartbeat interval': 5, 'heartbeat timeout' : 10});


io.on('connection', function(socket){


    socket.on('join:room', function(data){

    });

    socket.on('leave:room', function(msg){

    });


    socket.on('send:message', function(msg){
       

    });

      socket.on('disconnect', function() {


      });


});

server.listen(8080, "127.0.0.1");
