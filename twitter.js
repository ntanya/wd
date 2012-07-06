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

TwitterProcessor = function(){
	mongo.connect(mongostr, {}, function(error, db)
	{		
		database = db;
		database.addListener('error', function(error){
			console.log('Error connecting to MongoLab');			
		});	
	});
	this.processRunning = false;
}

TwitterProcessor.prototype.setDemo = function(demo){
	this.demo = demo;
}

TwitterProcessor.prototype.getDemo = function(){
	return this.demo;
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

TwitterProcessor.prototype.dbIncTweets = function(field, demo){

	this.getCollection('tweets1', function(error, coll){
		if(error) callback (error);
		else{
			var t = new Date();
			var today = (t.getMonth()+1) + '/' + t.getDate() + '/' + t.getFullYear();
			coll.update({tag:field, tag_date:today, tag_demo:demo},{$inc: {count : 1}},{upsert:true});
		}
	});
};


TwitterProcessor.prototype.getLastCursor = function(username,callback){
	this.getCollection('followers_log', function(error, coll){
		if(error) callback (error);
		else{
			coll.find().sort({timestamp:-1}).limit(1).toArray(function(error,results){
			    if(error) callback(error);
				else{
						callback(results);
					}
				});						
		}
	});
};


/*------------- app interaction functions -----------------*/
TwitterProcessor.prototype.getTrends = function(callback,sort,order){
	this.getCollection('tweets1', function(error, coll){
		if(error) callback (error);
		else{
			var t = new Date();
			t.setDate(t.getDate() - 5);  // get trends for only 4 days
			var d4 = (t.getMonth()+1) + '/' + t.getDate() + '/' + t.getFullYear();

			sortField = sort || '';
			sortOrder = order || '-1';

			/*
			var sortObj = {};
			
			switch(sortField){
				case 'tag': 
					sortObj = {'tag':1,'tag_date':-1};
					break;
				case 'count':
					sortObj = {tag_date:sortOrder,count:-1};
					break;
				default:
					sortObj = {tag_date:-1,count:-1};
			}
			
			print(JSON.stringify(sortObj));
			
			coll.find({count:{$gt:10},tag_date:{$gt:d4}},{_id:0}).sort({"tag_date":-1,"count":-1}).toArray(function(error,results){
			    if(error) callback(error);
					else callback(null,results);
				});
			
			*/

			if(sortField == 'tag'){
				coll.find({count:{$gt:10},tag_date:{$gt:d4}},{_id:0}).sort({tag:1,count:-1}).toArray(function(error,results){
				//coll.group( { key:{tag:true, tag_date:true}, initial: {sum:0}, reduce: function(doc, prev) {prev.sum += doc.count} }).toArray(function(error, results){					
				    if(error) callback(error);
					else callback(null,results);
				});


			}
			else{
				coll.find({count:{$gt:10},tag_date:{$gt:d4}},{_id:0}).sort({tag_date:-1,count:-1}).toArray(function(error,results){
				//coll.group( { key:{tag:true, tag_date:true}, initial: {sum:0}, reduce: function(doc, prev) {prev.sum += doc.count} }).toArray(function(error, results){					
				    if(error) callback(error);
					else callback(null,results);
				});
			}

		}
	});
};

TwitterProcessor.prototype.getTrends_mr = function(callback){
	this.getCollection('tweets1', function(error, coll){
		if(error) callback (error);
		else{
			//coll.find({}, {_id:0}).sort({count:-1}).toArray(function(error,results){
			//coll.group( { key:{tag:true, tag_date:true}, initial: {sum:0}, reduce: function(doc, prev) {prev.sum += doc.count} }).toArray(function(error, results){		
			coll.mapReduce(
			//map
			function(){
				emit(this.tag, {tag_date: this.tag_date, count:this.count});
			},
			// reduce
			function(key, values){
				var obj = {value: []};
				for(var i in values){
					obj.value.push({tag_date:values[i].tag_date, count:values[i].count});
				}
				return obj;
			},
			{out:{inline:1}},
			function(error, results, stats)
			{
				if(error) callback(error);
				else{
					//print(results);
					callback(null,results);
				}
			});
		}
	});
};


TwitterProcessor.prototype.getUsers = function(demo,callback){
	this.getCollection('twitter_users', function(error, coll){
		if(error) callback (error);
		else{
			coll.find({demo:demo}, {_id:0}).sort({followers_count:-1}).toArray(function(error,results){
				if(error) callback(error);
				else{
					//print(results);
					callback(null,results);
				}
			});
		}
	});
};

TwitterProcessor.prototype.getLeads = function(demo, callback){
	this.getCollection('leads', function(error, coll){
		if(error) callback (error);
		else{
			coll.find({demo:demo}, {_id:0}).sort({followers_count:-1}).toArray(function(error,results){
				if(error) callback(error);
				else{
					//print(results);
					callback(null,results);
				}
			});
		}
	});
};

TwitterProcessor.prototype.updateUserMonitorStatus = function(user, value,demo){
	this.getCollection('twitter_users', function(error, coll){
		if(error) callback(error);
		else{
			coll.update({'screen_name':user,'demo':demo},{$set:{monitor:value}});
		}
	});
}

/*-------------- data processing functions ------------------- */

TwitterProcessor.prototype.processLead = function(demo,user,callback){
	httpGet('/1/users/show.json?screen_name=' + user, this.saveLead, [demo,callback]);
}

TwitterProcessor.prototype.saveLead = function(error,dataObj,arr){
	if(error){callback;}
	else{
		
		var demo = arr[0];
		var callback = arr[1];
		//print('demo:' + demo + ',callback: ' +callback);
		var saveObj = {
			id: dataObj["id"],
			demo:demo,
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
			TwitterProcessor.prototype.dbSave('leads', saveObj,callback);
			TwitterProcessor.prototype.processFollowers(dataObj['screen_name']);
	    }
    }
};

TwitterProcessor.prototype.saveFollowers = function(error,dataObj,username){
	if(error){}
	else{
		for(user in dataObj){
			
			if(dataObj[user]['followers_count'] > 10000){
				
				var saveObj = {
					id: dataObj[user]["id"],
					demo:'teens',
					screen_name: dataObj[user]["screen_name"],
					created_at: dataObj[user]["created_at"],
					description: dataObj[user]["description"],
					followers_count: dataObj[user]["followers_count"],
					friends_count: dataObj[user]["friends_count"],
					location: dataObj[user]["location"],
					name: dataObj[user]["name"],
					profile_image_url: dataObj[user]["profile_image_url"],
					verified: dataObj[user]["verified"],
					geo_enabled: dataObj[user]["geo_enabled"],
					time_zone: dataObj[user]["time_zone"],
					is_translator:dataObj[user]["is_translator"],
					lang:dataObj[user]["lang"],
					url:dataObj[user]["url"],
					utc_offset: dataObj[user]["utc_offset"],
					listed_count: dataObj[user]["listed_count"],
					geo_enabled: dataObj[user]["geo_enabled"]
				};
	
			
				TwitterProcessor.prototype.dbSave('twitter_users', saveObj);
			}
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
	print(url);
	var dataObj = null;
	var status = 0;
	var request = http.get(options, function(result) {
	  console.log("Got response: " + result.statusCode);
	  status = result.statusCode;
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});

    request.on('response', function (response) {
	  response.on('data', function (chunk) {
		completeResponse += chunk;	
	  });	  
	  
	  response.on('end', function(){
	 	//console.log("got data: " + completeResponse);
		if(status == 200)
		{
			dataObj =  JSON.parse(completeResponse);
			callback(null,dataObj, param);
		}
		else{callback('error');}	 
	   });
	  
	});	
};

TwitterProcessor.prototype.processFollowers = function(username, cursor){
	var cursor = cursor || -1;
	
	// If we already processed some of the followers, check the log table and start from last cursor
	if(cursor == -1){
		TwitterProcessor.prototype.getLastCursor(username, function(results){
			//print (results);
			cursor = results[0].currCursor;
			httpGet('/1/followers/ids.json?cursor='+cursor+'&screen_name=' + username, TwitterProcessor.prototype.getFollowerData, username);
			
			var data = {
				timestamp: Date(),
				currCursor: cursor,
				username: username
			}
			TwitterProcessor.prototype.dbSave('followers_log', data);
		});
	}
	else
	{
		httpGet('/1/followers/ids.json?cursor='+cursor+'&screen_name=' + username, this.getFollowerData, username);
		
		var data = {
			timestamp: Date(),
			currCursor: cursor,
			username: username
		}
		this.dbSave('followers_log', data);
	}
};


TwitterProcessor.prototype.getFollowerData = function(error, dataObj, username){
	if(error){}
	
	else{
		var	ids = dataObj["ids"];	
		var l = ids.length;
		
		var cursor = dataObj["next_cursor"];
		if(cursor){
			TwitterProcessor.prototype.processFollowers(username, cursor);
		}
		
		for(var i=0; i<l;i=i+100)
		{
			var current = ids.splice(0, 100);  // Getting user data for 100 IDs, since up to 10o IDs are allowed per request
			setTimeout(httpGet('/1/users/lookup.json?user_id='+current.toString()+'&include_entities=false',TwitterProcessor.prototype.saveFollowers,username),3000);	
		}
	}

};


TwitterProcessor.prototype.processTweets = function(){
	this.processRunning = true;
	this.getUserIds(this.getStreamingAPI, this);
};

TwitterProcessor.prototype.getUserIds = function(callback, self){
	var demo = self.getDemo();
	this.getCollection('twitter_users', function(error, coll){
		if(error) callback (error);
		else{
			coll.find({demo:demo,monitor:true},{id:1, _id:0}).toArray(function(error, results) {
	            if( error ) callback(error)
	            else{
	          	   var ids = [];
				   for(item in results)
				   {
						ids.push(results[item].id);
				   }
				   str = ids.join();
				   callback(str, self);
	            }
	        });			
		}
	});
};


TwitterProcessor.prototype.saveTweets = function(tweet, demo){
	 
	var regex = /(^|\s)#(\w+)/g;
	var matchedTags =  tweet.match(regex);
	
	if(matchedTags){
	    for(var i=0; i<matchedTags.length; i++)
	    {
	    	var tag = matchedTags[i].toLowerCase().trim();
	    	
	    	if(tag.length>5 && tag.length < 50){
	    		console.log('found tag: ' + tag);
				this.dbIncTweets(tag, demo);        	
	       	}
	    }
	}
}

TwitterProcessor.prototype.getStreamingAPI = function(idstr, obj){

	//print ('Tracking: ' + '/1/statuses/filter.json?follow='+idstr);
	var demo = obj.getDemo(); 
	
	var options = {
	  host:    'stream.twitter.com',
      port:    443,
      path:    '/1/statuses/filter.json?follow='+idstr, //can follow up to 5,000 names per API docs
      //path:    '/1/statuses/filter.json?track=nyc',
      headers: {"Authorization": "Basic " + new Buffer('ntanya' + ":" + 'leshik123').toString('base64')},
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
			 TwitterProcessor.prototype.saveTweets(txt, demo);
			 
			 // send info to sockets
			 obj.clients.forEach(function(client){
				if(client && !client.disconnected){
			       client.send(JSON.stringify(data));
			       //client.send('Found tag: ' + txt)
			    }  	  
			 });
			 
	      }
	    }
	    message = message.slice(newline + 1);
		
	   });
	   
	   response.on('end', function(){
	   	   obj.processRunning = false;  // set flag to false on the main twitterProcessor object
	   });	  	  
	 });
	 
	 request.end();
	 
	
}

exports.TwitterProcessor = TwitterProcessor;
