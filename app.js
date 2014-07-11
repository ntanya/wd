var express = require('express');
//var connect = require('connect');
var mongoose = require('mongoose');


var mongostr = 'mongodb://tanya:tanya@ds037637.mongolab.com:37637/wedding';


mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});




var routes = require('./routes');
var Vendor = require('./models/vendor');




var vendorProsessor = require('./vendors').VendorProcessor;
//var mongostore = require('connect-mongo');

var app = module.exports = express.createServer();//(express.basicAuth(authorize));
//var MemStore = express.session.MemoryStore;

app.configure(function(){
app.use(express.cookieParser());
	

  app.use(express.static(__dirname + '/public'));
  //app.use(express.session({secret: 'secret_key', store: MemStore({reapInterval: 60000 * 10})}));
  //app.use(express.session({secret:'asdfadsf'},mongodb_session_store_config()));
  //app.use(express.session(mongodb_session_store_config()));
  

  
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: true});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.set('port',process.env.PORT || 3000);
});




var vendorProcessor = new VendorProcessor();


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('host','localhost');
  //app.set('mongostr','mongodb://localhost/wedding');
  app.set('mongostr', 'mongodb://tanya:tanya@ds037637.mongolab.com:37637/wedding');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('host', 'stormy-fire-6148.herokuapp.com');
  app.set('mongostr','mongodb://tanya:tanya@ds033757.mongolab.com:33757/heroku_app5667663');
});


// Home page
app.get('/', function(req, res){
	res.render('home.jade',{ locals: {
			currentURL:'/' 
    	}
    });	
});



// vendor categories
app.get('/vendors', function(req, res){

	var sort = req.query.sort || 'count';
	var order = req.query.order || '-1';
	var category = '';
	
  	vendorProcessor.getVendors(function(error, vendorData){
  				console.log(vendorData);
				res.render('vendors.jade',{ locals: {
						   vendorData: vendorData,	
						   currentURL:'/vendors/' 
					}
		   		});		
			}
		
		,sort,order);

});


// vendor details
app.get('/vendors/:id', function(req, res){

	var id = req.params.id;
	console.log('found id:' + id); 
	
  	vendorProcessor.getVendorById(function(error, vendorData){
  				console.log(vendorData);
				res.render('vendors.jade',{ locals: {
						   vendorData: vendorData,	
						   currentURL:'/vendors/' 
					}
		   		});		
			}, id);

});



app.get('/register/', function(req,res){
	res.render('register.jade',{locals:{currentURL:'/register/' }});

});
app.post('/register', routes.user.register);


/*

// vendor details listing
app.get('/vendors/', function(req, res){
	
  	res.render('vendors.jade',{ locals: {
    	}
    });	
});

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


