import { credential } from "firebase-admin";
import { initializeApp, ServiceAccount } from "firebase-admin/app";

export function initializeFirebase() {
  const cert: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  };
  return initializeApp({
    credential: credential.cert(cert),
  });
}
