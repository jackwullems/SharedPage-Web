import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

var config = {
    apiKey: "AIzaSyAMBdndNiTCzxRFULhzD4eCqf7Wd6lp318",
    authDomain: "sharedpage-a5b94.firebaseapp.com",
    databaseURL: "https://sharedpage-a5b94.firebaseio.com",
    projectId: "sharedpage-a5b94",
    storageBucket: "sharedpage-a5b94.appspot.com",
    messagingSenderId: "178045639933",
	appId: "1:178045639933:web:35dcbcee0a7b8a9c"
};

if (!firebase.apps.length) {
	firebase.initializeApp(config);
}
const db = firebase.firestore()
const auth = firebase.auth()
const storage = firebase.storage()

export {
	db,
    auth,
    storage
};