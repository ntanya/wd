
/**
 * Models module dependencies.
 */
var Review = require('../models/review');

exports.add = function(req,res,next){
	var review = new Review();
	
	if(req.method === 'POST'){
		var r = req.body.review;
		
		//review.author.id = r.authorID;
		review.vendor = r.vendorid;
		review.value = r.value;
		review.text = r.text;
		
		review.save(function (err){
			if(err){}
			else{
				console.log('review submitted successfully');
			}
			res.redirect('/review/add');
		});
	}
	else{
		res.render('addreview', { reviewData: review, currentURL:'/review/add' });
	}	
	

};


