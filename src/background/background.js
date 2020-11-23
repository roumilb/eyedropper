chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === 'eyedropp_color_picker') takePicture(port);
});

function takePicture(port) {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        // and use that tab to fill in out title and url
        let tab = tabs[0];
        if (tab.url !== undefined) {
            chrome.tabs.captureVisibleTab({
                'format': 'jpeg',
                'quality': 100
            }, (screenshotUrl) => {
                port.postMessage({data: screenshotUrl});
            });
        }
    });
}
