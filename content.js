const initialTypingData = {
  user_id: "a1b2c3d4e5f6g7h8i9j0",
  appContext: document.location.href,
  setting: 1,
  sourceId: "demo",
  studyId: "",
  text: [],
  timeZone: new Date().getTimezoneOffset() / -60,
  startUnixTime: Date.now(),
  pressTimes: [],
  releaseTimes: [],
  keyAreas: [],
  keyTypes: [],
  positionX: [],
  positionY: [],
  pressure: [],
  swipe: [],
  autocorrectLengths: [0],
  autocorrectTimes: [],
  autocorrectWords: [],
  predictionLength: null,
  predictionLengths: [],
  predictionTimes: [],
  predictionWords: [],
  textStructure: []
};

let typingData = { ...initialTypingData };
let typingSessionActive = false;
let lastElement = null;

function resetTypingData() {
  typingData = { ...initialTypingData };
  typingSessionActive = false;
  lastElement = null;
  console.log("Typing data reset");
}

function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

function trimArraysToMatchLength() {
  const pressLength = typingData.pressTimes.length;
  const releaseLength = typingData.releaseTimes.length;

  if (pressLength > releaseLength) {
    console.log('The array was trimmed, keydown was longer')
    typingData.pressTimes.length = releaseLength;
  } else if (releaseLength > pressLength) {
    console.log('The array was trimmed, keyup was longer')
    typingData.releaseTimes.length = pressLength;
  }
}

const sendTypingData = debounce(() => {
  if (!typingSessionActive) return;

  // Trim arrays to ensure matching lengths
  trimArraysToMatchLength();

  let attempts = 0;
  const maxAttempts = 3;

  function trySendMessage() {
    try {
      console.log('Attempting to send typing data:', JSON.stringify(typingData, null, 2));
      chrome.runtime.sendMessage({ type: 'log_key', data: typingData }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message, chrome.runtime.lastError);
          if (attempts < maxAttempts) {
            attempts++;
            console.log(`Retrying to send typing data (attempt ${attempts})`);
            trySendMessage();
          }
          return;
        }
        console.log('Typing data sent successfully');
        resetTypingData();
      });
    } catch (error) {
      console.error('Error during sendTypingData:', error);
    }
  }

  trySendMessage();
}, 5000);

function handleSession() {
  if (!typingSessionActive) {
    typingSessionActive = true;
    typingData.startUnixTime = Date.now();
  }
}

let keyPressStartTimes = {};

function handleKeydown(e){
  handleSession()
  
  if (!keyPressStartTimes[e.key]) {
    keyPressStartTimes[e.key] = Date.now();
    typingData.pressTimes.push(Date.now());
    typingData.keyTypes.push(e.key);
    typingData.text.push(e.key);
  }
}

function handleKeyup(e){
  if (keyPressStartTimes[e.key]) {
    typingData.releaseTimes.push(Date.now());
    delete keyPressStartTimes[e.key];
  }

    // Explicitly capture Enter key release
    if (e.key === 'Enter') {
      sendTypingData();
    }
  
}

function handleFocusout(e) {
  if (e.target.classList.contains('message_input')) {
    console.log('Focus out detected on message input');
    sendTypingData();
  }
  if (!e.relatedTarget || !e.relatedTarget.closest('.message_input')) {
    console.log('Focus out detected');
    sendTypingData();
  }
}

function handleClick(e) {
  handleSession()
  const time = Date.now()
  //Capture the mouse position relative to the page, not the viewport.
  const positionX = { time: time, position: e.pageX }
  const positionY = { time: time, position: e.pageY }
  typingData.positionX.push(positionX)
  typingData.positionY.push(positionY)
}

document.addEventListener('click', (e) => { handleClick(e) })

document.addEventListener('keydown', (e) => { handleKeydown(e) })

document.addEventListener('keyup', (e) =>{ handleKeyup(e) })

document.addEventListener('focusout', (e) => { handleFocusout(e) });

window.addEventListener('sendMessage', () => {
  console.log('sendMessage event detected');
  sendTypingData();
});