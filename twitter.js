var http    = require('http');
var https   = require('https');
var mongo   = require('mongodb');

var database = null;
var hashtags = [];
var tagCounter = [];
var mongostr = "mongodb://localhost/dataintel";

/*---- string trim helper ----*/
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}

/*------ constructor ------------*/

TwitterProcessor = function(){
	mongo.connect(mongostr, {}, function(error, db)
	{		
		database = db;
		database.addListener('error', function(error){
			console.log('Error connecting to MongoLab');			
		});	
	});
}

/*------- DB helper functions ---------------*/

TwitterProcessor.prototype.getCollection = function(collName, callback){
	database.collection(collName, function(error, coll){
		if(error) callback(error);
		else callback(null, coll);	
	});
};

TwitterProcessor.prototype.dbSave = function(collName, data, callback){
	this.getCollection(collName, function(error, coll){
		if(error) callback(error);
		else{
			coll.insert(data, function(){
				if(typeof(callback) === 'function')callback(null);
			});				
		}	
	});
};

TwitterProcessor.prototype.dbInc = function(colName, field){
	this.getCollection(colName, function(error, coll){
		if(error) callback (error);
		else{
			var t = new Date();
			var today = (t.getMonth()+1) + '/' + t.getDate() + '/' + t.getFullYear();
			coll.update({tag:field, tag_date:today},{$inc: {count : 1}},{upsert:true});
		}
	});
};

/*------------- app interaction functions -----------------*/

TwitterProcessor.prototype.getTrends = function(callback){
	this.getCollection('tweets', function(error, coll){
		if(error) callback (error);
		else{
			coll.find({}, {_id:0}).sort({count:-1}).toArray(function(error,results){
				if(error) callback(error);
				else{
					print(results);
					callback(null,results);
				}
			});
		}
	});
};


TwitterProcessor.prototype.getUsers = function(callback){
	this.getCollection('twitter_users', function(error, coll){
		if(error) callback (error);
		else{
			coll.find({}, {_id:0}).sort({followers_count:-1}).toArray(function(error,results){
				if(error) callback(error);
				else{
					print(results);
					callback(null,results);
				}
			});
		}
	});
};

/*-------------- data processing functions ------------------- */

TwitterProcessor.prototype.processLead = function(user){
	 httpGet('/1/users/show.json?screen_name=' + user, this.saveLead);
}

TwitterProcessor.prototype.saveLead = function(dataObj){
	var saveObj = {
		id: dataObj["id"],
		screen_name: dataObj["screen_name"],
		created_at: dataObj["created_at"],
		description: dataObj["description"],
		followers_count: dataObj["followers_count"],
		friends_count: dataObj["friends_count"],
		location: dataObj["location"],
		name: dataObj["name"],
		profile_image_url: dataObj["profile_image_url"],
		verified: dataObj["verified"],
		geo_enabled: dataObj["geo_enabled"]
	};
	// Only save people with more than 10000 followers
	if(dataObj["followers_count"] > 10000){
		TwitterProcessor.prototype.dbSave('leads', saveObj);
		TwitterProcessor.prototype.processFollowers(dataObj['screen_name']);
    }
};

TwitterProcessor.prototype.saveFollowers = function(dataObj){
	for(user in dataObj){
		if(dataObj[user]['followers_count'] > 10000){
			TwitterProcessor.prototype.dbSave('twitter_users', dataObj[user]);
		}
	}
};

httpGet = function(url, callback, param){
	var completeResponse = "";
	var options = {
	  host: 'api.twitter.com',
	  port: 80,
	  path: url
	};
	var dataObj = null;
	
	print('url: ' + url);
	//print('callback: ' + callback);
	
	var request = http.get(options, function(result) {
	  console.log("Got response: " + result.statusCode);
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});

    request.on('response', function (response) {
	  response.on('data', function (chunk) {
		completeResponse += chunk;	
	  });	  
	  
	  response.on('end', function(){
	 	//console.log("got data: " + completeResponse);
		dataObj =  JSON.parse(completeResponse);
		callback(dataObj, param);	 
	   });
	  
	});	
};

