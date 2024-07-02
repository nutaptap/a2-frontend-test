let lastLog = null;

function handleMessage(message, sender, sendResponse) {
  if (message.type === "log_key") {
    handleLogKey(message.data, sendResponse);
    return true;
  }

  if (message.type === "get_last_log") {
    sendLastLog(sendResponse);
    return true;
  }

  if (message.type === "get_auth_token") {
    getAuthToken(sendResponse);
    return true;
  }

  console.warn("Unhandled message type:", message.type);
  return false;
}

function handleLogKey(data, sendResponse) {
  console.log("Received typing data:", data);
  lastLog = data;
  fetch("http://localhost:3000/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Data sent to server:", data);
      sendResponse({ status: "success" });
    })
    .catch((error) => {
      console.error("Error sending data to server:", error);
      sendResponse({ status: "error", message: error });
    });
}

function sendLastLog(sendResponse) {
  sendResponse({ data: lastLog });
}

function getAuthToken(sendResponse) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError || !token) {
      console.error("Failed to obtain token:", chrome.runtime.lastError);
      sendResponse({ error: chrome.runtime.lastError });
    } else {
      console.log("Token obtained:", token);
      sendResponse({ token: token });
    }
  });
}

function clearStorage() {
  chrome.storage.sync.clear(() => {
    console.log("Storage cleared on browser startup.");
  });
}

chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onInstalled.addListener(() => {
  clearStorage();
});

chrome.runtime.onStartup.addListener(() => {
  clearStorage();
});
