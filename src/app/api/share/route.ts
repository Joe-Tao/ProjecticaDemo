import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { projectId, userId } = await req.json();

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 检查项目是否存在
    const projectRef = doc(db, "users", userId, "projects", projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // 生成访问密钥
    const accessKey = crypto.randomBytes(32).toString('hex');

    // 保存分享记录
    const shareRef = doc(db, "shared_access", accessKey);
    await setDoc(shareRef, {
      projectId,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      accessKey,
      isActive: true
    });

    // 生成分享链接
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/shared/${projectId}?access_key=${accessKey}`;

    return NextResponse.json({
      success: true,
      shareLink,
      accessKey,
      message: "Project shared successfully"
    });

  } catch (error: any) {
    console.error("Error sharing project:", error);
    return NextResponse.json(
      { error: "Failed to share project" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const accessKey = searchParams.get("access_key");

    if (!projectId || !accessKey) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 验证访问密钥
    const shareRef = doc(db, "shared_access", accessKey);
    const shareDoc = await getDoc(shareRef);

    if (!shareDoc.exists() || !shareDoc.data().isActive) {
      return NextResponse.json(
        { error: "Invalid or expired access key" },
        { status: 403 }
      );
    }

    const shareData = shareDoc.data();
    if (shareData.projectId !== projectId) {
      return NextResponse.json(
        { error: "Invalid access key for this project" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      shareData: shareData
    });

  } catch (error: any) {
    console.error("Error verifying access:", error);
    return NextResponse.json(
      { error: "Failed to verify access" },
      { status: 500 }
    );
  }
} 