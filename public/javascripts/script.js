$(document).ready(function(){
	$(".monitor").change(function(){
		var checked = this.checked;
		var username = this.id;
		$.ajax({
			url:'/users/ajax/updateMonitor/',
			type:"GET",
			data:{'username':username, 'value':checked},
			success: function(data){alert('ok');}
		});
	
	});
	
	$('a#changedemo').click(function(){
		if(this.innerHTML==='change'){
		
		    $('#demobox').removeClass('classHidden');
		    $('#demobox').addClass('classVisible');
		    $('#changedemo').html('hide');	
		}
		else{
			$('#demobox').removeClass('classVisible');
		    $('#demobox').addClass('classHidden');
		    $('#changedemo').html('change');
		}		
	});
	
	$('#doChangeDemo').click(function(){
		var newDemo = $('#newDemo').val();
		
		$.ajax({
			url:'/ajax/updateDemo/',
			type:"GET",
			data:{'value':newDemo},
			success: function(data){//alert('New demo group set');
				location.reload();
			}
		});
		
	});
	
	$('a#clickAddLead').click(function(){
		$('#addLead').removeClass('classDisplayNone');
		$('#addLead').addClass('classDisplayBlock');
	});
	
	$('#doAddLead').click(function(){
		
		var newLead = $('#leadName').val();
		var demo = $("#leadDemo").val();
		
		alert('adding lead: ' + newLead + ', demo: ' + demo);
		$.ajax({
			url:'/leads/ajax/addLead',
			type:"GET",
			data:{'username':newLead,'demo':demo},
			success: function(data){alert('New influencer added');
				location.reload();
			}
		});
	});
	
	
		
});
