import Image from "next/image";

export default function About() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl py-2 font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            About Projectica
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're building the future of project management by combining human creativity with artificial intelligence.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative h-[400px]">
            <Image
              src="/about-mission.png"
              alt="Our Mission"
              fill
              className="object-cover rounded-2xl"
              priority
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              To empower teams with intelligent tools that enhance creativity, streamline workflows, 
              and deliver exceptional results. We believe in the power of human-AI collaboration to 
              transform how projects are managed and executed.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Innovation",
              description: "Constantly pushing boundaries to create smarter solutions for modern project challenges."
            },
            {
              title: "Simplicity",
              description: "Making complex project management intuitive and accessible for everyone."
            },
            {
              title: "Excellence",
              description: "Committed to delivering the highest quality tools and experience for our users."
            }
          ].map((value, index) => (
            <div key={index} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">
            Our Team
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We're a diverse team of engineers, designers, and project management experts 
            working together to build the best project management platform.
          </p>
        </div>
      </section>
    </main>
  );
}
