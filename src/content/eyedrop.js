const numberOfCell = 10;
const numberOfCellSide = 5;
let mainColor;

const rgbToHex = (r, g, b) => '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'eyedropper_color_picker_popup') {
        init();
    }
});

function disableScrolling(){
    var x=window.scrollX;
    var y=window.scrollY;
    window.onscroll=function(){window.scrollTo(x, y);};
}

function enableScrolling(){
    window.onscroll=function(){};
}

function init() {
    disableScrolling();
    let port = chrome.runtime.connect({name: 'eyedropp_color_picker'});
    port.postMessage({data: 'start'});
    port.onMessage.addListener(function (res) {
        let cover = document.createElement('div');
        cover.style.position = 'fixed';
        cover.style.top = '0';
        cover.style.left = '0';
        cover.style.bottom = '0';
        cover.style.right = '0';
        cover.style.zIndex = '99999999';
        cover.classList.add('color__picker__extension__cover');
        document.body.appendChild(cover);

        let element = document.createElement('div');
        element.classList.add('color__picker__extension');
        cover.appendChild(element);

        for (let line = 0 ; line <= numberOfCell ; line++) {
            for (let column = 0 ; column <= numberOfCell ; column++) {
                let newElement = document.createElement('span');
                newElement.classList.add(`color__picker__extension_one_pixel`);
                newElement.classList.add(`color__picker__extension_${line}_${column}`);
                element.appendChild(newElement);
            }
        }

        let colorText = document.createElement('div');
        colorText.classList.add('color__picker__extension_actual_color');
        element.appendChild(colorText);

        let imgCanvas = document.createElement('canvas');
        let imgContext = imgCanvas.getContext('2d');

        // Make sure canvas is as big as the picture
        imgCanvas.width = document.body.offsetWidth * window.devicePixelRatio;
        imgCanvas.height = cover.offsetHeight * window.devicePixelRatio;

        // Draw image into canvas element
        let image = new Image();
        image.addEventListener('load', () => {
            imgContext.drawImage(image, 0, 0, imgCanvas.width, imgCanvas.height);
            let imageData = imgContext.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
            const mouseMoveFunction = (event) => {
                let top = event.clientY - (numberOfCell * numberOfCellSide / 2);
                let left = event.clientX - (numberOfCell * numberOfCellSide / 2);
                element.style.top = top + 'px';
                element.style.left = left + 'px';
                for (let line = -(numberOfCell / 2) ; line <= numberOfCell / 2 ; line++) {
                    for (let column = -(numberOfCell / 2) ; column <= numberOfCell / 2 ; column++) {
                        let x = (event.clientX * window.devicePixelRatio) + column;
                        let y = (event.clientY * window.devicePixelRatio) + line;
                        let colors = getPixelXY(imageData, x, y);
                        let elementPixel = document.querySelector(`.color__picker__extension_${line + numberOfCell / 2}_${column + numberOfCell / 2}`);
                        elementPixel.style.backgroundColor = `rgb(${colors[0]},${colors[1]},${colors[2]})`;

                        if (line === 0 && column === 0) {
                            mainColor = colors;
                            colorText.innerHTML = rgbToHex(mainColor[0], mainColor[1], mainColor[2]);
                        }
                    }
                }
            };
            window.addEventListener('mousemove', mouseMoveFunction);

            const clickWindow = () => {
                enableScrolling();
                document.querySelector('.color__picker__extension__cover').remove();
                window.removeEventListener('mousemove', mouseMoveFunction);
                window.removeEventListener('click', clickWindow);

                let output = document.createElement('input');
                output.setAttribute('type', 'text');
                output.setAttribute('value', rgbToHex(mainColor[0], mainColor[1], mainColor[2]));
                document.body.appendChild(output);
                output.select();
                document.execCommand('copy');
                document.body.removeChild(output);
            };

            window.addEventListener('click', clickWindow);
        });
        image.src = res.data;
    });
}

function getPixel(imgData, index) {
    let i = index * 4, d = imgData.data;
    return [
        d[i],
        d[i + 1],
        d[i + 2],
        d[i + 3]
    ]; // Returns array [R,G,B,A]
}

// AND/OR

function getPixelXY(imgData, x, y) {
    return getPixel(imgData, y * imgData.width + x);
}
