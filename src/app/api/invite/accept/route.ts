import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { inviteId, accepterEmail } = await req.json();

    // 获取邀请信息
    const inviteDoc = await adminDB.collection("invites").doc(inviteId).get();
    if (!inviteDoc.exists) {
      return NextResponse.json({
        success: false,
        message: "Invitation not found",
      }, { status: 404 });
    }

    const inviteData = inviteDoc.data();
    if (!inviteData) {
      throw new Error("Invalid invite data");
    }

    if (inviteData.status !== "pending") {
      return NextResponse.json({
        success: false,
        message: "Invitation is no longer valid",
      }, { status: 400 });
    }

    if (inviteData.inviteeEmail !== accepterEmail) {
      return NextResponse.json({
        success: false,
        message: "You are not the intended recipient of this invitation",
      }, { status: 403 });
    }

    // 开始事务
    await adminDB.runTransaction(async (transaction) => {
      // 1. 更新邀请状态
      transaction.update(inviteDoc.ref, {
        status: "accepted",
        acceptedAt: admin.firestore.Timestamp.now(),
      });

      // 2. 更新项目成员状态
      const projectRef = adminDB.collection("users")
        .doc(inviteData.inviterEmail)
        .collection("projects")
        .doc(inviteData.projectId);

      // 3. 为被邀请者创建项目副本
      const projectDoc = await transaction.get(projectRef);
      const projectData = projectDoc.data();

      if (projectData) {
        await adminDB.collection("users")
          .doc(accepterEmail)
          .collection("projects")
          .doc(inviteData.projectId)
          .set({
            ...projectData,
            role: "member",
            originalOwner: inviteData.inviterEmail,
            joinedAt: admin.firestore.Timestamp.now(),
          });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
    });

  } catch (error: any) {
    console.error("Accept Invite API Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to accept invitation",
    }, { status: 500 });
  }
} 