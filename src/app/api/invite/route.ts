import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/firebaseAdmin";
import admin from "firebase-admin";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
// });

export async function POST(req: NextRequest) {
  try {
    const { projectId, inviteeEmail, inviterEmail} = await req.json();

    if (!projectId || !inviteeEmail || !inviterEmail) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields",
      }, { status: 400 });
    }

    // 直接更新项目成员列表
    await adminDB.collection("users")
      .doc(inviterEmail)
      .collection("projects")
      .doc(projectId)
      .update({
        members: admin.firestore.FieldValue.arrayUnion({
          email: inviteeEmail,
          role: "member",
          joinedAt: admin.firestore.Timestamp.now(),
        }),
        updatedAt: admin.firestore.Timestamp.now(),
      });

    // 为被邀请者创建项目副本
    const projectRef = adminDB.collection("users")
      .doc(inviterEmail)
      .collection("projects")
      .doc(projectId);

    const projectDoc = await projectRef.get();
    const projectData = projectDoc.data();

    if (projectData) {
      await adminDB.collection("users")
        .doc(inviteeEmail)
        .collection("projects")
        .doc(projectId)
        .set({
          ...projectData,
          role: "member",
          originalOwner: inviterEmail,
          joinedAt: admin.firestore.Timestamp.now(),
        });
    }

    // 发送邀请邮件
    // const emailHtml = render(
    //   ProjectInviteEmail({
    //     inviterName: inviterEmail,
    //     projectName: projectName,
    //     projectId: projectId,
    //   })
    // );

    // await transporter.sendMail({
    //   from: `"Projectica" <${process.env.GMAIL_USER}>`,
    //   to: inviteeEmail,
    //   subject: `You've been added to ${projectName} on Projectica`,
    //   html: await emailHtml,
    // });

    return NextResponse.json({
      success: true,
      message: "Member added and invitation sent successfully",
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error("Invite API Error:", error);
        return NextResponse.json({
          success: false,
          message: error.message || "Failed to send invitation",
        }, { status: 500 });
    } else {
        console.error("Invite API Error: Unknown error");
        return NextResponse.json({
          success: false,
          message: "Failed to send invitation",
        }, { status: 500 });
    }
}

} 