import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { adminDB } from "@/firebaseAdmin";
import query from "@/lib/queryApi";

export const POST = async (req: NextRequest) => {
  try {
    const { prompt, id: projectId, model, session: userEmail } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a prompt!",
        },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a project ID!",
        },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a user email!",
        },
        { status: 400 }
      );
    }

    const response = await query(prompt, projectId, model, userEmail);
    
    const message = {
      text: response || "Projectica was unable to find an answer for that!",
      createdAt: admin.firestore.Timestamp.now(),
      user: {
        _id: "Projectica",
        name: "Projectica",
        avatar: "https://res.cloudinary.com/duehd78sl/image/upload/v1729227742/logoLight_amxdpz.png",
      },
    };

    await adminDB
      .collection("users")
      .doc(userEmail)
      .collection("projects")
      .doc(projectId)
      .collection("messages")
      .add(message);

    return NextResponse.json({
      answer: message.text,
      success: true,
      message: "Projectica has responded",
    });
    
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal server error",
    }, { status: 500 });
  }
};
