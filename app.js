var express = require('express');
var connect = require('connect');
var TwitterProsessor = require('./twitter').TwitterProcessor;


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
  app.set('port',process.env.PORT || 3000);
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('host','localhost');
  app.set('mongostr','mongodb://localhost/dataintel');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('host', 'stormy-fire-6148.herokuapp.com');
  app.set('mongostr','mongodb://tanya:tanya@ds033897.mongolab.com:33897/heroku_app5667663');
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
	
  	res.render('tweets.jade',{ locals: {
   		  currentURL:'/tweets/',
   		  host: app.settings.host, 
   		  port:app.settings.port
    	}
    });	
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


/*--- cron --- */
var cronJob = require('cron').CronJob;
new cronJob('0 * * * * *', function(){
    console.log('------------------------- Cron initiated');
    if(!twitterProcessor.processRunning && twitterProcessor.getDemo()){
  		twitterProcessor.processTweets();
  	}
	
}, null, true);



// Set dynamic helpers
app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});

// Start server
app.listen(app.settings.port, function() {
  console.log("Listening on " + app.settings.port);
});


/*----- sockets ---------- */
twitterProcessor.clients = [];

io = require('socket.io').listen(app);
io.sockets.on('connection', function (socket){
  twitterProcessor.clients.push(socket);
  console.log("socket client connected");
});

