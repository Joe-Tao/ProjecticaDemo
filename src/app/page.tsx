import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="w-full">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 py-2">
            Marketing Projects
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-black">
            Powered by Human-AI Synergy
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
            Empowering digital marketers to plan, execute, and launch successful campaigns
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link href="/workspace" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg">
              Get Started
            </Link>
            <Link href="/about" className="bg-gray-300 text-black dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-8 py-3 rounded-full text-lg">
              Learn more →
            </Link>
          </div>
        </section>

        {/* Features Section */}
        {[
          {
            title: "AI-Enhanced Planning",
            subtitle: "Smart insights for your strategy",
            description: "Get Planning and Recommendations from AI",
            image: "/planning-preview.png"
          },
          {
            title: "Campaign Execution",
            subtitle: "Excellent Virtual Assitants helping to find the best freelancer",
            description: "AI Agnets and human automate your marketing campaigns",
            image: "/execution-preview.png"
          },
          {
            title: "Performance Analytics",
            subtitle: "Real-time insights",
            description: "Track and optimize your campaigns with predictive analytics",
            image: "/analytics-preview.png"
          }
        ].map((feature, index) => (
          <section 
            key={index}
            className={`min-h-screen flex items-center ${
              index % 2 === 0 ? 'bg-gray-50 dark:bg-black' : 'bg-white dark:bg-gray-900'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 py-20 w-full grid md:grid-cols-2 gap-12 items-center">
              <div className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <h2 className="text-4xl md:text-5xl font-bold text-black">{feature.title}</h2>
                <p className="text-2xl text-gray-600 dark:text-gray-300">{feature.subtitle}</p>
                <p className="text-lg text-gray-600 dark:text-gray-400">{feature.description}</p>
                <button className="text-blue-600 hover:text-blue-700 text-lg font-medium">
                  Learn more →
                </button>
              </div>
              <div className={`relative h-[400px] ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-contain"
                  priority={index === 0}
                />
              </div>
            </div>
          </section>
        ))}

        {/* Call to Action Section */}
        <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              Ready to Transform Your Marketing?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of marketers who are already leveraging the power of AI
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg">
              Start Free Trial
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
