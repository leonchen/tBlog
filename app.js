
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http');
var config = require('./config');

var app = express();

var MOBILE_USER_AGENT_REGEXP = new RegExp('Android|webOS|iPhone|iPad|iPod|BlackBerry', 'i'); 

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());

  app.use(function(req, res, next) {
    res.locals.site = config.site;
    res.locals.fromMobile = MOBILE_USER_AGENT_REGEXP.test(req.headers['user-agent']);
    next();
  });


  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./routes')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
