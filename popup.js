function Start() {
    const timeInput = document.getElementById('timeInput').value;
    const minutes = parseInt(timeInput);

    if (!isNaN(minutes) && minutes > 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.runtime.sendMessage({ action: 'startTimer', tabId: tabs[0].id, minutes: minutes });
        });
    } else {
        alert('Please enter a valid number of minutes.');
    }
}

document.getElementById('startTimer').addEventListener('click', () => {
    Start()
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        Start()
    }
});