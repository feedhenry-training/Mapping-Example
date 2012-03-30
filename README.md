Overview
====================
This app requests a set of placemarks from the server and displays them to the user on a map. This app has 3 packages to demonstrate that the developer isn't restricted with how the UI can be built. The 3 packages use the following UI contruction methods:

* default: plain html and javascript
* sencha: Sencha Touch UI Framework
* jqmobile: jQuery Mobile UI Framework

Mapping Logic
====================

Showing the Map
---------------------
For all three packages, the same business logic is used for getting the placemarks from the server and showing them in the app. This can be seen in /client/default/script/map.js. When the map is shown, the following code is executed:

```javascript
var show = function () {
  var lat = 52.88,
      lon = -7.96;
 
  //Pass lat & lon into map api, initialising map at that point
  $fh.map({
    target: '#maps_div',
    lat: lat,
    lon: lon,
    zoom: 15
  }, function (res) {
    // Keep the reference to the map object;
    self.map = res.map;
    // Map is being shown, lets populate it with data points
    self.populateMap(lat, lon);
  }, function (error) {
    // something seriously wrong here. Show error
    alert(error);
  });
};
```

This tells the app to initialise a map in the __maps_div__ at the point specified by 'lat' and 'lon'. The value for these are set at '52.88' and '-7.96'. This could easily be changed to use the $fh.geo api call to get the users current location.

Showing placemarks
---------------------
After the map is initialised, the __populateMap()__ function is called. This function makes a call to the server and requests the placemarks to put on the map. The placemarks are then iterated over and added to the map one at a time. The code for this can also be seen in /client/default/script/map.js

```javascript
$fh.act({
  act: 'getPlacemarks',
  req: {
    lat: lat,
    lon: lon
  }
}, function (res) {
  var points = res.points;
 
  // Iterate over the points array, adding each to the map
  for (var pi=0,pl=points.length; pi &lt; pl; pi++) {
    var point = points[pi];
 
    // Create the marker, then add it to the map
    var pos = new google.maps.LatLng(point.lat, point.lon);
 
    var marker = new google.maps.Marker({
      position: pos,
      map: self.map,
      title: point.title
    });
  }   
}, function (code, errorprops, params) {
  // something went wrong. Show error
  alert(code);
});
```

Server Side Placemarks
---------------------
The server side code that returns the placemarks can be seen in /cloud/main.js. This function takes the latitude and longitude passed from the client and sets up an array of placemarks centered around that point. Each point has 3 attributes: __lat__, __lon__ and __title__. This is the format expected by the client. This code could easily be modified to return a different set of points based on the clients location and query an external web service to get useful information about where the user is.

```javascript
var getPlacemarks = function (params, callback) {
  console.log('in getPlacemarks');
  
  var lat = 'undefined' !== typeof params.lat ? params.lat : 52.88,
      lon = 'undefined' !== typeof params.lon ? params.lon : -7.96;
  
  // Add the passed in location to a points array
  var points = [{lat: lat, lon: lon, title: 'My Placemark!'}];
    
  // Push some more closeby points onto the array
  points.push({lat: lat + 0.002, lon: lon - 0.002, title: 'Top Left'});
  points.push({lat: lat + 0.002, lon: lon, title: 'Top Middle'});
  points.push({lat: lat + 0.002, lon: lon + 0.002, title: 'Top Right'});
  
  points.push({lat: lat, lon: lon - 0.002, title: 'Middle Left'});  
  points.push({lat: lat, lon: lon + 0.002, title: 'Middle Right'});
  
  
  points.push({lat: lat - 0.002, lon: lon - 0.002, title: 'Bottom Left'});
  points.push({lat: lat - 0.002, lon: lon, title: 'Bottom Middle'});
  points.push({lat: lat - 0.002, lon: lon + 0.002, title: 'Bottom Right'});
  
  return callback(null, {points: points});
};

exports.getPlacemarks = getPlacemarks;
```

HTML5 Version
====================
The HTML5 version of the UI is the simplest of the 3 packages. The UI is defined in __/client/default/index.html__. It contains a header with a title, and a content div with the __Show Placemarks__ button and the maps div. There is an onclick event bound to the button that calls back to the __map.show()__function. As seen from the code above, this function draws the map in the __maps_div__ and populates it with points.

```html
<!-- Styles -->
<link type="text/css" rel="stylesheet" href="css/style.css"/>
 
<div id="main">
 
  <div id="header">
    <h1 id="header_title">Mapping Example</h1>  
  </div>
  <div id="content">
    <input type="button" value="Show Placemarks" onclick="map.show();">
    <div id="maps_div"></div>
  </div>
 
</div>
 
<!-- Scripts -->
<script type="text/javascript" src="script/map.js"></script>
```

