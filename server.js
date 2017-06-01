//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan'),
/*    http = require('http'),
    server = http.createServer(app),*/

  server = require('http').Server(app),

	io = require('socket.io').listen(server);
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on 2 http://%s:%s', ip, port);

module.exports = app ;

      var msg = {
                'id': '',
                'user': '',
                'room': '',
                'text': '',
                'time': '',
                'advice': true
            };

io.on('connection', function(socket){

console.log("conectando");

socket.on('connect', function() {
console.log("Alguem Conectou 1");
});

   socket.on('join:room', function(data){
      console.log("Alguem Conectou 2");
        var room_name = data.room_name;
        socket.join(room_name);
        socket.room = room_name;
        socket.user = data.user;
        data.text = data.user + " entrou no chat";
        socket.in(socket.room).emit('entrou', data);
        io.in(socket.room).emit('qtd', io.sockets.adapter.rooms['Chat'].length);
        console.log(data.user +" entrou no " +room_name);

    });

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
      });
});
console.log('Rodando');
//server.listen(8080, "127.0.0.1");
