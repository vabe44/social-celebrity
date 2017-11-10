
function screensize() {
    
var wndow_ht = $( window ).height();
//$('body').css("min-height",wndow_ht);

var totlWd = $( ".htjstt" ).width();
var totlWda = $( ".htjsa" ).width();
var totlWdc = $( ".htjsc" ).width();
var wdtCal = (totlWd - totlWda - totlWdc);
$('.htjsb').css("width",wdtCal);
// htjstt htjsa htjsb htjsc 

};

$( document ).ready(function() {
  screensize();	
});
$( window ).resize(function() {
  screensize();
});
$( window ).load(function() {
  screensize();
});
//popup close
$(".popClJs").click( function(){
	//$(".myPopPage").fadeOut(); 
	$(".overCls").fadeOut(300);
	$(".myPopPage").removeClass("animated zoomIn");
});

