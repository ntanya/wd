var http    = require('http');
var https   = require('https');
var mongo   = require('mongodb');

var database = null;

var mongostr = "mongodb://localhost/dataintel";
//var mongostr = "mongodb://tanya:tanya@ds033897.mongolab.com:33897/heroku_app5667663"

/*---- string trim helper ----*/
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}

function print(str){console.log(str);}


/*-------- sort helpers --------*/
function sortObject(o) {
    var sorted = {},
    key, a = [];
    for (key in o) {
        if (o.hasOwnProperty(key)) {
                a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

/*------ constructor ------------*/

UserProcessor = function(){
	mongo.connect(mongostr, {}, function(error, db)
	{		
		database = db;
		database.addListener('error', function(error){
			console.log('Error connecting to MongoLab');			
		});	
	});
}


exports.UserProcessor = UserProcessor;
