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
