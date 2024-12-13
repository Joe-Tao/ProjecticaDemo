import Link from 'next/link';
import { AiOutlineProject } from 'react-icons/ai';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 pt-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Projectica
          </h1>
          <p className="text-xl text-gray-400">
            Your AI-powered project management assistant
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            href="/workspace"
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg group-hover:bg-blue-500 transition-colors">
                <AiOutlineProject className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Project Workspace
                </h3>
                <p className="text-gray-400">
                  Start planning your project with AI assistance
                </p>
              </div>
            </div>
          </Link>

          {/* 可以添加更多功能卡片 */}
        </div>
      </div>
    </div>
  );
}
