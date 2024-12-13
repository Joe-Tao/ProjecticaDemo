// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: "AIzaSyB1SNvFUPMNh1J0hpshZQX7iCV4qCWG_1c",
  // authDomain: "projectica-cca0b.firebaseapp.com",
  // projectId: "projectica-cca0b",
  // storageBucket: "projectica-cca0b.firebasestorage.app",
  // messagingSenderId: "956691141814",
  // appId: "1:956691141814:web:a40ce2cb8b34ccebab0217",
  // measurementId: "G-C4T9W4RHXQ"
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const db = getFirestore(app);

export {db}