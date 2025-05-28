// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIhkg9kqxMqep1gixoI7mkCo6b3j9DnoI",
  authDomain: "connectcorretores-70cec.firebaseapp.com",
  projectId: "connectcorretores-70cec",
  storageBucket: "connectcorretores-70cec.firebasestorage.app",
  messagingSenderId: "272445820844",
  appId: "1:272445820844:web:5b7fcd6495d9016767f409",
  measurementId: "G-M8HKBE7EC7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
