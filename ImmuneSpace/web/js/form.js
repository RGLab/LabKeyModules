$(document).ready(function(){
	
	$("input")
		.each(function(){
			if (this.value) {
				$(this).prev().hide();
			}
		})
		.focus(function(){
			$(this).prev().hide();
		})
		.blur(function(){
			if (!this.value) {
				$(this).prev().show();
			}
		});
		
});