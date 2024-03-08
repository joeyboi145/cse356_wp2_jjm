// INSERTED inside of index.html

var STYLE = "color";
var domain = "jrgroup.cse356.compas.cs.stonybrook.edu"
var radioOption = "color";

function onRadioChange(event) {
    var selectedValue = event.target.value;

    if (selectedValue === 'bw' && STYLE != 'bw') {
        console.log("gray");
        STYLE = 'bw'
    } else if (selectedValue === 'color' && STYLE != 'color') {
        console.log("color");
        STYLE = 'color'
    }
}

var radios = document.getElementById('radios').querySelectorAll('input[type="radio"][name="option"]');
radios.forEach(function (radio) {
    if (radio.id == radioOption) {
        radio.checked = true;
    }
    radio.addEventListener('change', onRadioChange);
});

var viewer = OpenSeadragon({
    id: "openseadragon-container",
    prefixUrl: `http://${domain}`, // optional path to OpenSeadragon images
    tileSources: {
        height: 512 * 512,
        width: 512 * 512,
        tileSize: 512, // Size of each tile
        tileOverlap: 0, // Overlap between tiles
        maxLevel: 7, // Maximum level
        getTileUrl: function (level, x, y) {
            return `/tiles/l${level + 1}/${y + 1}/${x + 1}.jpg?style=${STYLE}`; // Construct URL for each tile
        }
    }
});

viewer.addHandler("tile-loaded", function (event) {
    var tile = event.tiledImage;
    var tileUrl = tile.source;

    // Check if the tile URL or response status matches the condition
    if (event.request.statusText === "400") {
        // Stop loading further tiles
        viewer.clearOverlays(); // Optional: Clear overlays if any
        viewer.navigator.clearOverlays(); // Optional: Clear navigator overlays if any
        viewer.setMouseNavEnabled(false); // Disable mouse navigation
        viewer.setKeyboardNavEnabled(false); // Disable keyboard navigation
        // Optionally, display a message to the user or perform other actions
        console.log("Tile loading stopped due to HTTP status: 400");
    }
});
