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

chrome.commands.onCommand.addListener(function (command) {
    if (command === "start-timer") {
        console.log('sdfasdfa;;;;;;;;;');
        // chrome.browserAction.openPopup()

        chrome.action.openPopup()
        // chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });

        // let minutes = prompt("Enter the number of minutes for the timer:");
        // if (minutes) {
        //     // let ms = parseInt(minutes, 10) * 60 * 1000; // 转换为毫秒
        //     // setTimer(ms);
        // }
    }
});

function getTabTitle(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.get(tabId, tab => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(tab.title);
            }
        });
    });
}

function createNotification(tabId, title) {
    chrome.notifications.create(
        'notificationId', // Notification ID
        {
            type: 'basic',
            iconUrl: 'urgent.png',
            title: '快看一眼',
            message: `${title}`
        },
        (notificationId) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else {
                console.log('Notification shown with ID:', notificationId);
            }
        }
    );

    // 监听通知点击事件
    chrome.notifications.onClicked.addListener(function (notificationId) {
        if (notificationId === 'notificationId') {
            // 激活指定的标签页
            chrome.tabs.update(tabId, { active: true }, function (tab) {
                chrome.windows.update(tab.windowId, { focused: true });
            });
        }
    });
}


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

            // Switch to the tab
            getTabTitle(tabId)
                .then(title => {
                    createNotification(tabId, title)
                })
                .catch(error => {
                    console.error('Error fetching tab title:', error.message);
                });
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
