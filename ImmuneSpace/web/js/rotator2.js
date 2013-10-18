$(document).ready(function(){
 
	$("a#one").mouseover(function() {
         
		 $("#slide-start img, #slide-two img, #slide-three img, #slide-four img").hide();
		 $("#slide-one img").fadeIn();
    });
	
	$("a#two").mouseover(function() {
         
		 $("#slide-start img, #slide-one img, #slide-three img, #slide-four img").hide();
		 $("#slide-two img").fadeIn();
    });
	
	$("a#three").mouseover(function() {
         
		 $("#slide-start img, #slide-one img, #slide-two img, #slide-four img").hide();
		 $("#slide-three img").fadeIn();
    });
	
	$("a#four").mouseover(function() {
         
		 $("#slide-start img, #slide-one img, #slide-two img, #slide-three img").hide();
		 $("#slide-four img").fadeIn();
    });
	
	$("p.intro").mouseout(function() {
         
		 $("#slide-one img, #slide-two img, #slide-three img, #slide-four img").hide();
		 $("#slide-start img").show();
    });
		
});  

