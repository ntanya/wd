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
//alert('new data: ' + JSON.stringify(newData));

// new data 

/*

 {"#youshouldntdothat":{"data":[{"tag_date":"2012-07-16","count":1933}]},"#overusedwords":{"data":[{"tag_date":"2012-07-16","count":1590},{"tag_date":"2012-07-15","count":2312}]},"#beadlesbabes":{"data":[{"tag_date":"2012-07-16","count":1408},{"tag_date":"2012-07-15","count":3417},{"tag_date":"2012-07-14","count":117},{"tag_date":"2012-07-13","count":86},{"tag_date":"2012-07-12","count":55}]},"#happybirthdayeleanor":{"data":[{"tag_date":"2012-07-16","count":1349},{"tag_date":"2012-07-15","count":960}]},"#thedatewasoverwhen":{"data":[{"tag_date":"2012-07-16","count":1160}]},"#teamfollowback":{"data":[{"tag_date":"2012-07-16","count":552},{"tag_date":"2012-07-15","count":587},{"tag_date":"2012-07-14","count":695},{"tag_date":"2012-07-13","count":802},{"tag_date":"2012-07-12","count":752}]},
 
 */
function makeChart(){

	var data = [];
	var count = 0;
	var countArr = [];

	for(var i in newData){
		count++;
		var d = [];
		var word = i;
		var tagData = newData[i].data;
		var todayct = 0;
		var d1ct = 0;
		var d2ct = 0;
		var d3ct = 0;
		var d4ct = 0;
			
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
			if(tagData[item].tag_date === d4){
				d4ct = tagData[item].count;
			}
			
			if(!isNaN(tagData[item].count)){
				countArr.push(Number(tagData[item].count));
			}
		}
		
		d.push([0,todayct]);
		d.push([1, d1ct]);
		d.push([2,d2ct]);
		d.push([3,d3ct]);
		d.push([4,d3ct]);

		
		data.push({data:d,label:word});
		if(count===10){
			break;
		}

	}
	//alert(JSON.stringify(data));
	
	var maxValue = Math.max.apply(null,countArr);
	
	var xticks = [[0, 'today'],[1, '1 day ago'], [2, '2 days ago'], [3, '3 days ago'],[4, '4 days ago']];

    $.plot($("#chartholder"), data,{
    
    yaxis: { min: 0, max: maxValue},
    xaxis:{min:0, max:4, tickSize:100, ticks:xticks},
    series:{points:{show:true}, lines:{show:true, fill:true}},
    grid: { hoverable: true }
    });
}



$(document).ready(function(){
  makeChart();
  
  
  $("#chartholder").bind("plothover", function (event, pos, item) {
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));

            if (item) {
                if (previousPoint != item.datapoint) {
                    previousPoint = item.datapoint;
                    $("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2), y = item.datapoint[1].toFixed(0);
                    //showTooltip(item.pageX, item.pageY, item.series.label + " of " + x + " = " + y);
					showTooltip(item.pageX, item.pageY, item.series.label + ", " + y);

                }
            }
            else {
                $("#tooltip").remove();
                previousPoint = null;            
            }

    });

    // show the tooltip
    function showTooltip(x, y, contents) {
        $('<div id="tooltip">' + contents + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y - 35,
            left: x + 5,
            border: '1px solid #fdd',
            padding: '2px',
            'background-color': '#fee',
            opacity: 0.80
        }).appendTo("body").fadeIn(200);
    }
  
});