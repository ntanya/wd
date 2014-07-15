
var express = require('express');
var mongoose = require('mongoose');

var config = require('./config.json');

var app = module.exports = express.createServer();//(express.basicAuth(authorize));
//var MemStore = express.session.MemoryStore;

app.configure(function(){
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
	

  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: true});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  //app.set('port',process.env.PORT || 3000);
});


app.configure(function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('host',config.host);
  app.set('port', config.port);
  app.set('mongostr', config.db);
});
/*
app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('host', 'wd.tanyanam.com');
  app.set('port', 19215);
  app.set('mongostr', 'mongodb://tanya:tanya@ds037637.mongolab.com:37637/wedding');
});

*/



// Route middlewares

/**
 * Checks if user is logged in.
 */

function loginRequired(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.returnUrl = req.url;
    return res.redirect('/login');
  }
}







/* ---------   ROUTES ---------*/

// Home page
app.get('/', function(req, res){
	res.render('home',{ locals: {
			currentURL:'/' 
    	}
    });	
});



var routes = require('./routes');


/**
 * Vendor routes.
 */

app.get('/create', routes.vendor.create);
app.post('/create', routes.vendor.create);

/**
 * View vendor route.
 */

app.get('/vendors', routes.vendor.view);
app.get('/vendors/:name', routes.vendor.viewVendor);


/*  View users */
app.get('/users', routes.user.view);
app.get('/register', routes.user.register);
app.post('/register', routes.user.register);

/**
 * Login user route.
 */

app.get('/login', routes.user.login);
app.post('/login', routes.user.login);

/**
 * Logout user route.
 */

app.get('/logout', routes.user.logout);




/* Reviews */
app.get('/reviews/add', routes.review.add);
app.post('/reviews/add', routes.review.add);


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


