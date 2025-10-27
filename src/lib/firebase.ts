import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCcM567OP8HEdR6v92xuq5t114aMnIZ7BA",
  authDomain: "pop-and-fun.firebaseapp.com",
  databaseURL: "https://pop-and-fun-default-rtdb.firebaseio.com",
  projectId: "pop-and-fun",
  storageBucket: "pop-and-fun.firebasestorage.app",
  messagingSenderId: "845863097371",
  appId: "1:845863097371:web:c407ac055a80fc2dee94be"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
