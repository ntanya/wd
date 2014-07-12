
/**
 * Models module dependencies.
 */
var Review = require('../models/review');

exports.add = function(req,res,next){
	var review = new Review();
	
	if(req.method === 'POST'){
		var r = req.body.review;
		
		review.author.id = r.authorID;
		review.author.name = r.authorName;
		review.value = r.value;
		review.text = r.text;
		review.vendor.id  = r.vendorID;
		review.vendor.name = r.vendorName;
		
		review.save(function (err){
			if(err){}
			else{
				console.log('review submitted successfully');
			}
			res.redirect('/reviews');
		});
	}
	else{
		res.render('addreview', { reviewData: review, currentURL:'/review/add' });
	}	
	

};


