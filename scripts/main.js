var accessToken = 'pk.eyJ1Ijoia2V0Y2hlbTIiLCJhIjoiY2pjYzQ5ZmFpMGJnbTM0bW01ZjE5Z2RiaiJ9.phQGyL1FqTJ-UlQuD_UFpg';
// Replace 'mapbox.streets' with your map id.
var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + accessToken, {
    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var map = L.map('map')
    .addLayer(mapboxTiles)
    .setView([38, -96], 4);

var activeLayer;
var loadCities = document.querySelectorAll("button")[0]
var loadStates = document.querySelectorAll("button")[1]
var removeButton = document.querySelectorAll("button")[2]

var dateSlider = document.querySelector("#year");
var output = document.getElementById("yearDisplay");
output.innerHTML = dateSlider.value; 

dateSlider.oninput = function() {
    output.innerHTML = this.value;
    //call update map
  }

//define AJAX function
function jQueryAjaxStates(){
    //basic jQuery ajax method
    $.ajax("assets/data/StatesGini.geojson", {
        dataType: "json",
        success: callback
    });
};

function jQueryAjaxCities(){
    //basic jQuery ajax method
    $.ajax("assets/data/cities.geojson", {
        dataType: "json",
        success: callback
    });
};

//define callback function
function callback(response, status, jqXHRobject){
    //tasks using the data go here
    var features = response;
    activeLayer = L.geoJSON(features, {
        pointToLayer: function(feature, latlng){;
            return L.circleMarker(latlng, geojsonMarkerOptions).bindPopup(feature.properties.State);
        }
    });

    activeLayer.addTo(map);
    //console.log(response);
};

loadCities.addEventListener("click", function(){
    jQueryAjaxCities();
})


loadStates.addEventListener("click", function(){
    jQueryAjaxStates();
})


removeButton.addEventListener("click", function(){
    map.removeLayer(activeLayer);
});

//$(document).ready(jQueryAjax);

//https://api.mapbox.com/styles/v1/ketchem2/cjrv9fwlk17yh1fpvk22yhgyu/wmts?access_token=pk.eyJ1Ijoia2V0Y2hlbTIiLCJhIjoiY2pjYzQ5ZmFpMGJnbTM0bW01ZjE5Z2RiaiJ9.phQGyL1FqTJ-UlQuD_UFpg

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
