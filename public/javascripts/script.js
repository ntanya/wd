var yesterday = [];
var today = [];

for(var i=0; i<data.length;i++){
	if(data[i]['tag_date'] == '6/20/2012'){
	   yesterday.push(data[i]);
	}
	else{
		today.push(data[i]);
	}
}
