"use client";
import React, { useState } from 'react';
import Chat from '@/components/Chat';
import { FiMessageSquare, FiClipboard, FiPlus } from 'react-icons/fi';
import { useSession } from "next-auth/react";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import Link from 'next/link';
import { AiOutlineProject } from 'react-icons/ai';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

type Tab = 'projects' | 'chat' | 'plan';

const WorkspacePage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [projectPlan, setProjectPlan] = useState<string>('');
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;
  const router = useRouter();

  const [projects, loading, error] = useCollection(
    userEmail ?
      query(
        collection(db, "users", userEmail, "projects"),
        orderBy("createdAt", "desc")
      ) : null
  );

  useEffect(() => {
    // 检查登录状态
    if (status === 'unauthenticated') {
      toast.error("Please sign in to access workspace");
      router.push('/signin');
    }
  }, [status, router]);

  // 如果正在加载，显示加载状态
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // 如果未登录，不显示任何内容
  if (!session) {
    return (<div>Please sign in to access workspace</div>);
  }

  const createNewProject = async() => {
    //creating a new project id in firestore
    const doc = await addDoc(
      collection(db, "users", userEmail as string, "projects"),
      {
        userId: userEmail,
        createdAt: serverTimestamp(),
      }
  )
    router.push(`/project/${doc?.id}`);
}

  return (
    <div className="min-h-screen bg-[#212121] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 工作区标题 */}
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-white">{session?.user?.name}'s Workspace</h1>
        </div>

        {/* 标签切换 */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'projects'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <AiOutlineProject />
            <span>Projects ({projects?.docs.length})</span>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="bg-gray-800 rounded-lg p-4">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading projects...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 新建项目卡片 */}
              <Link
                href="#"
                onClick={createNewProject}
                className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700 transition-colors flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-600 hover:border-blue-500 group"
              >
                <FiPlus className="text-4xl text-gray-400 group-hover:text-blue-500 mb-2" />
                <span className="text-gray-400 group-hover:text-blue-500">Create New Project</span>
              </Link>

              {/* 现有项目列表 */}
              {projects?.docs.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <AiOutlineProject className="text-2xl text-blue-500" />
                    <h3 className="text-lg font-semibold text-white">
                      {project.data().name || "New Project"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-400">
                    Created: {project.data().createdAt?.toDate().toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage; 