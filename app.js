var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express3-handlebars');
var routes = require('./routes/index');
var users = require('./routes/users');
var Pusher = require( 'pusher' );

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', exphbs({defaultLayout: 'main', extname: '.html'}));
app.set('view engine', '.html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Pusher
var pusher = new Pusher({ 
	appId: '88652', 
	key: '42e2e3f640922831c34d', 
	secret: '5a58d27cae3a3bb84031' 
});
app.post('/pusher/auth', function( req, res ) {
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  var auth = pusher.authenticate( socketId, channel );
  res.send( auth );
});
app.post('/trigger', function( req, res ) {
	pusher.trigger('private-mousemoves', 'client-mouse-moved', req.body);
	res.send(200);
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  socket.on('mouse', function(msg){
    io.emit('mouse', msg);
  });
});

http.listen(80, function(){
  console.log('listening on *:80');
});


module.exports = app;
