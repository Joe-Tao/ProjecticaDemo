"use client";

import React, { useState, useRef, useEffect } from "react";
import { IoMdMore } from "react-icons/io";
import { BiSolidTrashAlt } from "react-icons/bi";
import { FiEdit } from "react-icons/fi";
import { db } from "@/firebase";
import { doc, deleteDoc, updateDoc, collection, getDocs, query } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  projectId: string;
  isActive: boolean;
  onProjectDelete: () => Promise<void>;
  currentName?: string;
  onNameUpdate?: (newName: string) => void;
}

const ProjectOptions = ({ projectId, isActive, onProjectDelete, currentName, onNameUpdate }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const { data: session } = useSession();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setNewName(currentName || "");
  }, [currentName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const menuHeight = isEditing ? 120 : 80;
      
      // 计算菜单的最佳位置
      let top = buttonRect.bottom + window.scrollY;
      let left = buttonRect.right - 192; // 菜单宽度为 192px (w-48)

      // 如果菜单会超出底部，则显示在按钮上方
      if (buttonRect.bottom + menuHeight > windowHeight) {
        top = buttonRect.top + window.scrollY - menuHeight;
      }

      // 如果菜单会超出右边，则向左对齐
      if (buttonRect.right + 192 > window.innerWidth) {
        left = buttonRect.left - 192 + buttonRect.width;
      }

      setMenuPosition({ top, left });
    }
    
    setIsOpen(!isOpen);
  };

  const handleRename = async () => {
    if (!newName.trim() || !session?.user?.email) return;

    try {
      await updateDoc(
        doc(db, "users", session.user.email, "projects", projectId),
        {
          name: newName.trim(),
          lastUpdated: new Date().toISOString()
        }
      );
      onNameUpdate?.(newName.trim());
      setIsEditing(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error renaming project:", error);
    }
  };

  const handleDelete = async () => {
    if (!session?.user?.email) return;

    try {
      const notification = toast.loading("Deleting project...");
      
      // 1. 首先删除项目下的所有消息
      const messagesRef = collection(db, "users", session.user.email, "projects", projectId, "messages");
      const messagesSnapshot = await getDocs(query(messagesRef));
      
      const deletePromises = messagesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // 2. 然后删除项目文档
      await deleteDoc(
        doc(db, "users", session.user.email, "projects", projectId)
      );

      // 3. 调用父组件的删除回调
      await onProjectDelete();
      
      toast.success("Project deleted successfully", {
        id: notification,
      });

      // 4. 如果当前正在查看这个项目，则重定向到主页
      if (isActive) {
        router.push("/");
      }
      
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={handleMenuOpen}
        className="p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <IoMdMore className="text-white/50 hover:text-white duration-300 ease-in-out" />
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
          className="w-48 bg-gray-800 rounded-md shadow-lg z-50"
        >
          {isEditing ? (
            <div className="p-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New project name"
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md mb-2"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(currentName || "");
                  }}
                  className="px-2 py-1 text-sm text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                <FiEdit />
                Rename Project
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
              >
                <BiSolidTrashAlt />
                Delete Project
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectOptions;
