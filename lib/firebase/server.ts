import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import "server-only"

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n")
}

export function createFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp()
  }

  const projectId = process.env.FB_PROJECT_ID
  const clientEmail = process.env.FB_CLIENT_EMAIL
  const privateKey = process.env.FB_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local"
    )
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: formatPrivateKey(privateKey),
    }),
  })
}

const adminApp = createFirebaseAdminApp()
const db = getFirestore(adminApp)
const auth = getAuth(adminApp)
const storage = getStorage(adminApp)

export const server = {
  db,
  auth,
  storage,
}
