import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDeD2ugbbnPPBe9HJdo6dpc86G-LUlmleM",
  authDomain: "wedding-planner-57cdd.firebaseapp.com",
  databaseURL: "https://wedding-planner-57cdd-default-rtdb.firebaseio.com",
  projectId: "wedding-planner-57cdd",
  storageBucket: "wedding-planner-57cdd.firebasestorage.app",
  messagingSenderId: "490001338287",
  appId: "1:490001338287:web:ea6e4ba830912d295d295a",
  measurementId: "G-X5SWWMZ2NL",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
