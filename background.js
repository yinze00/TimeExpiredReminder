let timers = {};
let currentTabId = null;

chrome.tabs.onActivated.addListener(activeInfo => {
    currentTabId = activeInfo.tabId;
    updateIcon(currentTabId);
});

chrome.tabs.onRemoved.addListener(tabId => {
    if (timers[tabId]) {
        clearInterval(timers[tabId].interval);
        delete timers[tabId];
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startTimer') {
        startTimer(request.tabId);
    }
});

function startTimer(tabId) {
    if (!timers[tabId]) {
        timers[tabId] = { startTime: Date.now(), interval: null };
        timers[tabId].interval = setInterval(() => updateIcon(tabId), 1000);
    }
}

function updateIcon(tabId) {
    if (timers[tabId]) {
        let elapsed = Math.floor((Date.now() - timers[tabId].startTime) / 1000);
        let minutes = Math.floor(elapsed / 60);
        let seconds = elapsed % 60;
        let text = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        chrome.action.setBadgeText({ text, tabId });
    } else {
        chrome.action.setBadgeText({ text: '', tabId });
    }
}
