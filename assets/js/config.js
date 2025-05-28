// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5wrGUcFfbBYLUsxr8QuwoBZTYGKK6ECA",
  authDomain: "connectcorretores.firebaseapp.com",
  projectId: "connectcorretores",
  storageBucket: "connectcorretores.firebasestorage.app",
  messagingSenderId: "800005041027",
  appId: "1:800005041027:web:2d109e6bf8f7bc3f8a64b6",
  measurementId: "G-9C5RPWJJED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
