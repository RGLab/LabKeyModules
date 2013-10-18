$(document).ready(function(){
 
    $("a#one").mouseover(function() { 
        $("#slide-start img, #slide-two img, #slide-three img, #slide-four img").hide(
            0,
            function(){
                $("#slide-one img").show();       
            }
        );
    });
    
    $("a#two").mouseover(function() {
        $("#slide-start img, #slide-one img, #slide-three img, #slide-four img").hide(
            0,
            function(){
                $("#slide-two img").show();
            }
        );
    });
    
    $("a#three").mouseover(function() {
        $("#slide-start img, #slide-one img, #slide-two img, #slide-four img").hide(
            0,
            function(){
                $("#slide-three img").show();                 
            }
        );
    });
    
    $("a#four").mouseover(function() {
        $("#slide-start img, #slide-one img, #slide-two img, #slide-three img").hide(
            0,
            function(){
                $("#slide-four img").show();
            }
        );
    });
    
    $("p.intro").mouseout(function() {
        $("#slide-one img, #slide-two img, #slide-three img, #slide-four img").hide(
            0,
            function(){
                $("#slide-start img").show();
            }
        );
    });
        
});  

