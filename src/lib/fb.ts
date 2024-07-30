import { credential } from "firebase-admin";
import { initializeApp, ServiceAccount } from "firebase-admin/app";
import FIREBASE_KEY from "../../fb-key.json";

export function initializeFirebase() {
  return initializeApp({
    credential: credential.cert(FIREBASE_KEY as ServiceAccount),
  });
}
