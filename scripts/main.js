// TODO: Fix Legend (Add text)
// TODO: Adjust informational panel 
// TODO: Add 5th Map Function
// TODO: Add Mouse down function to slider buttons
// TODO: Animate Play Button

// --------------------------------------------------------------------------
// DEFINE GLOBAL VARIABLES
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
// Layer of objects to be manipulated
var activeLayer;
var filterVal = 0;
// END DEFINE GLOBAL VARIABLES
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// BUILD MAP
// add the mapbox tiles to the map object
map.addLayer(mapboxTiles)
// displays the date slider value on the page
createSequenceControls(map);
// Creates the temporal legend and Symbols
createLegend(map);
// Creates the reset map button and immediately hides it
createResetControl(map);
$("#resetMap").hide();
// END BUILD MAP
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// DEFINE MAP DEPENDANT VARIABLES 
var dateSlider = document.querySelector("#mapSlider");
var year = dateSlider.value;
var attribute = "gini" + year;
// END DEFINE MAP DEPENDANT VARIABLES 
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// LOAD THE STARTUP LAYER
getPoints();
// END LOAD THE STARTUP LAYER
// --------------------------------------------------------------------------



// --------------------------------------------------------------------------
// ADD EVENT LISTENERS
// Changes the display data when the slider date is changed
dateSlider.addEventListener("change", function(){
    year = this.value;
    updateMap(year);
    updateLegend(year);
});

$("#back").click(function(){
    if (year > 1990){
        year = Number(year) - 1;
        updateMap(year);
        updateLegend(year);
    }
    // console.log("button clicked");
});

$("#forward").click(function(){
    if (year < 2018){
        year = Number(year) + 1;
        updateMap(year);
        updateLegend(year);
    }
    // console.log("button clicked");

});

$(".legend-circle").mouseover(function(){
    this.setAttribute("stroke","#f4f142");
});

$(".legend-circle").mouseout(function(){
    this.setAttribute("stroke","#000000");
});

$("#max").click(function(){
    $("#min")[0].setAttribute("fill","#ffdcbf");
    $("#mean")[0].setAttribute("fill","#ffdcbf");
    $("#max")[0].setAttribute("fill","#ff7800");
    filterVal = 3;
    $("#resetMap").show();
    updateMap(year);
});

$("#mean").click(function(){
    $("#min")[0].setAttribute("fill","#ffdcbf");
    $("#max")[0].setAttribute("fill","#ffdcbf");
    $("#mean")[0].setAttribute("fill","#ff7800");
    filterVal = 2;
    $("#resetMap").show();
    updateMap(year);
});

$("#min").click(function(){
    $("#max")[0].setAttribute("fill","#ffdcbf");
    $("#mean")[0].setAttribute("fill","#ffdcbf");
    $("#min")[0].setAttribute("fill","#ff7800");
    filterVal = 1;
    $("#resetMap").show();
    updateMap(year);
});

$("#resetMap").click(function(){
    $("#min")[0].setAttribute("fill","#ff7800");
    $("#mean")[0].setAttribute("fill","#ff7800");
    $("#max")[0].setAttribute("fill","#ff7800");
    filterVal = 0;
    $("#resetMap").hide();
    updateMap(year);
});

// END ADD EVENT LISTENERS
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// DEFINE FUNCTIONS

function updateMap(year){
    //year = dateSlider.value;
    dateSlider.value = year;
    attribute = "gini" + year;
    //check for layer
    if(activeLayer){
        //remove old layer
        map.removeLayer(activeLayer);
        //add new layer
        getPoints();
    }
    else {
        getPoints();
    }
    $("#featureInfo").html("");
    //$(".legend-control-container").html("Year " + dateSlider.value);
};

function updateLegend(year){
    $("#legendYear").html(year);

    var circleRadii = getCircleRadii();
    var circleText = getCircleValues();

    for (var key in circleRadii){
        //get the radius
        var radius = circleRadii[key];

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });

        //Step 4: add legend text
        $('#'+key+'-text').text(circleText[key]);
    };

};

function getCircleRadii(){
    // return values as an object
    // Values are hard coded from Jenks Natural Breaks definied in getRadius
    return {
        max: 24,
        mean: 16,
        min: 8
    };
};

function getCircleValues(){
    return {
        max: ".495 - .567",
        mean: ".463 - .494",
        min: ".362 - .462"
    };
};

// Get the radius for a symbol based on the attribute gini
function getRadius(gini){
    // Used Natural Breaks (Jenks) for gini 2018 values
    // 0 - .462 | .463 - .494 | .495 - above
    if (gini <= .462 && (filterVal === 0 || filterVal === 1)){
        return 8;
    }
    else if (gini > .462 && gini <= .494 && (filterVal === 0 || filterVal === 2)){
        return 16;
    }
    else if (gini > .494 && (filterVal === 0 || filterVal === 3)){
        return 24;
    }
    else {
        return 0;
    }
}

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

// create the popup content
function getPopup(feature){
    var popupContent = "";
    popupContent += "<p>" + "State" + ": " + feature.properties["stateName"] + "</p>";
    popupContent += "<p>" + "Gini " + year + ": " + feature.properties[attribute] + "</p>";

    return popupContent;
};


//define AJAX function
function getPoints(){
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
    console.log(features);
    if (filterVal === 1){
        
    }
    else if (filterVal === 2){

    }
    else if (filterVal === 3){

    }
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
};

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
            // $(container).append('<button id="play"><i class="fa fa-play"></i></button>');

            // If the user double clicks prevent zooming in 
            $(container).on('dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });

            // Prevents the map from moving when the slider is being dragged
            $(container).on('mousedown', function(e){
                map.dragging.disable();
            });
            $(container).on('mouseup', function(e){
                map.dragging.enable();
            });


            return container;
        }
    });

    map.addControl(new SequenceControl());
}

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            $(container).append('<p class = "legendText">Gini Year <span id="legendYear">1990</span></p>');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            // object of circles to base loop on
            var circles = {
                max: 20,
                mean: 40,
                min: 60
            };
    

            //Step 2: loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';
    
                //text string
                svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
    updateLegend(year);
};

// create the slider on the map
function createResetControl(map, attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'reset-control-container');

            $(container).append('<button class = "mapControls" id="resetMap">Remove Filter</button>');

            // If the user double clicks prevent zooming in 
            $(container).on('dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });

            return container;
        }
    });

    map.addControl(new SequenceControl());
}

// END DEFINE FUNCTIONS
// --------------------------------------------------------------------------
