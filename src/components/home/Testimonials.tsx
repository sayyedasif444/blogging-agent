'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Content Creator",
    company: "TechBlog Pro",
    content: "BlogTool has completely transformed my content creation process. I can now generate high-quality blog posts in minutes instead of hours. The AI suggestions are incredibly helpful!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Marketing Manager",
    company: "StartupXYZ",
    content: "The SEO optimization features are game-changing. Our blog traffic has increased by 300% since we started using BlogTool. Highly recommended for any business serious about content marketing.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Freelance Writer",
    company: "Content Studio",
    content: "As a freelance writer, BlogTool helps me deliver more content to my clients while maintaining high quality. The editing tools are intuitive and the AI suggestions are spot-on.",
    rating: 5
  },
  {
    name: "David Thompson",
    role: "Blog Owner",
    company: "Digital Nomad Life",
    content: "I was spending 4-5 hours on each blog post. Now with BlogTool, I can create engaging content in under an hour. The analytics help me understand what resonates with my audience.",
    rating: 5
  },
  {
    name: "Lisa Wang",
    role: "SEO Specialist",
    company: "Growth Agency",
    content: "The built-in SEO optimization is fantastic. It automatically suggests improvements and helps me rank better on search engines. This tool has become essential for our content strategy.",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Small Business Owner",
    company: "Local Cafe",
    content: "Running a small business, I don't have time to write lengthy blog posts. BlogTool helps me create professional content that brings customers to my website. It's been a game-changer!",
    rating: 5
  }
];

export default function Testimonials() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            What Our
            <span className="text-primary block"> Users Say</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Join thousands of satisfied users who have transformed their content creation with BlogTool.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-semibold text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Join Our Community
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
} 