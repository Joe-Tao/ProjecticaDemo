import React from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

const DigitalMarketingPage = () => {
  return (
    <div className="h-screen bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-4xl font-bold mb-4">Digital Marketing Solutions</h1>
          <p className="text-gray-400 text-lg">
            Create comprehensive digital marketing strategies with AI assistance
          </p>
        </div>

        <div className="space-y-12">
          <section className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Social Media Campaign Planning
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                SEO Strategy Development
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Content Marketing Calendars
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Digital Advertising Campaigns
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Analytics and Performance Tracking
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-4 text-gray-300">
              <p>1. Share your marketing goals and target audience</p>
              <p>2. Get AI-powered suggestions for strategy and tactics</p>
              <p>3. Receive a detailed marketing plan with timeline and metrics</p>
              <p>4. Track progress and adjust strategies as needed</p>
            </div>
          </section>

          <div className="text-center">
            <Link 
              href="/project/new?template=digital-marketing"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Your Digital Marketing Plan
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalMarketingPage; 