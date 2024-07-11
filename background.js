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
                    // chrome.tabs.update(tabId, { active: true }, () => {
                    //     // Show notification
                    //     chrome.notifications.create('', {
                    //         type: 'basic',
                    //         iconUrl: 'urgent.png',
                    //         title: '快看一眼 ',
                    //         message: `${title}`
                    //     }, (notificationId) => {
                    //         if (chrome.runtime.lastError) {
                    //             console.error(chrome.runtime.lastError);
                    //         } else {
                    //             console.log('Notification shown with ID:', notificationId);
                    //         }
                    //     });
                    // });
                })
                .catch(error => {
                    console.error('Error fetching tab title:', error.message);
                });
            // chrome.tabs.update(tabId, { active: true }, () => {
            //     // Show notification
            //     chrome.notifications.create('', {
            //         type: 'basic',
            //         iconUrl: 'clock48.png',
            //         title: 'Tab Timer Finished',
            //         message: `The timer for tab ${tabId} has finished!`
            //     }, (notificationId) => {
            //         if (chrome.runtime.lastError) {
            //             console.error(chrome.runtime.lastError);
            //         } else {
            //             console.log('Notification shown with ID:', notificationId);
            //         }
            //     });
            // });
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
