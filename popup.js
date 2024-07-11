document.getElementById('startTimer').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.runtime.sendMessage({ action: 'startTimer', tabId: tabs[0].id });
    });
});
