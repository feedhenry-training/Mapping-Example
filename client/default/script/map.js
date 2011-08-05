var map = function () {
  var self = {
    
    // Show the map on screen
    show: function () {
      var lat = 52.88,
          lon = -7.96; // Location of Moneygall, Co. Offaly
          
      //Pass lat & lon into map api, initialising map at that point
      $fh.map({
        target: document.getElementById('maps_div'),
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
    },
    
    populateMap: function (lat, lon) {
      $fh.act({
        act: 'getPlacemarks',
        req: {
          lat: lat,
          lon: lon
        }
      }, function (res) {
        var points = res.points;
              
        // Iterate over the points array, adding each to the map
        for (var pi=0,pl=points.length; pi<pl; pi++) {
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
    }
  };

  return {
    show: self.show
  };
}();
