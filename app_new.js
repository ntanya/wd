var express = require('express');
var connect = require('connect');
var TwitterProsessor = require('./twitter').TwitterProcessor;

var hashtags = [];
var tagCounter = [];

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: true});
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
   				   trends:trendData,
   				   currentURL:'/trends/' 
    			}
       		});		
		}
	
	);
});

// AJAX request to set "monitor" bit in users collection
app.get('/users/updateMonitor/', function(req, res){
	var user = req.query.username;
	var val = req.query.value;
	
	twitterProcessor.updateUserMonitorStatus(user,val, function(error, status){
	}
	
	);
});

// Users page
app.get('/users', function(req, res){
	twitterProcessor.getUsers( function(error, userData){
			res.render('users.jade',{ locals: {
   				   users:userData,
   				   currentURL:'/users/' 
    			}
       		});		
		}
	);
});


// Seeds page
app.get('/seeds', function(req, res){
	twitterProcessor.getLeads( function(error, userData){
			res.render('leads.jade',{ locals: {
   				   users:userData,
   				   currentURL:'/seeds/' 
    			}
       		});		
		}
	);
});

// Add seed
app.get('/seeds/add', function(req, res){
	res.render('add_lead.jade',{ locals: {
   		currentURL:'/seeds/' 
        }
    });	
});

// Process lead(seed)
app.get('/seeds/process', function(req, res){
	var user = req.query.username;
	var demo = req.query.demo;
	
	twitterProcessor.processLead(demo,user,function(error, userData){
		//res.redirect('/seeds/');	
	});
	res.redirect('/seeds/');
});



// Process influencer, get influencer twitter name from the query string
app.get('/users/find/:id', function(req, res){
    
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
