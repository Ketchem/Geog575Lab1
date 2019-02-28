// TODO: Add additional slider for ?
// TODO: Create Legend
// TODO: Create informational panel 

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

// add the mapbox tiles to the map object
map.addLayer(mapboxTiles)
// displays the date slider value on the page

// create the slider on the map
function createSequenceControls(map, attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            $(container).append('<button class = "mapControls" id="back"><i class="fa fa-step-backward"></i></button>');

            //create range input element (slider)
            $(container).append('<input class="range-slider mapControls" min="1990" max="2018" value="1" type="range" id="mapSlider">');

            $(container).append('<button class = "mapControls" id="forward"><i class="fa fa-step-forward"></i></button>');
            $(container).append('<button id="play"><i class="fa fa-play"></i></button>');

            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });

            return container;
        }
    });

    map.addControl(new SequenceControl());
}

createSequenceControls(map);


function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            var svg = createLegendCircle(34);

            $(container).append("<p>Year <span>1990</span></p>");
            //add attribute legend svg to container
            // console.log(svg);

            for (var i = 3; i>0; i--){
                var svg = createLegendCircle(8*i*2);
                $(container).append(svg);
            }
            // $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
};

createLegend(map);


var activeLayer;
var dateSlider = document.querySelector("#mapSlider");
//var output = document.getElementById("yearDisplay");
var year = dateSlider.value;
// console.log(year);
var attribute = "gini" + year;

//$(".legend-control-container").html("Year " + dateSlider.value);

// output.innerHTML = dateSlider.value; 
// dateSlider.oninput = function() {
//     output.innerHTML = this.value;
// }
// --------------------------------------------------------------------------
//2. Import GeoJSON data
//3. Add circle markers for point features to the map - in callback
// calls the funciton to load the first layer
jQueryAjaxStates();
// --------------------------------------------------------------------------


// Changes the display data when the slider date is changed
dateSlider.addEventListener("change", function(){
    year = this.value;
    updateYear(year);
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
                },
                click: function(){
                    $("#featureInfo").html(popupContent);
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

$("#back").click(function(){
    if (year > 1990){
        year = Number(year) - 1;
        updateYear(year);
    }
    // console.log("button clicked");
});

$("#forward").click(function(){
    if (year < 2018){
        year = Number(year) + 1;
        updateYear(year);
    }
    // console.log("button clicked");

});

function updateYear(year){
    //year = dateSlider.value;
    dateSlider.value = year;
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
    $("#featureInfo").html("");
    //$(".legend-control-container").html("Year " + dateSlider.value);
};


function createLegendCircle(diameter){
    //Step 1: start attribute legend svg string
    var svg = '<svg x="0px" y="0px"'
    svg += 'width="' + diameter + 'px" height="'+diameter +'px" viewBox="0 0 180 180" enable-background="new 0 0 180 180" xml:space="preserve">'
    svg+= '<g opacity="0.8">'
    svg += '<circle fill="#FF7800" cx="90" cy="90" r="90"/>'
    svg += '<path d="M90,1c49.0748,0,89,39.9252,89,89s-39.9252,89-89,89S1,139.0748,1,90S40.9252,1,90,1 M90,0C40.2944,0,0,40.2944,0,90'
    svg += 's40.2944,90,90,90s90-40.2944,90-90S139.7056,0,90,0L90,0z"/></g></svg>';

    return svg;
};


$("#mapSlider").change(function(){
    console.log(this.value);
});
