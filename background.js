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
        startTimer(request.tabId, request.minutes);
    }
});

function startTimer(tabId, minutes) {
    if (timers[tabId]) {
        clearInterval(timers[tabId].interval);
    }

    timers[tabId] = { endTime: Date.now() + minutes * 60000, interval: null };
    timers[tabId].interval = setInterval(() => updateIcon(tabId), 1000);
    updateIcon(tabId);  // Immediately update the icon
}

function updateIcon(tabId) {
    if (timers[tabId]) {
        let remaining = timers[tabId].endTime - Date.now();
        if (remaining <= 0) {
            chrome.action.setBadgeText({ text: '0:00', tabId });
            clearInterval(timers[tabId].interval);
            delete timers[tabId];
        } else {
            let minutes = Math.floor(remaining / 60000);
            let seconds = Math.floor((remaining % 60000) / 1000);
            let text = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            chrome.action.setBadgeText({ text, tabId });
        }
    } else {
        chrome.action.setBadgeText({ text: '', tabId });
    }
}
