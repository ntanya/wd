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
var x2 = new Date();
var x3 = new Date();
var x4 = new Date();
var today = new Date();

x1.setDate(x1.getDate()-1);
var d1 = x1;
x2.setDate(x2.getDate() - 2);	
var d2 = x2;
x3.setDate(x3.getDate() - 3);		
var d3 = x3;
x4.setDate(x4.getDate() - 4);		
var d4 = x4;


// Transform data array into object with one tag per item
var newData = {};

for(var x=0;x<data.length;++x) {
	var currentWord = data[x].link;
	currentWord = currentWord.replace('http://t.co/','');
	
	var currentDate = data[x].date;
	var currentCount = data[x].count;
	var wordExists = false;
	
	for(var thisWord in newData) {
		if(thisWord === currentWord) {
			newData[thisWord].data.push({tag_date:currentDate, count:currentCount});
			wordExists = true;
		}
	}
	
	if(!wordExists) {
		newData[currentWord] = {
			data: [
				{tag_date:currentDate,
				count:currentCount}
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
		//alert('item: ' + item + ', currentData: ' + JSON.stringify(currentData));
		
		var today_ct = 0; 
		var yest_ct = 0;	
		
			
		for(var i=0; i<currentData.length;i++){
			
			var thisTagDate = currentData[i].tag_date;
			//thisTagDate = thisTagDate.substring(0,thisTagDate.indexOf("T"));

			
			if(thisTagDate === Date_toYMD(today))
			{
				today_ct = currentData[i].count;
		
			    $('tr#'+item+' td.today').html(today_ct);
			    if(currentData.length == 1)
			    {
			    	$('tr#'+item+' td.today').addClass('newTrend');
			    }
	   
			}
			if(thisTagDate === Date_toYMD(d1)){
				$('tr#'+item+' td.1d').html(currentData[i].count);
				yest_ct = currentData[i].count;
			}
			if(thisTagDate === Date_toYMD(d2)){
				$('tr#'+item+' td.2d').html(currentData[i].count);
			}
			if(thisTagDate === Date_toYMD(d3)){
				$('tr#'+item+' td.3d').html(currentData[i].count);
			}
			if(thisTagDate === Date_toYMD(d4)){
				$('tr#'+item+' td.4d').html(currentData[i].count);
			}			
		}
		
		if(today_ct > 0 && today_ct < yest_ct){
			$('tr#'+item+' td.today').addClass('lowerTrend');
		}
		if(today_ct > 0 && yest_ct > 0 && today_ct > yest_ct){
			$('tr#'+item+' td.today').addClass('higherTrend');
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