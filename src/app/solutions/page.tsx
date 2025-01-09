import React from 'react';
import Link from 'next/link';
import { BiBrain } from 'react-icons/bi';
import { HiOutlineLightningBolt } from 'react-icons/hi';
import { TbChartDots } from 'react-icons/tb';

interface Feature {
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  link: string;
}

const features: Feature[] = [
  {
    title: "AI-Enhanced Planning",
    description: "Leverage artificial intelligence to create data-driven marketing strategies and campaign plans.",
    details: [
      "Smart campaign structure recommendations",
      "AI-powered audience targeting",
      "Content strategy optimization",
      "Budget allocation insights"
    ],
    icon: <BiBrain className="w-8 h-8" />,
    link: "/solutions/planning"
  },
  {
    title: "Campaign Execution",
    description: "Streamline your campaign execution with AI assistance and automated workflows.",
    details: [
      "Automated campaign deployment",
      "Real-time performance monitoring",
      "Smart A/B testing",
      "Dynamic content optimization"
    ],
    icon: <HiOutlineLightningBolt className="w-8 h-8" />,
    link: "/solutions/execution"
  },
  {
    title: "Performance Analytics",
    description: "Get deep insights into your campaign performance with advanced analytics and AI predictions.",
    details: [
      "Real-time performance dashboards",
      "Predictive analytics",
      "Custom reporting automation",
      "ROI tracking and optimization"
    ],
    icon: <TbChartDots className="w-8 h-8" />,
    link: "/solutions/analytics"
  }
];

const SolutionsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Core Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover how our AI-powered platform transforms your marketing campaigns
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                    {feature.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center text-gray-600 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href={feature.link}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Learn more 
                    <span className="ml-2">→</span>
                  </Link>
                </div>
                <div className="relative h-[300px] bg-gray-100 dark:bg-gray-700 rounded-xl">
                  {/* Placeholder for feature illustration/screenshot */}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Ready to transform your marketing campaigns?{' '}
            <Link 
              href="/workspace" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Get started now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SolutionsPage; 