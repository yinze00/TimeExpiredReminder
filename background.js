chrome.commands.onCommand.addListener((command) => {
    if (command === "open-timer-popup") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.storage.local.set({ tabId: tabId }, () => {
          chrome.action.openPopup();
        });
      });
    }
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.storage.local.get("tabId", (data) => {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Time to return to your tab!",
        message: "Your timer has finished. Please return to your tab to continue working."
      });
    });
  });
  