TwitterProcessor.prototype.processFollowers = function(username, cursor){
	//var cursor = cursor || -1;
	var cursor = 1405333766762446000; // marked the latest processed cursor
	httpGet('/1/followers/ids.json?cursor='+cursor+'&screen_name=' + username, this.getFollowerData, username);
};


TwitterProcessor.prototype.getFollowerData = function(dataObj, username){
	
	var	ids = dataObj["ids"];	
	var l = ids.length;
	
	var cursor = dataObj["next_cursor"];
	if(cursor){
		print (cursor);
		TwitterProcessor.prototype.processFollowers(username, cursor);
	}
	
	for(var i=0; i<l;i=i+100)
	{
		var current = ids.splice(0, 100);  // Getting user data for 100 IDs, since up to 10o IDs are allowed per request
		setTimeout(httpGet('/1/users/lookup.json?user_id='+current.toString()+'&include_entities=false',TwitterProcessor.prototype.saveFollowers),3000);	
	}

};


TwitterProcessor.prototype.processTweets = function(){
	this.getUserIds(this.getStreamingAPI);
};

TwitterProcessor.prototype.getUserIds = function(callback){
	this.getCollection('twitter_users', function(error, coll){
		if(error) callback (error);
		else{
			coll.find({},{id:1, _id:0}).toArray(function(error, results) {
	            if( error ) callback(error)
	            else{
	          	   console.log ('got results');
	          	   var ids = [];
				   for(item in results)
				   {
						ids.push(results[item].id);
				   }
				   str = ids.join();
	          	   callback(str);
	            }
	        });			
		}
	});
};

TwitterProcessor.prototype.saveTweets = function(tweet){
	/*clients.forEach (client) ->
	  if(client && !client.disconnected){
	     client.send(JSON.stringify(data));
	  }
	*/

	var regex = /(^|\s)#(\w+)/g;
	var matchedTags =  tweet.match(regex);
	
	if(matchedTags){
	    for(var i=0; i<matchedTags.length; i++)
	    {
	    	var tag = matchedTags[i].toLowerCase().trim();
	    	
	    	if(tag.length>5){
	    		console.log('found tag: ' + tag);
				this.dbInc('tweets1', tag);        	
	       	}
	    }
	}
}

function print(str){
	console.log(str);
}

TwitterProcessor.prototype.getStreamingAPI = function(idstr){
	print ('Tracking: ' + '/1/statuses/filter.json?follow='+idstr);
	var options = {
	  host:    'stream.twitter.com',
      port:    443,
      path:    '/1/statuses/filter.json?follow='+idstr, //can follow up to 5,000 names per API docs
      //path:    '/1/statuses/filter.json?track=nyc',
      headers: {"Authorization": "Basic " + new Buffer('username' + ":" + 'pass').toString('base64')},
      method:  'GET'
     };
	
	
    var request = https.get(options, function(result) {
	  console.log("Got response: " + result.statusCode);
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
	
	var message = '';

    request.on('response', function (response) {
	  response.on('data', function (chunk) {
		message += chunk;	
		
        newline = message.indexOf("\r");
        
	    if(newline !== -1){
	      try{
	      
	        tweet = JSON.parse(message.slice(0, newline));
	       
	        data  = {
	          id:     tweet.id_str,
	          link:   'http://twitter.com/' + tweet.user.screen_name,
	          avatar: tweet.user.profile_image_url,
	          login:  tweet.user.screen_name,
	          name:   (tweet.user.name || tweet.user.screen_name),
	          text:   tweet.text
	          };
	      }
	      catch(error) {
	        tweet = null;
	        data  = null;
	        console.log('Error when parsing JSON: ' + error);
	      }
	      if(data !== null){
	      	 var txt = new String(data.text);
			 TwitterProcessor.prototype.saveTweets(txt);
	      }
	    }
	    message = message.slice(newline + 1);
		
	   });	  	  
	 });
	 
	 request.end();		
}

exports.TwitterProcessor = TwitterProcessor;
