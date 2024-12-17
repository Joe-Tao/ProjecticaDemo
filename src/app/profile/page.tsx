"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Image from "next/image";
import { FiEdit2, FiMail, FiUser, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";
import Link from "next/link";
import { Timestamp } from 'firebase/firestore';

interface UserProfile {
  name: string;
  email: string;
  image: string;
  bio: string;
  role: string;
  joinedDate: string;
}

interface Project {
  id: string;
  name: string;
  createdAt: Timestamp;
  status?: string;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (status === 'loading') {
        console.log("Session is still loading...");
        return;
      }

      if (status === 'unauthenticated') {
        console.log("User is not authenticated");
        return;
      }

      if (!session?.user?.email) {
        console.log("No user email in session");
        console.log("Session state:", session);
        return;
      }

      console.log("Session status:", status);
      console.log("Current user session:", session.user);
      
      try {
        const profileRef = doc(db, "users", session.user.email);
        console.log("Attempting to fetch profile for:", session.user.email);
        const profileDoc = await getDoc(profileRef);
        
        if (profileDoc.exists()) {
          console.log("Profile data:", profileDoc.data());
          setProfile(profileDoc.data() as UserProfile);
          setEditedProfile(profileDoc.data() as UserProfile);
        } else {
          console.log("No profile found, creating new one");
          const newProfile = {
            name: session.user.name || "",
            email: session.user.email,
            image: session.user.image || "",
            bio: "",
            role: "User",
            joinedDate: new Date().toISOString()
          };
          setProfile(newProfile);
          setEditedProfile(newProfile);
          await setDoc(profileRef, newProfile);
        }
      } catch (error) {
        console.error("Detailed error fetching profile:", error);
        if (error instanceof Error) {
          toast.error(`Failed to load profile: ${error.message}`);
        } else {
          toast.error("Failed to load profile: Unknown error");
        }
      }
    };

    fetchProfile();
  }, [session, status]);

  const handleSave = async () => {
    if (!session?.user?.email || !editedProfile) return;

    try {
      const profileRef = doc(db, "users", session.user.email);
      await setDoc(profileRef, editedProfile, { merge: true });
      setProfile(editedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.email) return;

      try {
        const projectsRef = collection(db, "users", session.user.email, "projects");
        const snapshot = await getDocs(projectsRef);
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      }
    };

    fetchProjects();
  }, [session?.user?.email]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#212121] pt-16 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#212121] pt-16 flex items-center justify-center">
        <div className="text-white">Please sign in to view your profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* 头部背景和头像 */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-12 left-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-800">
                <Image
                  src={profile?.image || "/default-avatar.png"}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* 个人信息 */}
          <div className="p-8 pt-16">
            <div className="flex justify-between items-start mb-6">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile?.name || ""}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev!, name: e.target.value }))}
                    className="bg-gray-700 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white">{profile?.name}</h1>
                )}
                <div className="flex items-center gap-2 text-gray-400 mt-2">
                  <FiMail className="w-4 h-4" />
                  <span>{profile?.email}</span>
                </div>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiEdit2 className="w-4 h-4" />
                {isEditing ? "Save" : "Edit Profile"}
              </button>
            </div>

            {/* 个人简介 */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Bio</h2>
              {isEditing ? (
                <textarea
                  value={editedProfile?.bio || ""}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev!, bio: e.target.value }))}
                  className="w-full h-32 bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-300">
                  {profile?.bio || "No bio yet"}
                </p>
              )}
            </div>
            
            {/* 目前的项目 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">My Projects</h2>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <Link
                      href={`/project/${project.id}`}
                      key={project.id}
                      className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">
                          {project.name || "Untitled Project"}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.status === 'active' 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {project.status || 'In Progress'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Created: {project.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-4 bg-gray-700/50 rounded-lg">
                  No projects yet
                </div>
              )}
            </div>

            {/* 其他信息 */}
            <div className="grid grid-cols-2 justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <FiUser className="w-4 h-4" />
                <span>Role: {profile?.role}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <FiCalendar className="w-4 h-4" />
                <span>Joined: {new Date(profile?.joinedDate || "").toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}