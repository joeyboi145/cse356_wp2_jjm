let image_map = null
var STYLE = "color";
var domain = "jrgroup.cse356.compas.cs.stonybrook.edu"
var imageUrl = `http://${domain}/tiles/l${LAYER}/${V}/${H}.jpg?style=${STYLE}`;
var radioOption = "color";

console.log(window.location.href);

var imageLayer;

function onRadioChange(event) {
  var selectedValue = event.target.value;

  if(selectedValue === 'bw' && STYLE != 'bw') {
    //imageLayer.getElement().style.filter = 'grayscale(100%)';
    console.log("gray");
    STYLE = 'bw'
    imageUrl = `http://${domain}/tiles/l${LAYER}/${V}/${H}.jpg?style=${STYLE}`;
  } else if (selectedValue === 'color' && STYLE != 'color') {
    //imageLayer.getElement().style.filter = '';
    console.log("color");
    STYLE = 'color'
    imageUrl = `http://${domain}/tiles/l${LAYER}/${V}/${H}.jpg?style=${STYLE}`;
  }
    imageUrl = `http://${domain}/tiles/l${LAYER}/${V}/${H}.jpg?style=${STYLE}`;
    image_map.off();
    image_map.remove();
    get_image_map();
}

var radios = document.getElementById('radios').querySelectorAll('input[type="radio"][name="option"]');
radios.forEach(function(radio) {
    if(radio.id == radioOption){
      radio.checked = true;
    }
    radio.addEventListener('change', onRadioChange);
});

function get_image_map(){
    console.log("rended");
    var img = new Image();


    img.onload = function() {
        console.log(img.width)
        console.log(img.height)
        var imageWidth = img.width;
        var imageHeight = img.height;


        // console.log(map.zoom);
        // map.setView([imageHeight / 2, imageWidth / 2]);

        //   var tileLayer = L.tileLayer(`http://${domain}/tiles/l{z}/{y}/{x}.jpg?style=${STYLE}`, {
        //     noWrap: true
        // }).addTo(map);

        var CustomTileLayer = L.TileLayer.extend({
            getTileUrl: function(coords) {
                // Clamp x, y, and z values to the range of 1 to 10
                var x = coords.x;
                var y = coords.y;
                var z = coords.z;
                console.log(z, y, x);

                return `http://${domain}/tiles/l${z}/${y+1}/${x+1}.jpg?style=${STYLE}`;
            }
        });


        var corner1 = L.latLng(40.712, -74.227)
        corner2 = L.latLng(40.774, -74.125),
        bounds = L.latLngBounds(corner1, corner2);

        var tileLayer = new CustomTileLayer(`http://${domain}/tiles/l{z}/{y}/{x}.jpg?style=${STYLE}`, {
            noWrap: true,
            minZoom: 1,
            maxZoom: 8,
            bound: [[500,-500], [-500,500]],
        })

    // var bounds = tileLayer.getBounds();
    // console.log(bounds.toString())
    // var latLng = bounds.getCenter();
    // console.log(latLng.toString())


        var map = L.map('wp2', {
            zoomControl: false,
            minZoom: 4,
            maxZoom: 8,
            zoom: 4,
        });

        // Define a function to handle click events on the map
        function onMapClick(e) {
            alert("You clicked the map at " + e.latlng);
        }

        // Add a click event listener to the map, which calls the onMapClick function
        map.on('click', onMapClick);

        var corner1 = L.latLng(40.712, -74.227)
        corner2 = L.latLng(40.774, -74.125),
        bounds = L.latLngBounds(corner1, corner2);
        
        // Calculate the center of the image bounds
        var center = bounds.getCenter();

        // Set the center of the map to the center of the image bounds
        map.setView(center, 4);

        // Fit the map bounds to the image bounds
        map.fitBounds(bounds);

        tileLayer.addTo(map);
        image_map = map;
        console.log("hi")
        console.log("TO STRING: " + bounds.getCenter().toString())
    };
    img.src = imageUrl;
}

document.addEventListener('DOMContentLoaded', get_image_map);
