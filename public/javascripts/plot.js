function Date_toYMD(d) {
    var year, month, day;
    year = String(d.getFullYear());
    month = String(d.getMonth() + 1);
    if (month.length == 1) {
        month = "0" + month;
    }
    day = String(d.getDate());
    if (day.length == 1) {
        day = "0" + day;
    }
    return year + "-" + month + "-" + day;
}

// dates
var t = new Date();
var today = Date_toYMD(t);

t.setDate(t.getDate() - 1);	
var d1 = Date_toYMD(t);
t.setDate(t.getDate() - 1);
var d2 = Date_toYMD(t);
t.setDate(t.getDate() - 1);
var d3 = Date_toYMD(t);
t.setDate(t.getDate() - 1);
var d4 = Date_toYMD(t);

// Transform data array into object with one tag per item
var newData = {};
var newCounter = 0;

for(var x=0;x<data.length;++x) {
	var currentWord = data[x].tag;
	var currentDate = data[x].tag_date;
	var currentCount = data[x].count;
	var wordExists = false;
	
	for(var j=0;j<newData.length; j++) {
	    var thisWord = newData[j].word;
		if(thisWord === currentWord) {
			newData[j].push({data:{tag_date:currentDate, count:currentCount}});
			wordExists = true;
		}
	}
	
	if(!wordExists) {
		newData[newCounter] = {
			word:currentWord,
			data: [
				{tag_date:currentDate,
				count:currentCount}
			]	
		};
		newCounter++;
	}
}

function makeChart(){

	var data = [];

	for(var i=0; i<10; i++){
		var d = [];
		var word = newData[i].word;
		var tagData = newData[i].data;
		var todayct = 0;
		var d1ct = 0;
		var d2ct = 0;
		var d3ct = 0;
			
		for(item in tagData){
			//alert('item in tagdata: ' + JSON.stringify(tagData[item]));
			if(tagData[item].tag_date === today){
				todayct = tagData[item].count;
			}
			
			if(tagData[item].tag_date === d1){
				d1ct = tagData[item].count;
			}
			
			if(tagData[item].tag_date === d2){
				d2ct = tagData[item].count;
			}
			
			if(tagData[item].tag_date === d3){
				d3ct = tagData[item].count;
			}
			
		}
		
		d.push([0,todayct]);
		d.push([1, d1ct]);
		d.push([2,d2ct]);
		d.push([3,d3ct]);
		
		
		data.push({data:d,label:word});

	}
	alert(JSON.stringify(data));

	
	var xticks = [[0, 'today'],[1, '1 day ago'], [2, '2 days ago'], [3, '3 days ago'],[4, '4 days ago']];

    $.plot($("#chartholder"), data,{
    
    yaxis: { min: 0, max: 300 },
    xaxis:{min:0, max:4, tickSize:1, ticks:xticks}
    });
}



$(document).ready(function(){
  makeChart();
});