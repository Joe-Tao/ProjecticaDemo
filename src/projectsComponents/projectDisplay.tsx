"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { 
  FiBold, 
  FiItalic, 
  FiList as FiListIcon, 
  FiLink, 
  FiCheckSquare,
  FiFileText,
  FiSave,
} from "react-icons/fi";
import { BsLightningCharge } from "react-icons/bs";
import toast from "react-hot-toast";

interface ProjectPlanProps {
  projectId: string;
  readOnly?: boolean;
  ownerEmail?: string;
}

const proseStyles = `
  prose-headings:text-gray-900 dark:prose-headings:text-white
  prose-p:text-gray-600 dark:prose-p:text-gray-300
  prose-strong:text-gray-900 dark:prose-strong:text-white
  prose-ul:text-gray-600 dark:prose-ul:text-gray-300
  prose-ol:text-gray-600 dark:prose-ol:text-gray-300
  prose-li:text-gray-600 dark:prose-li:text-gray-300
  prose-a:text-blue-600 dark:prose-a:text-blue-400
  prose-a:hover:text-blue-700 dark:prose-a:hover:text-blue-300
`;

export default function ProjectDisplay({ projectId, readOnly = false}: ProjectPlanProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [plan, setPlan] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const userEmail = session?.user?.email;
        if (!userEmail) return;

        const planRef = doc(db, "users", userEmail, "projects", projectId, "projectPlan", "plan");
        const planDoc = await getDoc(planRef);
        if (planDoc.exists()) {
          setPlan(planDoc.data().content || "");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
      }
    };

    fetchPlan();
  }, [projectId, session?.user?.email]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    if (!session?.user?.email) return;
    setIsSaving(true);
    try {
      const content = editorRef.current?.innerHTML || '';
      await setDoc(
        doc(db, "users", session.user.email, "projects", projectId, "projectPlan", "plan"),
        {
          content: content,
          lastUpdated: new Date().toISOString(),
        }
      );
      toast.success("Project plan saved successfully!");
      setPlan(content)
    } catch (error) {
      console.error("Error saving project plan:", error);
      toast.error("Failed to save project plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = () => {
    handleSave();
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        editorRef.current &&
        !editorRef.current.contains(event.target as Node) &&
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        handleBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const handleClick = () => {
    if (readOnly) return;
    if (!isEditing) setIsEditing(true);
  };

  if (!plan && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg dark:border dark:border-gray-800">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <BsLightningCharge className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Start Planning Your Project
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Click here to start documenting your project plan. Use formatting tools to organize your thoughts and tasks.
            </p>
            <button
              onClick={handleClick}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiFileText className="w-5 h-5" />
              Create Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg dark:border dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-blue-500" />
            Project Plan
          </h2>
          {!readOnly && (
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-2 text-sm ${
                isSaving 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400'
              }`}
              disabled={isSaving}
            >
              <FiSave className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
        
        <div className="min-h-[300px] max-h-[600px] overflow-y-auto">
          <div
            ref={editorRef}
            contentEditable={!readOnly && isEditing}
            className={`prose ${proseStyles} max-w-none min-h-[200px] p-4 rounded-lg text-gray-900 dark:text-gray-100 ${
              isEditing && !readOnly
                ? 'bg-gray-50 dark:bg-gray-800 outline-none border border-gray-200 dark:border-gray-700' 
                : readOnly
                  ? 'cursor-default bg-gray-50 dark:bg-gray-800/50'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
            }`}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ 
              __html: plan || (
                readOnly 
                  ? '<span class="text-gray-500 dark:text-gray-400">No project plan</span>' 
                  : '<span class="text-gray-500 dark:text-gray-400">Click to add project plan...</span>'
              )
            }}
          />
        </div>

        {isEditing && !readOnly && (
          <div
            ref={toolbarRef}
            className="flex items-center gap-2 mt-4 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={() => handleFormat('bold')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Bold"
            >
              <FiBold />
            </button>
            <button
              onClick={() => handleFormat('italic')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Italic"
            >
              <FiItalic />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={() => handleFormat('insertUnorderedList')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Bullet List"
            >
              <FiListIcon />
            </button>
            <button
              onClick={() => handleFormat('insertHTML', '☐ ')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Add Checkbox"
            >
              <FiCheckSquare />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) handleFormat('createLink', url);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Insert Link"
            >
              <FiLink />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}