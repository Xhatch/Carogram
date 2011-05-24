// Server configuration
var express = require('express');
var app = express.createServer();

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});

app.set('view engine', 'jade');
app.set('view options', { layout: false });

// Instagram configuration
var instagram = require('instagram-node-lib');
instagram.set('client_id', '104378f7c76843c78ea0e83339bb9054');
instagram.set('client_secret', '7fa73de3ef5649e294f89f54f7962dc0');

// Main
app.get('/', function(req, res){
  res.render('index');
});

// Login
app.get('/login', function(req, res) {
  res.render('login');
});

// POST /media/{media-id}/comments
app.post('/media/:mediaId/comments', function(req, res) {
  //console.log('Commenting on mediaId: ' + req.params.mediaId + ': ' + req.body.text);
  //console.log('access_token: ' + req.body.access_token);
  //res.end();
  
  instagram.set('access_token', req.body.access_token);
  instagram.media.comment({
    media_id: req.params.mediaId, text: req.body.text, callback: req.body.callback,
    complete: function(data, pagination){
      // data is a javascript object/array/null matching that shipped Instagram
      // when available (mostly /recent), pagination is a javascript object with the pagination information
      res.send(data);
    },
    error: function(errorMessage, errorObject, caller){
      // errorMessage is the raised error message
      // errorObject is either the object that caused the issue, or the nearest neighbor
      // caller is the method in which the error occurred
    }
  });
});

app.listen(3000);
console.log('Express started on port 3000');