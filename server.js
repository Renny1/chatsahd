//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan');
    
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

module.exports = app ;

        app = express.createServer();

        var http = require('http');
        
        var app = express();
        
        var server = http.createServer(app);


        server = app.listen(port, ip, function() {
            console.log('%s: Node server 2 started on %s:%d ...',
                Date(Date.now()), ip, port);
        });

        io = require('socket.io').listen(server);


        var room = "Home";
        var users = [];
        var msgs = [];


	    io.on('connection', function(socket) {

              socket.on('chat message', function(msg){

                io.emit('chat message', msg, socket.user);
              
                   var nameSepare = socket.user.split(" ");
                   msgs.unshift("<b>" + nameSepare[0] + " "  + nameSepare[1] + "</b>: " + msg);

                    if(msgs.length > 35){
                        msgs.splice(-1,1);
                    }
              });

            socket.on('join:room', function(data) {

                socket.join(room);
                socket.room = room;

                socket.id = data.id;
                socket.user = data.user;

                if(users.indexOf(data.id) != 0){
                     users.push(data.id);
                }
                
                io.in(socket.room).emit('users', users);
                socket.to(socket.room).emit('updateMessages', msgs);

            });

            socket.on('disconnect', function() {
              
                var index = users.indexOf(socket.id);
                if (index >= 0) {
                  users.splice( index, 1 );
                }

                socket.leave(socket.room);

                io.in(socket.room).emit('users', users);

            });
		});


/*app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
*/
