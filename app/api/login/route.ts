import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import "dotenv/config";

export async function isUserAllow(token: string) {
  if (!admin.apps.length) {
    throw new Error("Firebase Admin not initialized. Please contact admin.");
  }

  const decodedToken = await admin.auth().verifyIdToken(token);
  const email = decodedToken.email || "";

  if (!["akbaraditia15@gmail.com", "fiandev1234@gmail.com"].includes(email)) {
    throw new Error("This email is not authorized to log in.");
  }

  return decodedToken;
}

// Firebase Admin setup
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (
  serviceAccount.privateKey &&
  serviceAccount.projectId &&
  serviceAccount.clientEmail
) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const { token = "" } = body;

  if (!token) {
    return NextResponse.json(
      { message: "ID token is required." },
      { status: 400 }
    );
  }

  try {
    const user = await isUserAllow(token);

    return NextResponse.json(
      {
        message: "Login successful.",
        token: token,
        user: { email: user.email || "", uid: user.uid || "" },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Invalid or expired token.", error: error.message },
      { status: 401 }
    );
  }
}