Sencha Version
====================
The Sencha version of the UI is more complex, but has the advantage of using a UI framework that is well tested and also looks good out of the box. In the index.html file for this package (/client/sencha/index.html), there is no UI defined like in the HTML5 version above. It includes the necessary javascript files for the Sencha UI library, and the map.js file. It also includes an initialisation file, /client/sencha/script/init.js, and a UI defintion file, /client/sencha/script/ui_definition.js.

```html
<!-- Required Sencha files -->
<link type="text/css" rel="stylesheet" href="resources/css/sencha-touch.css"/>
<script type="text/javascript" src="resources/sencha-touch.js"></script>
 
<!-- App Files -->
<script type="text/javascript" src="script/map.js"></script>
 
<!-- UI Definition -->
<script type="text/javascript" src="script/ui_definition.js"></script>
 
<!-- Sencha UI initialisation -->
<script type="text/javascript" src="script/init.js"></script>
```

There is no UI constructed in the html because with Sencha, the UI is constructed entirely in javascript. To make this easier to understand, the Sencha UI construction has been abstracted back to a single definition file, /client/sencha/script/ui_definition.js. The object in this file gets passed into the Sencha UI initialisation logic in /client/sencha/script/init.js, which in turn sets up the necessary Sencha UI components to draw the app. The UI defintion file contents are:

```javascript
var menu = [
  {
    title: 'Placemarks',
    items: [
      {
        text: 'Show Placemarks',
        ui_type: 'button',
        handler: 'map.show'
      },
      {
        ui_type: 'panel',
        id: 'maps_div'
      }
    ]
  }
];
```

The __menu__ object is an array that represents the components to show in the main menu. There is only one component here, called 'Placemarks'. This component has an array of __items__ defined. These items are the components to show when the 'Placemarks' menu is selected by the user. There are 2 items, a button, and a panel (or a div). The button has the text 'Show Placemarks' on it, and has a handler set to __map.show__. This means whenever this button is pressed, the __map.show()__ function will be called. The panel has an id of __maps_div__, which means the map will be placed inside this div.

The Sencha UI construction logic in /client/sencha/script/init.js is outside the scope of this tutorial. However, to get get a better understanding of how it works, the __Ext.setup__ function call is a good place to start.

jQuery Mobile Version
====================
In this version of the UI, the entire app layout is defined in /client/jqmobile/index.html. jQuery Mobile works by defining __pages__ that get swapped between as the user navigates through the app. This type of UI is similar to the Sencha version above, and is known as a navigation based UI. There are 3 extra resources included in this version so that the jQuery mobile framework can be used. They are the jQuery and jQuery mobile scripts, and the jQuery mobile styles.

```html
<!-- jQuery Mobile Styles -->
<link type="text/css" rel="stylesheet" href="resources/css/jquery.mobile.1.0a4.1.css"/>
 
<!-- Main page -->
<div id="main" data-nobackbtn="true" data-role="page">
  <div data-role="header">
      <h1>Mapping Example</h1>
  </div>
  <div data-role="content">
    <a href="#map" data-role="button">Show Placemarks</a>
  </div>
</div>
 
<!-- Map page -->
<div id="map" data-position="fixed"  data-role="page">
  <div data-role="header">
    <h1>Placemarks</h1>
  </div>
  <div data-role="content" style="width:100%; height:100%; padding:0;">
    <div id="maps_div" style="width:100%; height:100%;">
    </div>
  </div>
</div>
 
<!--JQuery Mobile-->
<script type="text/javascript" src="resources/jquery.1.6.1.js"></script>
<script type="text/javascript" src="resources/jquery.mobile.1.0a4.1.js"></script>
 
<!-- App Files -->
<script type="text/javascript" src="script/map.js"></script>
<script type="text/javascript" src="script/init.js"></script>
```

There are 2 __pages__ defined in the html above. They are the main page and the map page. The main page is the default page that is shown. It has a header, and a button that switches to the map page. This switching of pages is defined by the __href__ attribute of the button. In jQuery mobile a button is defined by using an anchor tag (&lt;a&gt;) and setting the __data-role__ of it to __button__. On the map page, there is also a header defined, with a title of 'Placemarks'. The maps div is defined as a simple div.

The init.js file (/client/jqmobile/script/init.js) for this version sets up the callback for when the Map page is shown. It sets the size of the maps div so that it fills the available area, and then calls __map.show__.

```javascript
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
```