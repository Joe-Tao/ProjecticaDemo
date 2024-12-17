"use client";

import React, { useState } from "react";
import NewChat from "./NewChat";
import { useSession } from "next-auth/react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import ProjectList from "./ProjectList";
import SidebarToggle from "./SidebarToggle";

const Sidebar = () => {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [projects, loading, error] = useCollection(
    session?.user?.email
      ? query(
          collection(db, "users", session.user.email, "projects"),
          orderBy("createdAt", "desc")
        )
      : null 
  );

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-0" : "w-80"
      } bg-[#202123] h-screen p-2 flex-shrink-0 transition-all duration-300 relative`}
    >
      <div className={`${isCollapsed ? "opacity-0" : "opacity-100"} transition-opacity duration-300 overflow-hidden`}>
        <div className="flex flex-col h-screen">
          <div className="flex-1">
            <div>
              <NewChat />

              <div className="flex flex-col space-y-2 my-2">
                {loading && (
                  <div className="animate-pulse text-center text-white">
                    <p>Loading Projects...</p>
                  </div>
                )}

                {/* Project List */}
                <ProjectList projects={projects} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <SidebarToggle isCollapsed={isCollapsed} onToggle={toggleSidebar} />
    </div>
  );
};

export default Sidebar;
