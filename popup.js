window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("minutes").focus();
});

function Start() {
    const timeInputMins = document.getElementById('minutes').value;
    const timeInputSecs = document.getElementById('seconds').value;
    const minutes = parseInt(timeInputMins);
    const seconds = parseInt(timeInputSecs);

    console.log('sdfadfasdfads')
    console.log('asss')

    const totalsecs = minutes * 60 + seconds;

    if (totalsecs > 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.runtime.sendMessage({ action: 'startTimer', tabId: tabs[0].id, minutes: minutes, seconds: seconds });
        });
    } else {
        alert('Please enter a valid number of minutes.');
    }
}

document.getElementById('startButton').addEventListener('click', () => {
    Start()
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        Start()
    }
});