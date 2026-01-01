import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAInXvC_UK6YO9exRFQXAhtGqiP6064xlo",
  authDomain: "yukkclick-oauth.firebaseapp.com",
  projectId: "yukkclick-oauth",
  storageBucket: "yukkclick-oauth.firebasestorage.app",
  messagingSenderId: "359344541992",
  appId: "1:359344541992:web:e67e53954bf65cd281c01d",
  measurementId: "G-CJ5ZYD10MZ",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
