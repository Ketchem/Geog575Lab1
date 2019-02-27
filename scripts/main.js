// TODO: Add additional slider for year
// TODO: Create Legend
// TODO: Create informational panel 

//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//1. Create the Leaflet map
//2. Import GeoJSON data--done (in getData())
//3. Add circle markers for point features to the map--done (in AJAX callback)
//4. Determine which attribute to visualize with proportional symbols
//5. For each feature, determine its value for the selected attribute
//6. Give each feature's circle marker a radius based on its attribute value

// --------------------------------------------------------------------------
//1. Create the Leaflet map
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
// --------------------------------------------------------------------------
//2. Import GeoJSON data
//3. Add circle markers for point features to the map - in callback
// calls the funciton to load the first layer
jQueryAjaxStates();
// --------------------------------------------------------------------------


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
        success: createLayer
    });
};

//define callback function
function createLayer(response, status, jqXHRobject){
    // get the features
    var features = response;

    // Set the variable active layer = to leaflet layer created from the features
    activeLayer = L.geoJSON(features, {
        // create the layer from points
        pointToLayer: function(feature, latlng){;
            // Get the symbol options
            var options = createSymbol(feature);

            // Create the circleMarker layer from each circle
            var layer = L.circleMarker(latlng, options);

            // create the popup content for each feature
            var popupContent = getPopup(feature);

            // add the popup to the features
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-options.radius)
            });

            // event listeners to open popup on hover
            layer.on({
                mouseover: function(){
                    this.openPopup();
                },
                mouseout: function(){
                    this.closePopup();
                }
            });

            // return the layer with the popup
            return layer;
        }
    });
    activeLayer.addTo(map);

    // activeLayer.on({
    //     mouseover: function(){
    //         //this.openPopup();
    //         console.log(this);
    //     },
    //     mouseout: function(){
    //         //this.closePopup();
    //         console.log(this);
    //     }
    // });

};

// create the popup content
function getPopup(feature){
    var popupContent = "";
    popupContent += "<p>" + "State" + ": " + feature.properties["stateName"] + "</p>";
    popupContent += "<p>" + "Gini " + year + ": " + feature.properties[attribute] + "</p>";

    return popupContent;
};

// assign the properties to the symbols including the radius
function createSymbol(feature){
    // Attribute is a global variable retreived from the date slider
    var gini = Number(feature.properties[attribute]);
    // Sets the options for the marker including radius
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

// Get the radius for a symbol based on the attribute gini
function getRadius(gini){
    // Used Natural Breaks (Jenks) for gini 2018 values
    // 0 - .462 | .463 - .494 | .495 - above
    if (gini <= .462){
        return 8;
    }
    else if (gini > .462 && gini <= .494){
        return 16;
    }
    else {
        return 24;
    }
}
