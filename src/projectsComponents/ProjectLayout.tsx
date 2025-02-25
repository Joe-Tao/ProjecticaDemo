"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiList, FiFileText } from 'react-icons/fi';
import ProjectChat from './projectChat';
import TaskList from './projectTask';
import ProjectPlanning from './ProjectPlanning';
interface ProjectLayoutProps {
  projectId: string;
  userId: string;
}

export default function ProjectLayout({ projectId, userId }: ProjectLayoutProps) {
  const [activeSection, setActiveSection] = useState<'none' | 'chat' | 'tasks'>('chat');

  const slideVariants = {
    enterFromLeft: {
      x: '-100%',
      opacity: 0
    },
    enterFromRight: {
      x: '100%',
      opacity: 0
    },
    center: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 25
      }
    },
    exitToLeft: {
      x: '-100%',
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 25
      }
    },
    exitToRight: {
      x: '100%',
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 25
      }
    }
  };

  const handleSectionClick = (section: 'chat' | 'tasks') => {
    setActiveSection(activeSection === section ? 'none' : section);
  };

  return (
    <div className="relative w-full min-h-[600px]">
      <div className="max-w-9xl mx-auto relative px-4">
        {/* Top Navigation */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => handleSectionClick('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeSection === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FiMessageSquare className="w-5 h-5" />
            <span>Chat</span>
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            <FiFileText className="w-5 h-5" />
            <span>Plan</span>
          </button>

          <button
            onClick={() => handleSectionClick('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeSection === 'tasks'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FiList className="w-5 h-5" />
            <span>Tasks</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="relative overflow-hidden flex transition-all duration-300">
          {/* Chat Section */}
          <AnimatePresence mode="wait">
            {activeSection === 'chat' && (
              <motion.div
                initial="enterFromLeft"
                animate="center"
                exit="exitToLeft"
                variants={slideVariants}
                className="w-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <FiMessageSquare />
                  Chat with AI
                </h2>
                <div className="text-gray-600 dark:text-gray-300">
                  <ProjectChat />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project Display - Always visible */}
          <div
            className={`${
              activeSection === 'none' ? 'w-full' : 'w-1/2'
            } bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-all duration-300`}
          >
            {/* <ProjectDisplay projectId={projectId} readOnly={false} /> */}
            <ProjectPlanning projectId={projectId} userId={userId} />
          </div>

          {/* Tasks Section */}
          <AnimatePresence mode="wait">
            {activeSection === 'tasks' && (
              <motion.div
                initial="enterFromRight"
                animate="center"
                exit="exitToRight"
                variants={slideVariants}
                className="w-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <FiList />
                  Tasks
                </h2>
                <div className="text-gray-600 dark:text-gray-300">
                  <TaskList />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
