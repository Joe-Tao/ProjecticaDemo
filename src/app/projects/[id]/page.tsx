'use client';

import { useState, useEffect, use } from 'react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { RiEditLine } from "react-icons/ri";
import { AiOutlineSave, AiOutlineClose } from 'react-icons/ai';
import toast from 'react-hot-toast';
import ProjectLayout from '@/projectsComponents/ProjectLayout';

interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: Timestamp;
}

const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { data: session, status} = useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (status !== 'authenticated' || !session?.user?.email) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const projectRef = doc(db, "users", session.user.email, "projects", resolvedParams.id);
                const projectSnap = await getDoc(projectRef);

                if (projectSnap.exists()) {
                    const projectData = projectSnap.data();
                    const formattedProject: Project = {
                        id: projectSnap.id,
                        name: projectData.name || 'Untitled Project',
                        description: projectData.description || '',
                        createdAt: projectData.createdAt,
                    };

                    setProject(formattedProject);
                    setEditedName(formattedProject.name);
                } else {
                    setProject(null);
                    throw new Error('Project not found');
                }
            } catch (error) {
                console.error('Error fetching project:', error);
                toast.error('Failed to load project');
                setProject(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [resolvedParams.id, session?.user?.email]);

    const handleSave = async () => {
        if (!session?.user?.email) {
            toast.error('You must be logged in to update the project');
            return;
        }

        try {
            const projectRef = doc(db, "users", session.user.email, "projects", resolvedParams.id);
            await updateDoc(projectRef, {
                name: editedName,
                updatedAt: Timestamp.now(),
            });

            setProject(prev => prev ? { ...prev, name: editedName } : null);
            setIsEditing(false);
            toast.success('Project name updated successfully');
        } catch (error) {
            console.error('Error updating project name:', error);
            toast.error('Failed to update project name');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Please sign in
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        You need to be signed in to view this project.
                    </p>
                    <Link 
                        href="/signin" 
                        className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Project not found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        The project you are looking for does not exist or you do not have access to it.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="max-w-9xl mx-auto px-4 pt-24">
                <div className="text-center space-y-6 mb-12">
                    {isEditing ? (
                        <div className="inline-flex flex-col items-center space-y-4">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder={project?.name || 'Untitled Project'}  
                                className="text-3xl md:text-4xl font-bold text-center bg-transparent border-b-2 border-blue-600 dark:text-white focus:outline-none focus:border-blue-700 px-2 py-1"
                                autoFocus
                            />
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSave}
                                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-700"
                                >
                                    <AiOutlineSave className="w-5 h-5" />
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedName(project?.name || '');
                                    }}
                                    className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    <AiOutlineClose className="w-5 h-5" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="group relative inline-flex items-center">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                {project?.name}
                            </h1>
                           
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setEditedName("")
                                    }
                                 }
                                
                                className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <RiEditLine className="w-7 h-7 text-gray-400 hover:text-gray-600" />
                            </button>
                            
                            
                        </div>
                    )}
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created on {formatDate(project?.createdAt)}
                    </p>
                    
                    {project?.description && (
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {project.description}
                        </p>
                    )}
                </div>

                <ProjectLayout projectId={project.id} userId={session?.user?.email || ''} />
            </div>
        </div>
    );
}