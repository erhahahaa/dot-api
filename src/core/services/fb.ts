import Elysia from "elysia";
import admin, { ServiceAccount } from "firebase-admin";
import { App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { env } from "../../utils/env";
 
export const DEFAULT_IMAGE = "https://i.imgur.com/KDza0Bz.png";

export function initFB(): App {
  const KEY: ServiceAccount = {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASAE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY,
  };
  return admin.initializeApp({
    credential: admin.credential.cert(KEY),
  });
}

const app = initFB();
export const MessagingService = new Elysia().derive({ as: "global" }, () => {
  const messenger = getMessaging(app);

  return {
    messenger,
  };
});
