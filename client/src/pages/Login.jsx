"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null); // 'success', 'error', null
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check for redirect URL in localStorage or location state
  const getRedirectUrl = () => {
    const redirectFromStorage = localStorage.getItem("redirectAfterLogin");
    const redirectFromState = location.state?.redirectUrl;
    return redirectFromStorage || redirectFromState || "/dashboard";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Shake animation for errors
      setLoginStatus("error");
      toast.error("Please fill in all required fields correctly");
      setTimeout(() => setLoginStatus(null), 1000);
      return;
    }

    setIsLoading(true);
    setLoginStatus(null);

    const loginToast = toast.loading("Signing you in...");

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = await login(formData.email, formData.password);

      if (result.success) {
        setLoginStatus("success");
        toast.success("Login successful! Redirecting...", { id: loginToast });

        // Get redirect URL and clear it from storage
        const redirectUrl = getRedirectUrl();
        localStorage.removeItem("redirectAfterLogin");

        // Delay navigation to show success animation
        setTimeout(() => {
          navigate(redirectUrl, { replace: true });
        }, 1000);
      } else {
        setLoginStatus("error");
        setErrors({ general: result.error || "Login failed" });
        toast.error(result.error || "Login failed", { id: loginToast });
      }
    } catch (error) {
      setLoginStatus("error");
      setErrors({ general: "Network error. Please try again." });
      toast.error("Network error. Please try again.", { id: loginToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 cyber-grid">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-teal/10 rounded-full blur-3xl"
        />
      </div>

      <AuthCard
        title="Welcome Back"
        subtitle="Sign in to your CollabDocs account"
      >
        {/* Share Link Redirect Message */}
        <AnimatePresence>
          {location.state?.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-4 mb-6 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{location.state.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={handleSubmit}
          animate={loginStatus === "error" ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* General Error */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {loginStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center space-x-2 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">
                  Login successful! Redirecting...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            placeholder="Enter your email"
          />

          {/* Password Field */}
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={Lock}
            placeholder="Enter your password"
            showPasswordToggle
          />

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-neon-purple hover:text-neon-teal transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <AnimatedButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Signing In...</span>
                </motion.div>
              ) : loginStatus === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Success!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Ripple Effect */}
            <AnimatePresence>
              {loginStatus === "success" && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-green-400 rounded-2xl"
                />
              )}
            </AnimatePresence>
          </AnimatedButton>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <span className="text-gray-400">Don't have an account? </span>
            <Link
              to="/register"
              className="text-neon-purple hover:text-neon-teal transition-colors font-semibold"
            >
              Sign up here
            </Link>
          </div>
        </motion.form>
      </AuthCard>
    </div>
  );
};

export default Login;
