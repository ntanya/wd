var cleantags = [];
/*
var data = [{"count":398,"tag":"#test","tag_date":"6/22/2012"},{"count":88,"tag":"#test","tag_date":"6/25/2012"}];

for(item in data){
	//alert(data[item].tag);
	t = data[item].tag;
	td = data[item].tag_date;
	c = data[item].count;
	alert('t:' + t + ', td:' + td + ', c:' + c)
	
	if(!cleantags[t]){
	  alert('in if');
		cleantags[t] = new Array();
		cleantags[t] = {tag_date:td,count:c};
		alert(JSON.stringify(cleantags[t]));		
	}
	else{
		alert(JSON.stringify(cleantags[t]));
		if(cleantags[t]["tag_date"] != td){
			cleantags[t].push({tag_date:td, count:c});
		}
	}
}
*/
	//document.write(JSON.stringify(cleantags));
$(document).ready(function(){
	$(".monitor").change(function(){
		var checked = this.checked;
		var username = this.id;
		$.ajax({
			url:'/users/updateMonitor/',
			type:"GET",
			data:{'username':username, 'value':checked},
			success: function(data){alert('ok');}
		});
	
	});
		
});



// map reduce example
/*
var map = function(){
	emit(this.tag, {tag_date: this.tag_date, count:this.count});
}

var reduce = function(key, values){
	var obj = {data:[]};
	for(var i in values){
		obj.data.push({tag_date:values[i].tag_date, count:values[i].count});
	}
	return obj;
}

printjson(db.tweets.mapReduce(map, reduce, "pivot"));
  db.pivot.find().forEach(printjson);
  */