
let dragme = false;
let level = 1;
let horizontal = 1;
let verticle = 1;
let style = "color";

function handleDragOnClick(event){
    dragme = true;
    console.log("MOUSE CLICK");
}

function handleDragOffClick(event){
    dragme = false;
    console.log("MOUSE LIFT");
}

// function getOffset(element) {
//     let rect = element.getBoundingClientRect();
//     return {
//         left: rect.left + window.scrollX,
//         top: rect.top + window.scrollY
//     };
// }

// function handleDragMovement(event){
//     if (dragme) {
//         let X_offset = event.movementX;
//         let Y_offset = event.movementY;

//         var d = document.getElementById('display');
//         d.style.position = "absolute";
//         d.style.left = getOffset(event.target).left + X_offset + 'px';
//         d.style.top = getOffset(event.target).top + y_pos+'px';
//     }
// }

async function get_display_image(){
    let path = "http://209.151.148.61/tiles/";
    path += "l" + level + "/" + verticle + "/" + horizontal + ".jpg?style=" + style;
    console.log("GETTING IMAGE: " + path)
    const response = await fetch(path);

    if (response.status === 200) {
        const imageBlob = await response.blob()
        const imageObjectURL = URL.createObjectURL(imageBlob);

        const image = document.createElement('img')
        image.src = imageObjectURL

        const container = document.getElementById("display_image")
        container.append(image)
    }
    else {
        console.log("HTTP-Error: " + response.status)
    }
}

document.addEventListener('DOMContentLoaded', get_display_image);
console.log(document.getElementById('display_image'))
