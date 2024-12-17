"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import ProjectPlan from "@/components/ProjectPlan";
import TaskList from "@/components/TaskList";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SharedProject {
  name: string;
  userId: string;
  createdAt: Timestamp;
}

export default function SharedProjectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const accessKey = searchParams.get('access_key');
  
  const [projectData, setProjectData] = useState<SharedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectOwnerEmail, setProjectOwnerEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyAccessAndFetchProject = async () => {
      if (!accessKey) {
        toast.error("Access key is required");
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        
        // 验证访问密钥
        const response = await fetch(`/api/share?projectId=${projectId}&access_key=${accessKey}`);
        const data = await response.json();

        if (!data.success) {
          toast.error(data.error || "Invalid access");
          router.push('/');
          return;
        }

        // 获取项目数据
        const projectRef = doc(db, "users", data.shareData.ownerId, "projects", projectId);
        const projectDoc = await getDoc(projectRef);

        if (projectDoc.exists()) {
          setProjectOwnerEmail(data.shareData.ownerId);
          setProjectData(projectDoc.data() as SharedProject);
        } else {
          toast.error("Project not found");
          router.push('/');
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    verifyAccessAndFetchProject();
  }, [projectId, accessKey, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212121] pt-16 flex items-center justify-center">
        <div className="text-white">Loading shared project...</div>
      </div>
    );
  }

  if (!projectData || !projectOwnerEmail) {
    return (
      <div className="min-h-screen bg-[#212121] pt-16 flex items-center justify-center">
        <div className="text-white">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] pt-16">
      {/* 项目头部 */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">
              {projectData.name || "Shared Project"}
            </h1>
            <span className="text-sm text-gray-400">
              Shared View (Read Only)
            </span>
          </div>
        </div>
      </div>

      {/* 项目内容 */}
      <main className="px-4 py-6">
        <div className="p-6">
          <div className="bg-gray-800 rounded-lg p-6 flex flex-row gap-6">
            <ProjectPlan 
              projectId={projectId} 
              readOnly={true}
              ownerEmail={projectOwnerEmail}
            />
            <TaskList 
              projectId={projectId} 
              readOnly={true}
              ownerEmail={projectOwnerEmail}
            />
          </div>
        </div>
      </main>

      {/* 底部信息 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Project Owner: {projectOwnerEmail}
          </div>
          <div className="text-sm text-gray-400">
            Created: {projectData.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
} 