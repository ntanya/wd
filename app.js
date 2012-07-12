var express = require('express');
var connect = require('connect');
var connect_mongodb = require('connect-mongodb');

var TwitterProsessor = require('./twitter').TwitterProcessor;
var UserProsessor = require('./user').UserProcessor;

var app = module.exports = express.createServer();
//var MemStore = express.session.MemoryStore;

app.configure(function(){
  app.use(express.cookieParser());
  
  
  var mongodb_session_store_config = function() {
		var obj = {
			dbname: "datacoll",
			host: "ds033757.mongolab.com",
			port: 33757,
			username: "tanya",
			password: "tanya"
		};

		return {
			store: connect_mongodb(obj)
		};
	};
	
	
  
  app.use(express.static(__dirname + '/public'));
  //app.use(express.session({secret: 'secret_key', store: MemStore({reapInterval: 60000 * 10})}));
  app.use(express.session({secret: 'secret_key'}, {store:mongodb_session_store_config()}));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: true});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
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
  app.set('mongostr','mongodb://tanya:tanya@ds033757.mongolab.com:33757/heroku_app5667663');
});

var twitterProcessor = new TwitterProcessor();
twitterProcessor.setDemo('teens');

// Home page
app.get('/', function(req, res){
	req.session.demo = 'teens';
		res.redirect('/trends');
});

// Process tweets
app.get('/tweets', function(req, res){
	req.session.demo = 'teens';
	//twitterProcessor.setDemo('teens');
	
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
	//req.session.demo = 'teens';    // remove from this call, set this session var on '/'
	var demo = req.session.demo;
	
	twitterProcessor.getTrends(demo, function(error, trendData){
			res.render('trends.jade',{ locals: {
   				   trends:trendData,
   				   currentURL:'/trends/' 
    			}
       		});		
		}
	
	,sort,order);
	
});
// Trends chart
app.get('/trends/chart', function(req, res){
	var sort = req.query.sort || 'count';
	var order = req.query.order || '-1';

	twitterProcessor.getTrends( function(error, trendData){
			res.render('trends_chart.jade',{ locals: {
   				   trends:trendData,
   				   currentURL:'/trends/' 
    			}
       		});		
		}
	
	,sort,order);
});


// AJAX functions
app.get('/users/ajax/updateMonitor/', function(req, res){
	var user = req.query.username;
	var val = (req.query.value==="true" || req.query.value===true)?true:false;
	var demo = twitterProcessor.getDemo();
	
	console.log('user:' + user + ', demo: ' + demo + ', value: ' + val);
	
	twitterProcessor.updateUserMonitorStatus(user,val,demo, function(error, status){
	}
	
	);
});

app.get('/ajax/updateDemo/', function(req, res){
	var val = req.query.value;
	req.session.demo = val;
	req.session.save();
	twitterProcessor.setDemo(val, function(){
		console.log('new demo set: ' + val);
	    res.send('ok');
	});
});




// Users page
app.get('/users', function(req, res){
	var demo = req.session.demo;
	twitterProcessor.getUsers(demo, function(error, userData){
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
    var demo = req.session.demo;	
	twitterProcessor.getLeads(demo, function(error, userData){
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
app.get('/leads/ajax/addLead', function(req, res){
	var user = req.query.username;
	var demo = req.query.demo;
	
	twitterProcessor.processLead(demo,user,function(error){
		res.send('OK');	
	});
	
});


/*-------- user functions ------------*/

/*---------- oauth -------------- */

var OAuth= require('oauth').OAuth;

var oa = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	"1R1u05nFw3JJzRd0I4e9DQ",
	"NGcpCTd4NziRW7Bs8HQIzaCqNuipdf98UhXdrZAQ",
	"1.0",
	"http://localhost:3000/auth/twitter/callback",
	"HMAC-SHA1"
);

app.get('/register', function(req, res){
	
 	res.render('register.jade',{ locals: {
   		  currentURL:'/register',
    	}
    });	
});

app.get('/auth/twitter', function(req, res){
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if (error) {
			console.log(error);
			res.send("yeah no. didn't work.")
		}
		else {
			req.session.oauth = {};
			req.session.oauth.token = oauth_token;
			console.log('oauth.token: ' + req.session.oauth.token);
			req.session.oauth.token_secret = oauth_token_secret;
			console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
	}
	});
});


app.get('/auth/twitter/callback', function(req, res, next){
	if (req.session.oauth) {
		req.session.oauth.verifier = req.query.oauth_verifier;
		var oauth = req.session.oauth;

		oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
		function(error, oauth_access_token, oauth_access_token_secret, results){
			if (error){
				console.log(error);
				res.send("yeah something broke.");
			} else {
				req.session.oauth.access_token = oauth_access_token;
				req.session.oauth,access_token_secret = oauth_access_token_secret;
				console.log(results);
				// save to DB, set session variables
				req.session.loggedin = true;
				res.redirect("/");
			}
		}
		);
	} else
		next(new Error("you're not supposed to be here."))
});




/*--- cron --- */
/*
var cronJob = require('cron').CronJob;
new cronJob('0 * * * * *', function(){
    console.log('------------------------- Cron called');
    console.log('processRunning: ' + twitterProcessor.processRunning + ', getDemo: ' + twitterProcessor.getDemo());
    if((twitterProcessor.processRunning===false && twitterProcessor.getDemo())){
    	console.log('------------------------- Cron executing...');
  		//twitterProcessor.processTweets();
  	}
	
}, null, true);
*/


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

