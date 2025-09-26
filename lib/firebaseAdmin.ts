import admin from "firebase-admin";
import fs from "fs";
import path from "path";

if (!admin.apps.length) {
  // Resolve the path to your service account inside Docker
  const serviceAccountPath = path.join(process.cwd(), "secrets/firebase-key.json");

  // Read and parse JSON manually
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://paal-farm-ng-default-rtdb.firebaseio.com",
  });
}

export const db = admin.database();
