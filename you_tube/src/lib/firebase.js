// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAoclwHQnpMaBsHCn_y4drIYxQYdcgFFAM",
    authDomain: "fir-c24c2.firebaseapp.com",
    projectId: "fir-c24c2",
    storageBucket: "fir-c24c2.firebasestorage.app",
    messagingSenderId: "580751434695",
    appId: "1:580751434695:web:6b3f6c44841353ba086fe2",
    measurementId: "G-HZMKFW13ZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };