// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBj7U7Sbn12gGzDM80ILhiwDvovs1_La2Y",
  authDomain: "meetingup-v-3.firebaseapp.com",
  projectId: "meetingup-v-3",
  storageBucket: "meetingup-v-3.firebasestorage.app",
  messagingSenderId: "583861490759",
  appId: "1:583861490759:web:1171e5191922390ac38d62",
  measurementId: "G-F17FXC3EW2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);