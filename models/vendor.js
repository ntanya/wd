var db = require('./db');



var Vendor = new db.Schema({
  name: {  
      type: String,
      trim: true,
      //set: helpers.toUpperCaseFirst,
      required:true,
      min: [ 2, 'Min 2 chars' ],
      max: [ 30, 'Max 30 chars' ]
  },
  description: {  
      type: String,
      trim: true,
      required:true,
      //set: helpers.toUpperCaseFirst,
      min: [ 2, 'Min 2 chars' ],
      max: [ 30, 'Max 30 chars' ]
  },
  address: {
      type: String,
      trim: true,
      //set: helpers.toUpperCaseFirst,
      min: [ 2, 'Min 2 characters in address' ],
      max: [ 100, 'Max 100 characters in address' ]
  },
  
  /*
  salt: {
    type: String,
    default: helpers.generateHash
  },
  */
  createdAt: { 
    type: Date,
    default: Date.now
  }
});

/**
 * Expose `Vendor` model.
 */

module.exports = db.mongoose.model('Vendor', Vendor);