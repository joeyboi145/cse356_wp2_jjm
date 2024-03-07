let image_map = null
var LAYER = 1;
var V = 1;
var H = 2;
var STYLE = "color";
var imageUrl = `http://209.151.148.61/tiles/l${LAYER}/${V}/${H}.jpg?style=${STYLE}`;
var radioOption = "color";

console.log(window.location.href);

var imageLayer;

function onRadioChange(event) {
  var selectedValue = event.target.value;

  if(selectedValue === 'bw' && STYLE != 'bw') {
    //imageLayer.getElement().style.filter = 'grayscale(100%)';
    console.log("gray");
    STYLE = 'bw'
    imageUrl = `http://209.151.148.61/tiles/l${LAYER}/${V}/${H}.jpg?style=${STYLE}`;
  } else if (selectedValue === 'color' && STYLE != 'color') {
    //imageLayer.getElement().style.filter = '';
    console.log("color");
    STYLE = 'color'
    imageUrl = `http://209.151.148.61/tiles/l${LAYER}/${V}/${H}.jpg?style=${STYLE}`;
  }
    imageUrl = `http://209.151.148.61/tiles/l${LAYER}/${V}/${H}.jpg?style=${STYLE}`;
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
    var img = new Image();

    // const picture_layer = L.tileLayer(`http://209.151.148.61/tiles/l{z}/{x}/{y}.jpg?style=${STYLE}`, {
    //     maxZoom: 19,
    // });

    img.onload = function() {
        // var imageWidth = img.width;
        // var imageHeight = img.height;


        var map = L.map('wp2', {
            zoomControl: false,
            minZoom: 1,
            maxZoom: 8,
            center: [imageHeight / 2, imageWidth / 2],
            zoom: 1,
            // crs: L.CRS.Simple
        });

        var picture_layer = L.tileLayer(`http://209.151.148.61/tiles/l{z}/{y}/{x}.jpg?style=${STYLE}`, {
            minZoom: 1,
            maxZoom: 8,
        }).addTo(map);

        // var southWest = map.unproject([0, imageHeight], map.getMaxZoom() - 1);
        // var northEast = map.unproject([imageWidth, 0], map.getMaxZoom() - 1);
        // var bounds = new L.LatLngBounds(southWest, northEast);
        // map.fitBounds(bounds);
        image_map = map;
    };
    img.src = imageUrl;
}

document.addEventListener('DOMContentLoaded', get_image_map);
