// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 파이어 베이스의 "인증"서비스를 가져오는 코드.
// import { getAnalytics } from "firebase/analytics"; // 웹 환경에서 사용되는 부분이므로 주석처리.  
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbLu9cMyB6HfJn_KCoVQokU-C1NZYCycA",
  authDomain: "trueechoauth.firebaseapp.com",
  projectId: "trueechoauth",
  storageBucket: "trueechoauth.appspot.com",
  messagingSenderId: "934510130762",
  appId: "1:934510130762:web:69d5f847ce57eae8cb98b3",
  measurementId: "G-NJ3T4QW0JF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // 웹 환경에서 사용되는 부분이므로 주석처리.  
const auth = getAuth(app);


export default auth;