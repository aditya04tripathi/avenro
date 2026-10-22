import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCqMv9844C14L-RM8bOczhUJ4jUSdSpBJI",
  authDomain: "avenro-process-management.firebaseapp.com",
  projectId: "avenro-process-management",
  storageBucket: "avenro-process-management.firebasestorage.app",
  messagingSenderId: "97045118834",
  appId: "1:97045118834:web:d48b7d5361b0e1016ba7eb",
  measurementId: "G-95MBL1WQZR",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)
