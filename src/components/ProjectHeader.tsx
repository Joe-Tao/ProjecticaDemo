"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FiShare2, FiPlus, FiHome, FiCalendar, FiMessageSquare, FiClock, FiFileText, FiList } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { useRouter, usePathname } from "next/navigation";
import ContactVA from "./ContactVA";

interface Props {
    projectId: string;
}

interface NavItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    path: string;
}

const ProjectHeader = ({ projectId }: Props) => {
    const { data: session } = useSession();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const [isEditing, setIsEditing] = useState(false);
    const [projectName, setProjectName] = useState("New Project");

    const navItems: NavItem[] = [
        {
            id: 'overview',
            name: 'Overview',
            icon: <FiHome className="w-4 h-4" />,
            path: `/project/${projectId}`
        },
        {
            id: 'chat',
            name: 'Chat',
            icon: <FiMessageSquare className="w-4 h-4" />,
            path: `/project/${projectId}/chat`
        },
        {
            id: 'list',
            name: 'Plan List',
            icon: <FiList className="w-4 h-4" />,
            path: `/project/${projectId}/list`
        },
        {
            id: 'timeline',
            name: 'Timeline',
            icon: <FiClock className="w-4 h-4" />,
            path: `/project/${projectId}/timeline`
        },
        {
            id: 'calendar',
            name: 'Calendar',
            icon: <FiCalendar className="w-4 h-4" />,
            path: `/project/${projectId}/calendar`
        },
        {
            id: 'messages',
            name: 'Messages',
            icon: <FiMessageSquare className="w-4 h-4" />,
            path: `/project/${projectId}/messages`
        },
        {
            id: 'docs',
            name: 'Documents',
            icon: <FiFileText className="w-4 h-4" />,
            path: `/project/${projectId}/docs`
        }
    ];

    // 获取项目信息
    const [projectDoc, loading] = useDocument(
        session?.user?.email 
            ? doc(db, "users", session.user.email, "projects", projectId)
            : null
    );

    // 当文档加载完成时更新项目名称
    React.useEffect(() => {
        if (projectDoc?.exists()) {
            setProjectName(projectDoc.data()?.name || "New Project");
        }
    }, [projectDoc]);

    // 模拟项目成员数据
    const members = [
        {
            id: 1,
            name: "Project Owner",
            image: session?.user?.image || "https://i.ibb.co/LPxtKn4/user.jpg",
        },
    ];

    const handleShare = () => {
        const projectLink = `${window.location.origin}/project/${projectId}`;
        navigator.clipboard.writeText(projectLink);
        toast.success("Project link copied to clipboard!");
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(inviteEmail)) {
                throw new Error("Please enter a valid email address");
            }

            const projectName = projectDoc?.data()?.name || "Project";
            
            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId,
                    inviteeEmail: inviteEmail,
                    inviterEmail: session?.user?.email,
                    projectName,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success(`Invitation sent to ${inviteEmail}`);
                setInviteEmail("");
                setShowInviteModal(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Failed to send invitation");
            } else {
                toast.error("An unknown error occurred while sending the invitation");
            }
        }
        
    };

    const handleNavigation = (path: string) => {
        router.push(path, { scroll: false });
    };

    const handleNameChange = async (newName: string) => {
        if (!session?.user?.email) return;

        try {
            await setDoc(
                doc(db, "users", session.user.email, "projects", projectId),
                {
                    name: newName,
                    updatedAt: new Date().toISOString(),
                },
                { merge: true }
            );
            setProjectName(newName);
            toast.success("Project name updated");
        } catch (error) {
            console.error("Error updating project name:", error);
            toast.error("Failed to update project name");
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="h-32 bg-[#1a1a1a] border-b border-gray-800">
                <div className="h-16 flex items-center px-6">
                    <div className="animate-pulse h-6 w-48 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-32 bg-gray-200 border-b ">
            <div className="h-16 flex items-center justify-between px-6">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onBlur={() => handleNameChange(projectName)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleNameChange(projectName);
                                } else if (e.key === 'Escape') {
                                    setIsEditing(false);
                                    setProjectName(projectDoc?.data()?.name || "New Project");
                                }
                            }}
                            className="bg-gray-200 text-black px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <button
                            onClick={() => handleNameChange(projectName)}
                            className="text-green-500 hover:text-green-400"
                            title="Save"
                        >
                            ✓
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setProjectName(projectDoc?.data()?.name || "New Project");
                            }}
                            className="text-red-500 hover:text-red-400"
                            title="Cancel"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <h1 
                        className="text-xl font-semibold text-black cursor-pointer hover:bg-gray-500/50 px-3 py-1 rounded"
                        onClick={() => setIsEditing(true)}
                    >
                        {projectName}
                    </h1>
                )}

                <div className="flex items-center gap-4">
                    
                    <ContactVA projectId={projectId} />

                    <div className="flex -space-x-2">
                        {members.map((member) => (
                            <div 
                                key={member.id} 
                                className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] overflow-hidden hover:z-10 transition-all"
                                title={member.name}
                            >
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="w-8 h-8 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center hover:border-blue-500 hover:bg-gray-700/50 transition-all"
                            title="Add member"
                        >
                            <FiPlus className="text-gray-400 hover:text-blue-500" />
                        </button>
                    </div>

                    <button
                        onClick={handleShare}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
                        title="Share project"
                    >
                        <FiShare2 size={20} />
                    </button>
                </div>
            </div>

            {/* 修改导航部分 */}
            <div className="h-16 px-6 flex items-center space-x-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-gray-700/50 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                            }`}
                        >
                            {item.icon}
                            <span className="text-sm font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* 邀请成员模态框 */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                            <IoMdClose size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-4">Invite Member</h2>
                        
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Send Invitation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectHeader;