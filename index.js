'use strict';


var readlineSync = require('readline-sync')
var fs = require('fs');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');

var dataSet = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/jsontree.css', function(req, res) {
    res.sendFile(__dirname + '/public/jsontree.css');
});
app.get('/jsontree.js', function(req, res) {
    res.sendFile(__dirname + '/public/jsontree.js');
});
app.get('/data.json', function(req, res) {
    res.json(dataSet);
});
/*
io.on('connection', function() {
    //console.log('a user connected');
});
*/

http.listen(3000, function() {
    console.log('debugger listening on *:3000');
});


function update() {
    //TODO does need?
    io.emit('update');
}




function loadFile(path) {
    console.log('loadFile(', path, ')')
    fs.readFile(path, 'utf8', function(err, data) {
        if (err) {
            console.log(err);
            return;
        }

        var s = data.split('\n');
        var out = [];
        _.forEach(s, function(n, key) {
            if (n.toString().trim().length > 0) {
                try {
                    var o = JSON.parse(n.toString());
                    //console.log(o);
                } catch (e) {
                    console.log(e);
                    console.log(n);
                }
                out.push(o);
            }
        });
        dataSet = out;
        //console.log(dataSet);
        update();
    });
}

//loadFile('/home/lelandmiller/p.json')
if (process.argv.length > 2) {
    loadFile(process.argv[2])
}
var readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('> ');
rl.prompt();
rl.on('line', function(line) {
    var s = line.split(' ');
    switch (s[0]) {
        case 'load':
            loadFile(s[1]);
            break;
    }
    rl.prompt();
}).on('close', function() {
    process.exit(0);
});
