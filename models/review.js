var db = require('./db');



var Review = new db.Schema({
  //author: { type: db.ObjectId, ref: 'User' },
  vendor: { type: db.ObjectId, ref: 'Vendor' },

  value:{
  	type:Number,
  	required:[true, 'Please provide star rating'],
  	min:0,
  	max:5,
  	default:0
  },
  text: {  
      type: String,
      trim: true,
      max: [ 1000, 'Max 1000 chars' ]
  },
  createdAt: { 
    type: Date,
    default: Date.now
  }
});


/**
 * Expose `Review` model.
 */

module.exports = db.mongoose.model('Review', Review);