
/**
 * Models module dependencies.
 */
var User = require('../models/user'),
    qs = require('querystring'),
    url = require('url');

exports.register = function (req, res, next) {
  var user = new User();

  console.log("method: " + req.method);	
  console.dir(req.body);

  if (req.method === 'POST') { // we have submitted form
  	console.log("form submitted");
    var u = req.body.user;

    user.firstname = u.firstname;
    user.lastname = u.lastname;
    user.email = u.email;
    user.password = u.password;
   
    user.save(function (err) {
      if (err) { // validation failed
        
        
        
        if (~err.toString().indexOf('duplicate key')) {
         if (~err.toString().indexOf('email')) {
            user.password = u.password;
            user.errors = [ 'This email address already exists' ];
          }
        }
        
        console.log("errors on save:" + err.toString());
        console.log(JSON.stringify(err));  
        user.errors = ["Errors while saving user"];
        return res.render('register', { user: user, currentURL:'register' });
      }
      res.redirect('/users'); 
    });
    }
    else {
    res.render('register', { user: user, currentURL:'register' });
  }
};



/**
 * Login action
 */

exports.login = function (req, res, next) {
  var user = new User();
  
  var returnUrl = qs.parse(url.parse(req.url).query).returnUrl;

  if (returnUrl) {
    req.session.returnUrl = returnUrl;
  }

  if (req.body.user) {
    var u = req.body.user;

    User.findOne({ email: u.email }, function (err, user) {
      if (err) return next(err);
      if (!user) {
        u.errors = [ 'Invalid email or password' ];
        return res.render('login', { user: u });
      }
	 
	  
      if (user.password === user.encryptPassword(u.password)) {
        console.log(user);
        req.session.user = user;
        //req.flash('success', 'Successful login.');
        console.log('successful login');

        if (req.session.returnUrl) {
          var returnUrl = req.session.returnUrl;
          delete req.session.returnUrl;
          res.redirect(returnUrl);
        } else {
          res.redirect('/vendors');
        }
      } else {
        u.errors = [ 'Incorrect password' ];
        res.render('login', { user: u });
      }
    });
  } else {
    res.render('login', { user: user });
  }
};







/**
 * View action
 */


exports.view = function (req, res, next) {
  User.find({}).exec(function (err, users) {
    if (err) return next(err);
    if (!users) return next();
    res.render('users', { userData: users, currentURL: '/users' });
  });
};

exports.viewUser = function (req, res, next) {
  var userName = req.params.name;
 // console.log('looking for ' + vendorName);
  User.find({name:userName}).exec(function (err, users) {
    if (err) return next(err);
    if (!users) return next();
    //console.log(vendors);
    res.render('users', { userData: users, currentURL: '/users' });
  });
};



