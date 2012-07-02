var messages = [];
var keys = {};
$(document).ready(function() {
  var socket = io.connect('http://stormy-fire-6148.herokuapp.com/');
  
  
  socket.on('connect', function() {
    socket.on('message', function(result) {
      
      
      var result = JSON.parse(result);
      if (typeof keys[result.id] == 'undefined') {
        keys[result.id] = true;
        messages.unshift(result);

        if (messages.length > 20) {
          var last = messages.pop();
          delete keys[last.id];
        }
      }
      
      
    });
  });

  window.onbeforeunload = function() {
    socket.disconnect();
  };



  setInterval(function() {
    if (messages.length > 0) {
      var tweet = messages.pop();
      delete keys[tweet.id];
      
      var txt = tweet.text;
      var regex = /(^|\s)#(\w+)/g;
	  var matchedTags =  txt.match(regex);
	
	  if(matchedTags){
	    for(var i=0; i<matchedTags.length; i++)
	    {
	    	var tag = matchedTags[i].toLowerCase().trim();
	    	
	    	if(tag.length>5){
	    		$("#tags").append('<p>Found tag: ' + tag + '</p>');
	       	}
	    }
	 }
	
      $("#tweets").append('<p>' + tweet.text + '</p>');
    }
  }, 500);
});
