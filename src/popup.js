chrome.runtime.sendMessage({ type: "get_last_log" }, (response) => {
  if (chrome.runtime.lastError) {
    console.error("Error fetching last log:", chrome.runtime.lastError.message);
  } else if (response && response.data) {
    document.getElementById("log-display").textContent = JSON.stringify(
      response.data,
      null,
      2
    );
  } else {
    document.getElementById("log-display").textContent = "No logs available.";
  }
});

chrome.storage.sync.get("user", (result) => {
  if (chrome.runtime.lastError) {
    console.error(
      "Error fetching user from storage:",
      chrome.runtime.lastError.message
    );
  } else if (result.user) {
    console.log("User found in storage:", result.user);
    setUser(result.user);
  } else {
    console.log("No user found in storage.");
  }
});

function setUser(user) {
  const profileImg = document.getElementById("profile-img");
  profileImg.src = user.photoURL;
  profileImg.alt = user.email;

  document.querySelector(".login-container").style.display = "none";
  document.querySelector(".app-container").style.display = "block";

  chrome.storage.sync.set({ user: user }, () => {
    console.log("User information stored in Chrome storage:", user);
  });
}

function handleLogin() {
  chrome.runtime.sendMessage({ type: "get_auth_token" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Error fetching auth token:",
        chrome.runtime.lastError.message
      );
    } else if (response && response.token) {
      const authToken = response.token;
      console.log("Token fetched from background:", authToken);

      const iframe = document.getElementById("firebase-iframe");
      iframe.contentWindow.postMessage(
        { type: "login", token: authToken },
        "*"
      );
    } else {
      console.error("Failed to fetch token:", response.error);
    }
  });
}

document.getElementById("login").onclick = () => {
  handleLogin();
};

window.addEventListener("message", (event) => {
  if (event.data.type === "loginSuccess") {
    console.log(
      "Login successful, user object sent to popup:",
      event.data.user
    );
    setUser(event.data.user);
  } else if (event.data.type === "loginError") {
    console.error("Login error:", event.data.error);
  }
});
