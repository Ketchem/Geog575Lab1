// mapbox access token
var accessToken = 'pk.eyJ1Ijoia2V0Y2hlbTIiLCJhIjoiY2pjYzQ5ZmFpMGJnbTM0bW01ZjE5Z2RiaiJ9.phQGyL1FqTJ-UlQuD_UFpg';
//  mapbox tiles
var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + accessToken, {
    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
// create the map object and set the center and zoom
var map = L.map('map', {
    center: [38, -96], 
    zoom: 4
});

var activeLayer;

var dateSlider = document.querySelector("#year");
var output = document.getElementById("yearDisplay");
var year = dateSlider.value;
var attribute = "gini" + year;

// add the mapbox tiles to the map object
map.addLayer(mapboxTiles)
// displays the date slider value on the page
output.innerHTML = dateSlider.value; 
dateSlider.oninput = function() {
    output.innerHTML = this.value;
}

// calls the funciton to load the first layer
jQueryAjaxStates();

// Changes the display data when the slider date is changed
dateSlider.addEventListener("change", function(){
    year = this.value;
    attribute = "gini" + year;
    //check for layer
    if(activeLayer){
        //remove old layer
        map.removeLayer(activeLayer);
        //add new layer
        jQueryAjaxStates();
    }
    else {
        jQueryAjaxStates();
    }
});

//define AJAX function
function jQueryAjaxStates(){
    //basic jQuery ajax method
    $.ajax("assets/data/StatesGini.geojson", {
        dataType: "json",
        success: callback
    });
};

//define callback function
function callback(response, status, jqXHRobject){
    //tasks using the data go here
    //get the features
    var features = response;
    //create the popup content for each feature
    //create the layer from points
    //return the layer with the popup
    activeLayer = L.geoJSON(features, {
        pointToLayer: function(feature, latlng){;
            var popupContent = ""
            return L.circleMarker(latlng, createPropSymbols(feature)).bindPopup(getPopup(feature));
        }
    });
    activeLayer.addTo(map);
};

// create the popup content
function getPopup(feature){
    var popupContent = "";
    popupContent += "<p>" + "State" + ": " + feature.properties["stateName"] + "</p>";
    popupContent += "<p>" + attribute + ": " + feature.properties[attribute] + "</p>";

    return popupContent;
};

// assign the properties to the symbols including the radius
function createPropSymbols(feature){
    var gini = Number(feature.properties[attribute]);
    var geojsonMarkerOptions = {
        radius: getRadius(gini),
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    return geojsonMarkerOptions;
};

// Get the radius at specified intervals
function getRadius(gini){
    if (gini <= .46){
        return 8;
    }
    else if (gini > .46 && gini <= .48){
        return 16;
    }
    else {
        return 24;
    }
}