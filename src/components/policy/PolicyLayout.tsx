'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface PolicySection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface PolicyLayoutProps {
  title: string;
  description: string;
  effectiveDate: string;
  sections: PolicySection[];
}

export default function PolicyLayout({
  title,
  description,
  effectiveDate,
  sections,
}: PolicyLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id);

  return (
    <main className="min-h-screen pt-32 pb-16 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with animated gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-gray-800/50 to-gray-900/50 blur-3xl -z-10" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
            {title}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-2">{description}</p>
          <p className="text-sm text-gray-500">Effective Date: {effectiveDate}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar with hover effects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <nav className="sticky top-32 space-y-2">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gray-800/80 text-white border-l-4 border-gray-400 shadow-lg shadow-gray-900/50'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  {section.title}
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Content Area with glass effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-gray-900/80 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 shadow-2xl shadow-black/50">
              {sections.map((section) => (
                <motion.section
                  key={section.id}
                  initial={false}
                  animate={{
                    height: activeSection === section.id ? 'auto' : 0,
                    opacity: activeSection === section.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`overflow-hidden bg-transparent ${
                    activeSection === section.id ? 'mb-8' : 'mb-0'
                  }`}
                >
                  <motion.h2 
                    className="text-2xl font-semibold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {section.title}
                  </motion.h2>
                  <motion.div 
                    className="prose prose-invert max-w-none [&>*]:text-gray-300 [&>ul]:text-gray-300 [&>p]:text-gray-300 [&>div]:text-gray-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {section.content}
                  </motion.div>
                </motion.section>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
} 