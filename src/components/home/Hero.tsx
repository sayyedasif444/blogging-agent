'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

export default function Hero() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    size: number;
    initialX: number;
    initialY: number;
    duration: number;
    delay: number;
    animateX: number;
    animateY: number;
  }>>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  
  useEffect(() => {
    // Generate particles on client-side only to avoid hydration mismatch
    const generatedParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 2,
      animateX: Math.random() * 100 - 50,
      animateY: Math.random() * 100 - 50,
    }));
    setParticles(generatedParticles);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        const rate = scrolled * -0.5;
        heroRef.current.style.transform = `translateY(${rate}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center bg-black overflow-hidden">
      {/* Particles */}
      <div className="absolute inset-0 z-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.initialX}%`,
              top: `${particle.initialY}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.2, 0],
              scale: [0, 1, 0],
              x: [0, particle.animateX, 0],
              y: [0, particle.animateY, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Gradient background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-r from-primary/20 to-transparent"
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div ref={ref} className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="relative lg:col-span-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: inView ? "150px" : 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-[1px] bg-white/20 mb-8"
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
                transition={{ duration: 0.5 }}
                className="text-sm uppercase tracking-[0.4em] text-gray-200 mb-4 font-medium"
              >
                AI-Powered Blog Creation
              </motion.p>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-3xl sm:text-4xl lg:text-[2.5rem] !leading-[1.4] font-bold text-white mb-6"
              >
                Create Engaging <span className="text-primary relative inline-block">
                  Blog Content
                  <motion.svg 
                    className="absolute -bottom-2 left-0 w-full" 
                    viewBox="0 0 200 8" 
                    xmlns="http://www.w3.org/2000/svg" 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: inView ? 1 : 0, opacity: inView ? 0.6 : 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <path d="M 0 5 C 50 0, 150 0, 200 5" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary" />
                  </motion.svg>
                </span>
                <br className="my-4" />
                {" "}with AI Assistance
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg text-gray-300 mb-8 max-w-2xl"
              >
                Transform your ideas into compelling blog posts with our advanced AI platform. 
                Generate, edit, and optimize content that engages your audience and drives results.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Creating
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  Watch Demo
                </motion.button>
              </motion.div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.8 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="relative"
              >
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">AI Blog Generator</h3>
                    <p className="text-gray-400 text-sm">Create content in seconds</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 