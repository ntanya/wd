function ISODateString(d){
 function pad(n){return n<10 ? '0'+n : n}
 return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'}
      


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
var x1 = new Date();

var today = new Date();

x1.setDate(x1.getDate()-1);
var d1 = x1;

//x2.setDate(x2.getDate() - 2);	
//var d2 = x2;



// Transform data array into object with one tag per item
var newData = {};

for(var x=0;x<data.length;++x) {
	var currentWord = data[x].tag;
	
	currentWord = currentWord.substr(1,currentWord.length-1);
	
	var currentDate = data[x].tag_date;
	var currentDaypart = data[x].tag_hours;
	var currentCount = data[x].count;
	var wordExists = false;
	
	for(var thisWord in newData) {
		if(thisWord === currentWord) {
			newData[thisWord].data.push({tag_date:currentDate, count:currentCount, daypart:currentDaypart});
			wordExists = true;
		}
	}
	
	if(!wordExists) {
		newData[currentWord] = {
			data: [
				{tag_date:currentDate,
				count:currentCount,
				daypart:currentDaypart}
			]	
		};
	}
}
//alert(JSON.stringify(newData));

function removeDupes(){
	var duplicateChk = {};

   $('tr[id]').each (function () {
    if (duplicateChk.hasOwnProperty(this.id)) {
       $(this).remove();
    } else {
       duplicateChk[this.id] = 'true';
    }
   });
}

function processData(){

	for(item in newData)
	{
		var currentData = newData[item].data;
		//alert('currentData: ' + JSON.stringify(currentData));
		
		var today_ct = 0; 
		var yest_ct = 0;	
		
			
		for(var i=0; i<currentData.length;i++){
			
			var thisTagDate = currentData[i].tag_date;
			var thisTagDaypart = currentData[i].daypart;
			//thisTagDate = thisTagDate.substring(0,thisTagDate.indexOf("T"));

						
			if(thisTagDate === Date_toYMD(today))
			{
				if(thisTagDaypart === 'am'){
					today_ct = currentData[i].count;
					$('tr#'+item+' td.0d_a').html(today_ct);
				    
				}
				else
				{
					$('tr#'+item+' td.0d_p').html(currentData[i].count);
					if(currentData.length == 1)
				    {
				    	$('tr#'+item+' td.0d_p').addClass('newTrend');
				    }
					yest_ct = currentData[i].count;
				}
	   
			}
			if(thisTagDate === Date_toYMD(d1)){
				
				if(thisTagDaypart === 'am'){
					
					$('tr#'+item+' td.1d_a').html(currentData[i].count);
				
				}
				else{
					$('tr#'+item+' td.1d_p').html(currentData[i].count);
				}
				
			}
			
		}
		
		if(today_ct > 0 && today_ct < yest_ct){
			$('tr#'+item+' td.0d_p').addClass('higherTrend');
		}
		if(today_ct > 0 && yest_ct > 0 && today_ct > yest_ct){
			$('tr#'+item+' td.0d_p').addClass('lowerTrend');
		}
	}
}


function sortObject(o) {
    var sorted = {},
    key, a = [];
    //alert(JSON.stringify(o));

    for (key in o) {
        if (o.hasOwnProperty(key)) {
                a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    //alert(JSON.stringify(sorted));
    return sorted;
}

$(document).ready(function(){

	removeDupes();
	processData();
});