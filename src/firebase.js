import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBc_dk0lDe-dbF1PHVNpFVfJysfn_7iBw4",
  authDomain: "a2-frontend-test.firebaseapp.com",
  projectId: "a2-frontend-test",
  storageBucket: "a2-frontend-test.appspot.com",
  messagingSenderId: "162209288591",
  appId: "1:162209288591:web:488aa019c3207b04c33bfa",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function handleLogin(token) {
  {
    signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then((res) => {
        const user = res.user;
        console.log("Signed in using Firebase. User:", user);
        const userObj = {
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
        };
        window.parent.postMessage({ type: "loginSuccess", user: userObj }, "*");
      })
      .catch((err) => {
        console.error("Sign in ended with an error:", err.message);
        window.parent.postMessage({ type: "loginError", error: err }, "*");
      });
  }
}

window.addEventListener("message", (event) => {
  if (event.data.type === "login") {
    handleLogin(event.data.token);
  }
});
