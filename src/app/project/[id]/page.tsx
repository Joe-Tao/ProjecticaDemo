"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { FiUsers, FiCalendar, FiCheckSquare, FiClock } from "react-icons/fi";

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  members: number;
  lastActivity: string;
}

interface Task {
  completed: boolean;
}

interface Section {
  tasks: Task[];
}


export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: session } = useSession();
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalTasks: 0,
    completedTasks: 0,
    members: 0,
    lastActivity: new Date().toISOString(),
  });

  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!session?.user?.email) return;

      try {
        // 获取项目数据
        const sectionsRef = doc(db, "users", session.user.email, "projects", projectId, "sections", "data");
        const sectionsDoc = await getDoc(sectionsRef);
        
        if (sectionsDoc.exists()) {
          const sections = sectionsDoc.data().sections || [];
          let totalTasks = 0;
          let completedTasks = 0;

          // sections.forEach((section: any) => {
          //   totalTasks += section.tasks.length;
          //   completedTasks += section.tasks.filter((task: any) => task.completed).length;
          // });
          sections.forEach((section: Section) => {
            totalTasks += section.tasks.length;
            completedTasks += section.tasks.filter((task: Task) => task.completed).length;
          });
          

          // 获取成员数据
          const membersRef = doc(db, "users", session.user.email, "projects", projectId, "members", "list");
          const membersDoc = await getDoc(membersRef);
          const members = membersDoc.exists() ? (membersDoc.data().members || []).length : 1;

          setProjectStats({
            totalTasks,
            completedTasks,
            members,
            lastActivity: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error fetching project stats:", error);
      }
    };

    fetchProjectStats();
  }, [projectId, session?.user?.email]);

  return (
    <div className="p-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Project Overview</h2>
        
        {/* 统计卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* 任务进度 */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Tasks Progress</span>
              <FiCheckSquare className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {projectStats.completedTasks}/{projectStats.totalTasks}
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 rounded-full h-2"
                style={{ 
                  width: `${projectStats.totalTasks ? 
                    (projectStats.completedTasks / projectStats.totalTasks * 100) : 0}%` 
                }}
              />
            </div>
          </div>

          {/* 团队成员 */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Team Members</span>
              <FiUsers className="text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {projectStats.members}
            </div>
            <div className="text-sm text-gray-400">Active members</div>
          </div>

          {/* 最近活动 */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Last Activity</span>
              <FiClock className="text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {new Date(projectStats.lastActivity).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-400">
              {new Date(projectStats.lastActivity).toLocaleTimeString()}
            </div>
          </div>

          {/* 预计完成时间 */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Due Date</span>
              <FiCalendar className="text-red-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {new Date().toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-400">Estimated completion</div>
          </div>
        </div>

        {/* 最近活动列表 */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {/* 这里可以添加最近活动的列表 */}
            <div className="text-gray-400 text-center py-4">
              No recent activities
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}