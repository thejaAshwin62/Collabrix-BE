"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Users,
  Zap,
  Shield,
  Sparkles,
  Play,
  Star,
} from "lucide-react";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: FileText,
      title: "Real-time Collaboration",
      description:
        "Edit documents together with your team in real-time, see changes instantly.",
    },
    {
      icon: Users,
      title: "Team Workspaces",
      description:
        "Organize your projects with dedicated team spaces and role-based access.",
    },
    {
      icon: Zap,
      title: "AI-Powered Writing",
      description:
        "Get intelligent suggestions and automated formatting with our AI assistant.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-level encryption and compliance with industry security standards.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      content:
        "Collabrix transformed how our team collaborates. The real-time editing is seamless.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Engineering Lead",
      company: "StartupXYZ",
      content:
        "The AI features save us hours of work. Best collaborative editor we've used.",
      rating: 5,
    },
    {
      name: "Elena Rodriguez",
      role: "Design Director",
      company: "Creative Studio",
      content:
        "Beautiful interface and powerful features. Our entire team loves using it.",
      rating: 5,
    },
  ];

  // Simulate typing effect for demo
  const demoText = "Experience the future of collaborative editing...";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < demoText.length) {
        setDisplayText(demoText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setDisplayText("");
          index = 0;
        }, 2000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-dark-300 overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-teal rounded-lg flex items-center justify-center"
              >
                <FileText className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gradient">
                CollabDocs
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/login">
                <AnimatedButton variant="ghost" size="sm">
                  Sign In
                </AnimatedButton>
              </Link>
              <Link to="/register">
                <AnimatedButton variant="primary" size="sm">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-6 leading-tight">
                The Future of
                <br />
                <motion.span
                  animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  className="bg-gradient-to-r from-neon-purple via-neon-teal to-neon-orange bg-clip-text text-transparent bg-[length:200%_100%]"
                >
                  Collaboration
                </motion.span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Experience next-generation document editing with real-time
                collaboration, AI assistance, and a futuristic interface that
                makes teamwork effortless.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
            >
              <Link to="/register">
                <AnimatedButton variant="primary" size="lg">
                  <Sparkles className="w-5 h-5" />
                  Start Creating
                  <ArrowRight className="w-5 h-5" />
                </AnimatedButton>
              </Link>
              <AnimatedButton variant="ghost" size="lg">
                <Play className="w-5 h-5" />
                Watch Demo
              </AnimatedButton>
            </motion.div>

            {/* Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="glass-strong rounded-3xl p-8 border border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-neon-teal/10" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-neon-teal text-sm mb-2">
                      // Live collaborative editor
                    </div>
                    <div className="text-white text-lg font-medium">
                      {displayText}
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className="text-neon-purple"
                      >
                        |
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          className="absolute top-1/4 left-10 w-20 h-20 bg-neon-purple/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          className="absolute top-1/3 right-10 w-32 h-32 bg-neon-teal/20 rounded-full blur-xl"
        />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need for modern collaborative document editing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="glass rounded-2xl p-6 text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-neon-purple to-neon-teal rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-400">
              See what our users are saying
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-neon-orange fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-teal/20" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of teams already using CollabDocs to create
                amazing documents together.
              </p>
              <Link to="/register">
                <AnimatedButton variant="primary" size="lg">
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </AnimatedButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-teal rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">CollabDocs</span>
          </div>
          <p className="text-gray-400">
            © 2024 CollabDocs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
