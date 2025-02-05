import * as admin from "firebase-admin";
import { getFunctions } from "firebase-admin/functions";

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const db = admin.firestore(app);
export const functions = getFunctions(app);
