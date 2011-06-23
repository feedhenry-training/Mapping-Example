$fh.ready(function () {
  init();
});

function init(){
  // Bind the callback for when the map page is shown
  $("#map").live( "pageshow", function(event, ui){
    //Let the maps_div fill the full area available
    var mpageHeight = $("#map").height();
    var mHeaderHeight = $("#map .ui-header").height();
    var mapH = mpageHeight - mHeaderHeight
    $("#maps_div").css("height", mapH + "px");
    $("#maps_div").css("width", "100%");
    
    // Show the map
    map.show();
  });                   
}