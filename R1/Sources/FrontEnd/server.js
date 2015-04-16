'use strict';

// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');

// Start app
var app = express();

// all environments
app.set('port', process.env.PORT || 10080);
app.use(express.logger('dev'));

app.use(express.static(path.join(__dirname, '\\dist')));

app.get('/stopServer', function(req, res) {
    console.log('Express server closing on port ' + app.get('port'));
    res.send('closed');
    // load the single view file (angular will handle the page changes on the front-end)
    process.exit(1);
});

// application -------------------------------------------------------------
app.get('*', function(req, res) {
    // load the single view file (angular will handle the page changes on the front-end)
    res.sendfile(path.join(__dirname , '\\dist\\index.html'));
});



//start server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

