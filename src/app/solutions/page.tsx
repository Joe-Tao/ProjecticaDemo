import React from 'react';
import Link from 'next/link';

interface UseCase {
  title: string;
  description: string;
  icon: string;
  link: string;
}

const useCases: UseCase[] = [
  {
    title: "Digital Marketing",
    description: "Create comprehensive digital marketing strategies. From social media campaigns to SEO optimization and content marketing planning.",
    icon: "📱",
    link: "/solutions/digital-marketing"
  },
  {
    title: "Project Management",
    description: "Plan and manage your projects with AI assistance. Get help with task breakdown, timeline estimation, and resource allocation.",
    icon: "📊",
    link: "/solutions/project-management"
  },
  {
    title: "Event Planning",
    description: "Organize events efficiently with AI-powered planning tools. From venue selection to guest management and timeline coordination.",
    icon: "🎉",
    link: "/solutions/event-planning"
  },
  {
    title: "Product Launch",
    description: "Launch your products successfully with comprehensive planning. Cover marketing, distribution, and customer feedback strategies.",
    icon: "🚀",
    link: "/solutions/product-launch"
  },
  {
    title: "Content Creation",
    description: "Plan your content strategy and creation pipeline. Get help with content ideation, scheduling, and distribution planning.",
    icon: "✍️",
    link: "/solutions/content-creation"
  },
  {
    title: "Research Project",
    description: "Plan and organize research projects efficiently. Get help with methodology planning, data collection, and analysis strategies.",
    icon: "🔬",
    link: "/solutions/research"
  }
];

const SolutionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Solutions</h1>
          <p className="text-gray-400 text-lg">
            Explore our use cases and find the perfect solution for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Link 
              href={useCase.link} 
              key={index}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300"
            >
              <div className="text-4xl mb-4">{useCase.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
              <p className="text-gray-400">{useCase.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400">
            Can&quot;t find what you&apos;re looking for?{' '}
            <Link href="/project/new" className="text-blue-400 hover:text-blue-300">
              Start a custom project
            </Link>
          </p>
      </div>

      </div>
    </div>
  );
};

export default SolutionsPage; 