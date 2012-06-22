var express = require('express');
var connect = require('connect');
var TwitterProsessor = require('./twitter').TwitterProcessor;

var hashtags = [];
var tagCounter = [];

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var twitterProcessor = new TwitterProcessor();
// Home page
app.get('/', function(req, res){
	
	if (req.url != '/favicon.ico') {
	   twitterProcessor.processTweets();
	}
	
  	res.send('getting tweets…'); 
});
// Trends page
app.get('/trends', function(req, res){
	twitterProcessor.getTrends( function(error, trendData){
			res.render('trends.jade',{ locals: {
   				   trends:trendData 
    			}
       		});		
		}
	
	);
});
// Users page
app.get('/users', function(req, res){
	twitterProcessor.getUsers( function(error, userData){
			res.render('users.jade',{ locals: {
   				   users:userData 
    			}
       		});		
		}
	
	);
});
// Process influencer, get influencer twitter name from the query string
app.get('/find/:id', function(req, res){
    
	var user = req.params.id;
	
	if (req.url != '/favicon.ico') {
		twitterProcessor.processLead(user);
	}
	
  	res.send("saved OK. user: " + user);
 
});


// Start server
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
