document.getElementById('button_color_picker').addEventListener('click', () => {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {'message': 'eyedropper_color_picker_popup'});
        window.close();
    });
});


let port = chrome.runtime.connect({name: 'eyedropp_color_picker_setup'});
port.postMessage({data: 'can_pick'});
port.onMessage.addListener(function (res) {
    console.log(res.data);
});
