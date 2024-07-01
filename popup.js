chrome.runtime.sendMessage({ type: 'get_last_log' }, (response) => {
  if (response && response.data) {
    document.getElementById('log-display').textContent = JSON.stringify(response.data, null, 2);
  } else {
    document.getElementById('log-display').textContent = "No logs available.";
  }
});

  chrome.storage.sync.get('user', (result) => {
    if (result.user) {
      console.log('User found in storage:', result.user);
      setUser(result.user);
    } else {
      console.log('No user found in storage.');
    }
  });

function setUser(user) {
  const profileImg = document.getElementById('profile-img');
  profileImg.src = user.photoURL;
  profileImg.alt = user.email;

  document.querySelector(".login-container").style.display = 'none';
  document.querySelector(".app-container").style.display = 'block';

  chrome.storage.sync.set({ user: user }, () => {
    console.log('User information stored in Chrome storage:', user);
  });
}

document.getElementById('login').onclick = () => {
  chrome.identity.getAuthToken({ interactive: true }, token => {
    if (chrome.runtime.lastError || !token) {
      console.error("Failed to obtain token:", chrome.runtime.lastError);
      return;
    }

    const iframe = document.getElementById('firebase-iframe');
    console.log("Sending token to iframe");
    iframe.contentWindow.postMessage({ type: "login", token: token }, "*");
  });
};

window.addEventListener("message", (event) => {
  if(event.data.type === 'loginSuccess') {
    console.log("Login successful, user object sent to popup:", event.data.user);
    setUser(event.data.user)
  } else if(event.data.type === 'loginError'){
    console.error("Login error:", event.data.error);
  }
});