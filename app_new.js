var express = require('express');
var mongoose = require('mongoose');


var app = module.exports = express.createServer();//(express.basicAuth(authorize));
//var MemStore = express.session.MemoryStore;

app.configure(function(){
app.use(express.cookieParser());
	

  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: true});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  //app.set('port',process.env.PORT || 3000);
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('host','localhost');
  //app.set('mongostr','mongodb://localhost/wedding');
  app.set('port', 3000);
  app.set('mongostr', 'mongodb://tanya:tanya@ds037637.mongolab.com:37637/wedding');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('host', 'wd.tanyanam.com');
  app.set('port', 19215);
  app.set('mongostr', 'mongodb://tanya:tanya@ds037637.mongolab.com:37637/wedding');
});



/* ---------   ROUTES ---------*/

// Home page
app.get('/', function(req, res){
	res.render('home',{ locals: {
			currentURL:'/' 
    	}
    });	
});



var routes = require('./routes');
var Vendor = require('./models/vendor');


/**
 * Vendor routes.
 */

app.get('/register', routes.vendor.register);
app.post('/register', routes.vendor.register);

/**
 * View user route.
 */

app.get('/vendors', routes.vendor.view);
app.get('/vendors/:name', routes.vendor.viewVendor);





// Set dynamic helpers
app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});

// Start server
/*app.listen(app.settings.port, function() {
  console.log("Listening on " + app.settings.port);
});
*/

// Start server
app.listen(19215, function() {
  console.log("Listening on 19215");
});


