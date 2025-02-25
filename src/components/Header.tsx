import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import Image from "next/image";
import SignOut from "./SignOut";

const Header = async () => {
  const session = await auth()
  return (
    <div className="fixed top-0 left-0 right-0 bg-white/80 border-gray-800 z-50">
      <div className="flex justify-between items-center h-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="text-black font-serif text-3xl flex items-center gap-1 hover:text-black/50 font-semibold tracking-wide px-3 py-2 rounded-lg duration-300"
          >
            Projectica
          </Link>

          <Link
            href="/solutions"
            className="text-black hover:text-black/50 px-3 py-2 rounded-lg duration-300 text-sm font-medium"
          >
            Features
          </Link>

          <Link
            href="/workspace"
            className="text-black hover:text-black/50 px-3 py-2 rounded-lg duration-300 text-sm font-medium"
          >
            Workspace
          </Link>
          <Link
            href="/about"
            className="text-black hover:text-black/50 px-3 py-2 rounded-lg duration-300 text-sm font-medium"
          >
            About
          </Link>
          {/* <Link
            href="/test"
            className="text-black hover:text-black/50 px-3 py-2 rounded-lg duration-300 text-sm font-medium"
          >
            Test
          </Link> */}
        </div>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image 
                    src={session?.user.image as string} 
                    alt="userImage" 
                    width={32} 
                    height={32} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <span className="text-black text-sm hidden md:block">
                  {session.user.name}
              </span>
                
            </div>
            <SignOut />
          </div>
        ) : (
          <Link
            href="/signin"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
