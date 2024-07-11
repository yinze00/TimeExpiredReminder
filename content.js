let countdownInterval;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startCountdown") {
    const totalMilliseconds = message.totalMilliseconds;
    const endTime = Date.now() + totalMilliseconds;

    countdownInterval = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        document.getElementById("reminderCountdown").textContent = "";
      } else {
        const minutes = Math.floor((remainingTime / 1000) / 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        document.getElementById("reminderCountdown").textContent = `Time remaining: ${minutes}m ${seconds}s`;
      }
    }, 1000);
  } else if (message.action === "clearCountdown") {
    clearInterval(countdownInterval);
    document.getElementById("reminderCountdown").textContent = "";
  }
});
