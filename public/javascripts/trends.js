$(document).ready(function(){
	for(item in data)
	{
	   //console.log(data[item]._id);
	   var tdate = data[item].value.tag_date;
	   var tag = data[item]._id;
	   var tcount = data[item].value.count;

	   if(tdate == '6/25/2012'){
	      //alert('match');
	   	  //$(".today").filter('#'+tag).text(tcount);
	   }
	}
});