var db = require('./db'),
  util = require('util'),
  crypto = require('crypto'),
  helpers = require('../helpers/');


var User = new db.Schema({
  name: {
    first: {
      type: String,
      trim: true,
      set: helpers.toUpperCaseFirst,
      min: [ 2, 'Min 2 chars' ],
      max: [ 30, 'Max 30 chars' ]
    },
    last: {
      type: String,
      trim: true,
      set: helpers.toUpperCaseFirst,
      min: [ 2, 'Min 2 chars' ],
      max: [ 30, 'Max 30 chars' ]
    }
  },
  email: {
    type: String,
    required: [ true, 'Email required' ],
    validate: [ helpers.EmailValidator, 'email', 'Invalid email' ],
    unique: true
  },
  publicEmail: {
    type: Boolean,
    default: false
  },
  password: {
    type: String, 
    required: [ true, 'Password required' ],
    min: [ 6, 'Min 6 chars' ],
    max: [ 32, 'Max 32 chars' ]
  },
  /*
  photo: {
    type: db.ObjectId,
    ref: 'Picture',
    default: Picture.DEFAULT
  },
  */
  salt: {
    type: String,
    default: helpers.generateHash
  },
  createdAt: { 
    type: Date,
    default: Date.now
  }
});


/**
 * Method encrypts user password.
 *
 * You can pass `password` and `salt` parameters if you want this
 * method to act as helper. Otherwise models values will be used.
 *
 * @param {String} raw password (if no value provided models value will be used)
 * @param {String} optional salt (if no value provided models value will be used)
 * @return {String} encrypted password
 */


User.methods.encryptPassword = function (password, salt) {
  var _password = password || this.password;
  var _salt = salt || this.salt;
  return crypto.createHmac('md5', _password + _salt).digest('hex');
};


/**
 * Pre-save middleware.
 */

User.pre('save', function (next) {
  if (this.isNew) {
    this.password = this.encryptPassword(this.password, this.salt);
  }
  next();
});


/**
 * Expose `User` model.
 */

module.exports = db.mongoose.model('User', User);