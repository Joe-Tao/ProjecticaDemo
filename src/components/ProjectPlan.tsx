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
} from "react-icons/fi";
import toast from "react-hot-toast";

interface ProjectPlanProps {
  projectId: string;
  readOnly?: boolean;
  ownerEmail?: string;
}

export default function ProjectPlan({ projectId, readOnly = false, ownerEmail }: ProjectPlanProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [plan, setPlan] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const userEmail = ownerEmail || session?.user?.email;
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
  }, [projectId, session?.user?.email, ownerEmail]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    if (!session?.user?.email) return;
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
    } catch (error) {
      console.error("Error saving project plan:", error);
      toast.error("Failed to save project plan");
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

  return (
    <div className="flex flex-col w-1/2">
      <h2 className="text-xl font-semibold text-white mb-2">Project Plan</h2>
      <div className="h-[calc(100vh-16rem)] overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable={!readOnly && isEditing}
          className={`prose prose-invert max-w-none min-h-[100px] p-4 rounded-lg whitespace-pre-wrap ${
            isEditing && !readOnly
              ? 'bg-gray-700 outline-none' 
              : readOnly
                ? 'cursor-default'
                : 'hover:bg-gray-700/50 cursor-pointer'
          }`}
          style={{ whiteSpace: 'pre-wrap' }}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ 
            __html: plan || (readOnly ? 'No project plan' : 'Click to add project plan...')
          }}
        />

        {isEditing && !readOnly && (
          <div
            ref={toolbarRef}
            className="flex items-center gap-2 mt-2 bg-gray-700 p-2 rounded-lg sticky bottom-0"
          >
            <button
              onClick={() => handleFormat('bold')}
              className="p-2 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
              title="Bold"
            >
              <FiBold />
            </button>
            <button
              onClick={() => handleFormat('italic')}
              className="p-2 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
              title="Italic"
            >
              <FiItalic />
            </button>
            <button
              onClick={() => handleFormat('insertUnorderedList')}
              className="p-2 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
              title="Bullet List"
            >
              <FiListIcon />
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) handleFormat('createLink', url);
              }}
              className="p-2 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
              title="Insert Link"
            >
              <FiLink />
            </button>
            <button
              onClick={() => handleFormat('insertHTML', '☐ ')}
              className="p-2 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
              title="Add Checkbox"
            >
              <FiCheckSquare />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}