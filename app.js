var express = require('express');
var connect = require('connect');
var TwitterProsessor = require('./twitter').TwitterProcessor;

var hashtags = [];
var tagCounter = [];

var app = module.exports = express.createServer();

app.configure(function(){
  app.use(express.cookieParser());
  app.use(express.session({secret: 'secret_key'}));
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
	req.session.demo = 'teens';
	twitterProcessor.setDemo('teens');
	res.redirect('/trends');
	
});

// Process tweets
app.get('/tweets', function(req, res){
	
	twitterProcessor.setDemo('teens');

	if (req.url != '/favicon.ico') {
	   twitterProcessor.processTweets();
	}
	
  	res.send('getting tweets…'); 
});

// Trends page
app.get('/trends', function(req, res){
	var sort = req.query.sort || 'count';
	var order = req.query.order || '-1';
	req.session.demo = 'teens';    // remove from this call, set this session var on '/'
	
	twitterProcessor.getTrends( function(error, trendData){
			res.render('trends.jade',{ locals: {
   				   trends:trendData,
   				   currentURL:'/trends/' 
    			}
       		});		
		}
	
	,sort,order);
	
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
				   userCount: userData.length,
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
				   userCount: userData.length,
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
	
	twitterProcessor.processLead(demo,user,function(error){
		res.redirect('/seeds/');	
	});
	
});



// Set dynamic helpers
app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});

// Start server
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
