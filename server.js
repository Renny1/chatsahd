#!/bin/env node
 //  OpenShift sample Node application
var express = require('express');
var fs = require('fs');


var SampleApp = function() {
    var self = this;
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 0.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 0.0.0.0');
            self.ipaddress = "0.0.0.0";
        };
    };

    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = {
                'index.html': ''
            };
        }
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };
    self.cache_get = function(key) {
        return self.zcache[key];
    };

    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };

    self.setupTerminationHandlers = function() {
        //  Process on exit and signals.
        process.on('exit', function() {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() {
                self.terminator(element);
            });
        });
    };
    self.createRoutes = function() {
        self.routes = {};
        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html'));
        };
    };

    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        var http = require('http');
        var app = express();
        var server = http.createServer(app);
    };

    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();
        self.initializeServer();
    };

    self.start = function() {
      console.log("trying");
        //  Start the app on the specific interface (and port).
        self.server = self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
        self.io = require('socket.io').listen(self.server);

        var room = "Home";
        var users = [];

        self.io.on('connection', function(socket) {

       
              socket.on('chat message', function(msg){
                self.io.emit('chat message', msg, socket.user);
              });


            socket.on('join:room', function(data) {

                socket.join(room);
                socket.room = room;

                socket.id = data.id;
                socket.user = data.user;

                if(users.indexOf(data.id) != 0){
                     users.push(data.id);
                }
                
                self.io.in(socket.room).emit('users', users);

            });
         

            socket.on('disconnect', function() {
              
                var index = users.indexOf(socket.id);
                if (index >= 0) {
                  users.splice( index, 1 );
                }

                socket.leave(socket.room);

                self.io.in(socket.room).emit('users', users);

            });
        });
    };
}; 

var zapp = new SampleApp();
zapp.initialize();
zapp.start();


  //self.io.sockets.adapter.rooms[room]