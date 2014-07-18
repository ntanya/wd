
/**
 * Models module dependencies.
 */
var Vendor = require('../models/vendor');


exports.create = function (req, res, next) {
  var vendor = new Vendor();

  console.log("method: " + req.method);	
  console.dir(req.body);
  console.log("req body vendor: " + req.body.vendor);	

  if (req.body.vendor) { // we have submitted form
  	console.log("form submitted");
    var u = req.body.vendor;

    vendor.name = u.name;
    vendor.description = u.description;
    vendor.address = u.address;
   
    vendor.save(function (err) {
      if (err) { // validation failed
        
        /*
        
        if (~err.toString().indexOf('duplicate key')) {
          if (~err.toString().indexOf('username')) {
            user.password = u.password;
            user.errors = [ 'Korisničko ime je već zauzeto.' ];
          } else if (~err.toString().indexOf('email')) {
            user.password = u.password;
            user.errors = [ 'E-mail je već zauzet.' ];
          }
        }

        
        if (user.name.first || user.name.last || bio) {
          user.displayFullForm = true;
        }
        */
        console.log("some errors on save");
        vendor.errors = "Errors while saving vendor";
        return res.render('create', { vendor: vendor, currentURL:'register' });
      }
      res.redirect('/vendors'); 
    });
    }
    else {
    res.render('create', { vendor: vendor, currentURL:'register' });
  }
};



/**
 * View action
 */


exports.view = function (req, res, next) {
  Vendor.find({}).exec(function (err, vendors) {
    if (err) return next(err);
    if (!vendors) return next();
    res.render('vendors', { vendorData: vendors, currentURL: '/vendors' });
  });
};

exports.viewVendor = function (req, res, next) {
  var vendorName = req.params.name;
 // console.log('looking for ' + vendorName);
  Vendor.find({name:vendorName}).exec(function (err, vendors) {
    if (err) return next(err);
    if (!vendors) return next();
    //console.log(vendors);
    res.render('vendors', { vendorData: vendors, currentURL: '/vendors' });
  });
};




/**
 * View action
 */
/*
exports.viewVendor = function (req, res, next) {
  User.findByUsername(req.params.username, function (err, user) {
    if (err) return next(err);
    if (!user) return next();
    Post.find({ _owner: user }, function (err, posts) {
      if (err) return next(err);
      handleSidebar(req, res, next, user, function () {
        res.render('user/view', { user: user, posts: posts });
      });
    });
  });
};


*/

