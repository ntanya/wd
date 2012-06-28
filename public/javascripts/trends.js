// dates
var t = new Date();
var today = (t.getMonth()+1) + '/' + t.getDate() + '/' + t.getFullYear(); 

t.setDate(t.getDate() - 1);	
var d1 = (t.getMonth()+1) + '/' + t.getDate() + '/' + t.getFullYear();
t.setDate(t.getDate() - 1);
var d2 = (t.getMonth()+1) + '/' + t.getDate() + '/' + t.getFullYear();
t.setDate(t.getDate() - 1);
var d3 = (t.getMonth()+1) + '/' + t.getDate() + '/' + t.getFullYear();
t.setDate(t.getDate() - 1);
var d4 = (t.getMonth()+1) + '/' + t.getDate() + '/' + t.getFullYear();

// Transform data array into object with one tag per item
var newData = {};

for(var x=0;x<data.length;++x) {
	var currentWord = data[x].tag;
	var currentDate = data[x].tag_date;
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
		//alert('currentData: ' + JSON.stringify(currentData));
		
		var today_ct = 0; 
		var yest_ct = 0;	
			
		for(var i=0; i<currentData.length;i++){
			if(currentData[i].tag_date == today)
			{
				today_ct = currentData[i].count;
		
			    $('tr#'+item+' td.today').html(today_ct);
			    if(currentData.length == 1)
			    {
			    	$('tr#'+item+' td.today').addClass('newTrend');
			    }
	   
			}
			if(currentData[i].tag_date == d1){
				$('tr#'+item+' td.1d').html(currentData[i].count);
				yest_ct = currentData[i].count;
			}
			if(currentData[i].tag_date == d2){
				$('tr#'+item+' td.2d').html(currentData[i].count);
			}
			if(currentData[i].tag_date == d3){
				$('tr#'+item+' td.3d').html(currentData[i].count);
			}
			if(currentData[i].tag_date == d4){
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