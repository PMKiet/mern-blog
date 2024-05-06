// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyCtwQfpULb4QSN_miKruMyeor7VM2mJwAA',
    authDomain: "mern-blog-3d61a.firebaseapp.com",
    projectId: "mern-blog-3d61a",
    storageBucket: "mern-blog-3d61a.appspot.com",
    messagingSenderId: "298139552379",
    appId: "1:298139552379:web:e8d8fcf46a66d5c33c30de"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig)