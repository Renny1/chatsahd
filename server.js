var express = require('express')
  , http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server, {'heartbeat interval': 5, 'heartbeat timeout' : 10});


      var msg = {
                'id': '',
                'user': '',
                'room': '',
                'text': '',
                'time': '',
                'advice': true
            };

io.on('connection', function(socket){


    socket.on('join:room', function(data){
        var room_name = data.room_name;
        socket.join(room_name);
       
        socket.room = room_name;
        socket.user = data.user;
        
        data.text = data.user + " entrou no chat";

        socket.in(socket.room).emit('entrou', data);
    /*    socket.broadcast.to(socket.room).emit('qtd', io.sockets.adapter.rooms['Chat'].length);*/
        io.in(socket.room).emit('qtd', io.sockets.adapter.rooms['Chat'].length);

        console.log(data.user +" entrou no " +room_name);
    });

/*    socket.on('get:users', function(data){
 
        socket.in(socket.room).emit('qtd', io.sockets.adapter.rooms['Chat'].length);
  
    });*/

    socket.on('leave:room', function(msg){
        msg.text = msg.user + " saiu do chat";
        socket.leave(socket.room);
        if(io.sockets.adapter.rooms['Chat']){
            var teste = io.sockets.adapter.rooms['Chat'].length;
        }else{
            var teste = 0;
        }
        socket.in(msg.room).emit('exit', msg);
        
        socket.in(msg.room).emit('qtd', teste);

         console.log(msg.user +" saiu do " + msg.room);
    });


    socket.on('send:message', function(msg){
        socket.in(msg.room).emit('message', msg);

        
        /*io.sockets.clients('Mapa Um').length*/
    });

      socket.on('disconnect', function() {
        msg.text = socket.user + " saiu do chat";
        socket.leave(socket.room);
        if(io.sockets.adapter.rooms['Chat']){
            var teste = io.sockets.adapter.rooms['Chat'].length;
        }else{
            var teste = 0;
        }
        socket.in(socket.room).emit('exit', msg);
        io.in(socket.room).emit('qtd', teste );

  console.log(socket.user +" saiu do " + socket.room);
        
     /*   socket.broadcast.to(socket.room).emit('saiuMapa', socket.room, socket.username);
        socket.emit('disconnectCanvas', socket.room);*/

        /*delete infoGame[socket.room].players[socket.username];*/
         
        /*  io.sockets.in(socket.room).emit('playerReady', socket.username, false);*/
        /*console.log("DISCONNECT: ", --clientsConnected);*/
        // Remove o username da lista global de usernames

        /*  if (!(socket.room == null)) socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' saiu da sala');*/

      });


});

/*server.listen(8100, "127.0.0.1");*/
server.listen(8080, "127.0.0.1");
console.log("vindo");