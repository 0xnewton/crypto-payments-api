import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getFunctions } from "firebase-admin/functions";
import { logger } from "firebase-functions";

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

export const getProjectID = () => {
  // Retrieve the project ID from the environment
  const projectID =
    process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectID) {
    logger.error("Project ID is not defined in the environment.");
    throw new Error("Project ID is not defined in the environment.");
  }

  return projectID;
};
