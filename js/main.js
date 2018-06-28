// Initial Variables
var infoWindow, map;
var apiError = ko.observable(false);

var initialMarkers = [
{
  location_name: "Disney's Beach Club Villas",
  lat: 28.371748,
  lng: -81.55492,
  address: "1800 Epcot Resorts Blvd, Lake Buena Vista, FL 32830, USA",
  placeID: "ChIJITTqF6x_3YgRux4zmUJnQZs",
  icon: "img/hotel.png"
},
{
  location_name: "Hurricane Hanna's Grill",
  lat: 28.370711,
  lng: -81.557297,
  address: "1800 Epcot Resorts Blvd, Lake Buena Vista, FL 32830, USA",
  placeID: "ChIJMTszgqx_3YgRK2VXwVg7HIY",
  icon: "img/silverware-variant.png"
},
{
  location_name: "Narcoossee's",
  lat: 28.412621,
  lng: -81.585816,
  address: "4401 Grand Floridian, Orlando, FL 32830, USA",
  placeID: "ChIJTxam8_eRwogRbmd1WgkPBF8",
  icon: "img/silverware-variant.png"
},
{
  location_name: "Epcot",
  lat: 28.374694,
  lng: -81.549404,
  address: "200 Epcot Center Dr, Orlando, FL 32821, USA",
  placeID: "ChIJGzFs3q9_3YgRvZd1y2NSJOo",
  icon: "img/star-face.png"
},
{
  location_name: "The LEGO Store",
  lat: 28.371306,
  lng: -81.515814,
  address: "1672 E Buena Vista Dr, Lake Buena Vista, FL 32830, USA",
  placeID: "ChIJO3vjMIF_3YgRAcjNXo6ZTv4",
  icon: "img/star-face.png"
},
{
  location_name: "The Nomad Lounge",
  lat: 28.3583009,
  lng: -81.5924955,
  address: "Kissimmee, FL 34747, USA",
  placeID: "",
  icon: "img/silverware-variant.png"
},
{
  location_name: "Typhoon Lagoon",
  lat: 28.3658028,
  lng: -81.5317484,
  address: "1145 East Buena Vista Boulevard, Orlando, FL 32830, USA",
  placeID: "ChIJvf5b1IJ_3YgRjllVklxc0aQ",
  icon: "img/hot-tub.png"
},
{
  location_name: "Jiko - The Cooking Place",
  lat: 28.3521361,
  lng: -81.6049018,
  address: "2901 Osceola Pkwy, Orlando, FL 32830, USA",
  placeID: "ChIJZfongZ1-3YgRTKd35P_Shuk",
  icon: "img/silverware-variant.png"
}

]

// Knockout - Model
// The data of each marker used for the list of places
var MapMarker2 = function(markerItem) {
  var self = this;

  this.location_name = markerItem.location_name;
  this.lat = parseFloat(markerItem.lat);
  this.lng = parseFloat(markerItem.lng);
  this.address = markerItem.address;
  this.placeID = markerItem.placeID;
  this.marker = markerItem.marker;
  this.icon = markerItem.icon;
  this.showMarker = ko.observable(true);

};

// Knockout - ViewModel
// Control interactions between the webpage and the data
var ViewModel = function() {
  var self = this;

  this.markerList = ko.observableArray([]);

  this.searchInput = ko.observable('');

  initialMarkers.forEach(function(markerItem){
    self.markerList.push(new MapMarker2(markerItem));
  });

  filteredLocations = ko.computed(function() {
        self.markerList().forEach(function(markerItem) {
            if (self.searchInput()) {
                var match = markerItem.location_name.toLowerCase().indexOf(self.searchInput().toLowerCase()) != -1;
                // find the marker
                markerItem.showMarker(match);
                // control it's visibility based on the filtered list
                markerItem.marker.setVisible(match);
            } else {
                markerItem.showMarker(true);
            }
        });
    });

  // clicked item on list, then open it's InfoWindow
    self.openInfoWindow = function(markerItem) {
        google.maps.event.trigger(markerItem.marker, 'click');
    };

}

// Knockout - View
// Start the whole knockout connections
vm = new ViewModel();
ko.applyBindings(vm);

// If there is an API error, update the error DIV on the website with visable
function setApiError() {
  apiError(true);
}


