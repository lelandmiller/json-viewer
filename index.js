'use strict';



var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cycle = require('cycle');
var _ = require('lodash');

var debugData = [];
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
    var newobj = cycle.decycle(debugData);
    res.json(newobj);
});
/*
io.on('connection', function() {
    //console.log('a user connected');
});
*/

http.listen(3000, function() {
    console.log('debugger listening on *:3000');
});

function sendDebugData(data) {
    debugData = data;
    //TODO does need?
    io.emit('update');
}


// Contains a list of javascript objects { 'plugin': , 'pages':, 'metalsmith': }
// with data post application of the plugin.

function makeDebugObject(name, pages, metalsmith) {
    var newPages = _.forEach(_.clone(pages, true), function (val) {
        val.contents = val.contents.toString();
    });
    return {
        plugin: name,
        pages: newPages,
        metalsmith: _.clone(metalsmith, true)
    };
}

function applyDebug(metalsmith) {
    var originalUse = metalsmith.use;
    var originalBuild = metalsmith.build;
    var debuggingData = [];

    var firstPluginOfBuild = true;
    var pluginCount = 1;

    // TODO implement name argument
    metalsmith.use = function(plugin, name) {
        var injectedPlugin,
            pluginName = name || 'Plugin #' + pluginCount;


        if (plugin.length < 3) {
            injectedPlugin = function(pages, metalsmith) {
                plugin(pages, metalsmith);
                debuggingData.push(makeDebugObject(pluginName, pages, metalsmith));
            };
        } else if (plugin.length === 3) {
            injectedPlugin = function(pages, metalsmith, done) {
                plugin(pages, metalsmith, function() {
                    debuggingData.push(makeDebugObject(pluginName, pages, metalsmith));
                    done();
                });
            };
        } else {
            throw new Error('Invalid plugin argument length');
        }

        originalUse.call(metalsmith, injectedPlugin);
        firstPluginOfBuild = false;
        pluginCount++;
        return metalsmith;
    };

    metalsmith.build = function(callback) {
        originalBuild.call(metalsmith, callback);
        firstPluginOfBuild = true;
        sendDebugData(debuggingData);
        debuggingData = [];
        return metalsmith;
    };

    return metalsmith;
}

module.exports = applyDebug;
