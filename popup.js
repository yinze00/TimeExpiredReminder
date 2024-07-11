document.getElementById("startTimer").addEventListener("click", () => {
    const minutes = parseInt(document.getElementById("minutes").value);
    const milliseconds = minutes * 60 * 1000;

    chrome.storage.local.get("tabId", (data) => {
        chrome.alarms.create({ delayInMinutes: minutes });
        window.close();
    });
});