// Initialize the Google Map
// Build a map, center it, create tons of markers
function initMap() {
  var Disney = {lat:28.375829, lng: -81.558266};
  map = new google.maps.Map(document.getElementById('map'), {
    center: Disney,
    zoom: 12,
  })


  var largeInfowindow = new google.maps.InfoWindow({
        maxWidth:350
    });


  var bounds = new google.maps.LatLngBounds();
    // Following section uses the location array to create a set of markers.
    initialMarkers.forEach(function(place, i) {
        // Get position from location array.
        var position = {lat: place.lat, lng: place.lng};
        var location_name = place.location_name;
        var lat = place.lat;
        var lng = place.lng;
        var address = place.address;
        var placeID = place.placeID;
        var icon = place.icon;

        // Create one marker per location and place in markers array.
        var marker = new google.maps.Marker({
            lat: lat,
            lng: lng,
            position: position,
            location_name: location_name,
            address: address,
            placeID: placeID,
            animation: google.maps.Animation.DROP,
            id: i,
            map: map,
            icon: icon
        });

        // Call function to trigger marker bounce on click.
        marker.addListener('click', toggleBounce);

        // Add marker as a property of each Location.
        place.marker = marker;

        vm.markerList()[i].marker = marker;

        // Create onclick event that opens an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });

        // Google function to bounce a marker
        function toggleBounce() {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                stopBounceAnimation(marker);
            }
        }

        function stopBounceAnimation() {
            setTimeout(function () {
                marker.setAnimation(null);
            }, 1000);
        }

    });

    // This function populates the infowindow when marker is clicked.
    // Only one infowindow is allowed to be open at a time and it's
    // contents are populated based upon that markers location.
    function populateInfoWindow(marker, infowindow) {
        // Ensure infowindow isn't already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('');
            infowindow.open(map, marker);
            // Ensure marker property is cleared if infowindow is closed.
            infowindow.addListener('closeclick',function(){
                infowindow.setMarker = null;
            });

          // Setup call to foursquare's API
          // Establish variables for data returned from fourSQ
          var lat = marker.lat;
		  var lng = marker.lng;
		  var fourSQ_ID;
		  var fourSq_Name;
		  var fourSq_Address;
		  var picURL;
		  var url = "https://api.foursquare.com/v2/venues/search/?" + $.param({
		    client_id: "U1XOXNRNDQERHG2KYML4A0R3REQMYL3SQTRUPRVKDWLSNEUS",
		    client_secret: "THZFVY4HWPC1DV5XCAWCK5A2CIGB2OERGSNXYWSBX5WOOSIL",
		    v: "20180323",
		    ll: lat + ',' + lng,
		    query: marker.location_name,
		    limit: "1"
		  });

		  $.ajax(url, {
		    dataType: "jsonp",
		    success: function(data) {
		      fourSQ_ID = data.response.venues[0].id;
		      fourSq_Name = data.response.venues[0].name;
		      fourSq_Address = data.response.venues[0].location.formattedAddress[0];
		      getPhoto(fourSQ_ID, fourSq_Name, fourSq_Address);
		    },
		    // Catch any JSON errors
		    error: function(xhr, status, error) {
		    	alert(xhr.responseText);
		    	setApiError();
		    }
		  });

		  // Call Foursquare's photo API
		  function getPhoto(fourSQ_ID, fourSq_Name, fourSq_Address) {
		    url = "https://api.foursquare.com/v2/venues/" + fourSQ_ID + "/photos/?" + $.param({
		      client_id: "U1XOXNRNDQERHG2KYML4A0R3REQMYL3SQTRUPRVKDWLSNEUS",
		      client_secret: "THZFVY4HWPC1DV5XCAWCK5A2CIGB2OERGSNXYWSBX5WOOSIL",
		      v: "20180323",
		      limit: "1"
		    });

		    $.ajax(url, {
		      dataType: "jsonp",
		      success: function(data) {
		      	// To Do: Handle Foursquare quota exceeded
		      	// if ((data.meta.errorType == "quota_exceeded") && (data.meta.code = "429")){
		      	// 	console.log("Foursquare Photos Quota Exceeded");
		      	// 	setApiError();
		      	// 	infowindow.setContent('<div class="marker-name">' + fourSq_Name +
		       //      '</div><div class="marker-address">' + fourSq_Address +
		       //      '</div><a href="http://foursquare.com/v/' + fourSq_Name + '/' + fourSQ_ID +
		       //      '?ref=U1XOXNRNDQERHG2KYML4A0R3REQMYL3SQTRUPRVKDWLSNEUS" target="_blank">' +
		       //      '<figure class="marker-location-img"><img src="img/image.png" id="infobox"></figure></a>' +
		       //      '<img class="foursquareImg" src="img/Powered-by-Foursquare-full-color-300.png">');
		      	// }
		      	// else {
		        var photos = data.response.photos.items;
		        photos.forEach(function(photo) {
		        picURL = photo.prefix + "height500" + photo.suffix;
		          infowindow.setContent('<div class="marker-name">' + fourSq_Name +
		            '</div><div class="marker-address">' + fourSq_Address +
		            '</div><a href="http://foursquare.com/v/' + fourSq_Name + '/' + fourSQ_ID +
		            '?ref=U1XOXNRNDQERHG2KYML4A0R3REQMYL3SQTRUPRVKDWLSNEUS" target="_blank">' +
		            '<figure class="marker-location-img"><img src="' + picURL +
		            '" id="infobox"></figure></a>' +
		            '<img class="foursquareImg" src="img/Powered-by-Foursquare-full-color-300.png">');
		        });
		    },
		      // Catch any JSON errors
		    error: function(xhr, status, error) {
		    	alert(xhr.responseText);
		    	setApiError();
		    }
		    })};

          // Open infowindow with Foursquare and provided Information
          infowindow.open(map, marker);

        } // ENd of the if statement

    } // End of the populateInfoWindow function

}    // End of the initMap Function

// END OF FILE





