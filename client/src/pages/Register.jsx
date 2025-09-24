"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerStatus, setRegisterStatus] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Calculate password strength
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-orange-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak";
    if (passwordStrength < 50) return "Fair";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setRegisterStatus("error");
      toast.error("Please fill in all required fields correctly");
      setTimeout(() => setRegisterStatus(null), 1000);
      return;
    }

    setIsLoading(true);
    setRegisterStatus(null);

    const registerToast = toast.loading("Creating your account...");

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await register(
        formData.username,
        formData.email,
        formData.password
      );

      if (result.success) {
        setRegisterStatus("success");
        toast.success("Account created successfully! Redirecting...", {
          id: registerToast,
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setRegisterStatus("error");
        setErrors({ general: result.error || "Registration failed" });
        toast.error(result.error || "Registration failed", {
          id: registerToast,
        });
      }
    } catch (error) {
      setRegisterStatus("error");
      setErrors({ general: "Network error. Please try again." });
      toast.error("Network error. Please try again.", { id: registerToast });
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
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute top-1/3 left-1/3 w-80 h-80 bg-neon-orange/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-neon-purple/10 rounded-full blur-3xl"
        />
      </div>

      <AuthCard
        title="Join Collabrix"
        subtitle="Create your account and start collaborating"
      >
        <motion.form
          onSubmit={handleSubmit}
          animate={
            registerStatus === "error" ? { x: [-10, 10, -10, 10, 0] } : {}
          }
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
            {registerStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center space-x-2 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">
                  Account created successfully! Redirecting...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Username Field */}
          <FormInput
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            icon={User}
            placeholder="Choose a username"
          />

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

          {/* Password Field with Strength Indicator */}
          <div className="space-y-2">
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              placeholder="Create a strong password"
              showPasswordToggle
            />

            {/* Password Strength Visualizer */}
            <AnimatePresence>
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Password Strength</span>
                    <span
                      className={`font-semibold ${
                        passwordStrength >= 75
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full rounded-full ${getPasswordStrengthColor()}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Confirm Password Field */}
          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={Lock}
            placeholder="Confirm your password"
            showPasswordToggle
          />

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
                  <span>Creating Account...</span>
                </motion.div>
              ) : registerStatus === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Account Created!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Ripple Effect */}
            <AnimatePresence>
              {registerStatus === "success" && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-green-400 rounded-2xl"
                />
              )}
            </AnimatePresence>
          </AnimatedButton>

          {/* Terms */}
          <p className="text-xs text-gray-400 text-center">
            By creating an account, you agree to our{" "}
            <Link
              to="/terms"
              className="text-neon-purple hover:text-neon-teal transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-neon-purple hover:text-neon-teal transition-colors"
            >
              Privacy Policy
            </Link>
          </p>

          {/* Sign In Link */}
          <div className="text-center pt-4">
            <span className="text-gray-400">Already have an account? </span>
            <Link
              to="/login"
              className="text-neon-purple hover:text-neon-teal transition-colors font-semibold"
            >
              Sign in here
            </Link>
          </div>
        </motion.form>
      </AuthCard>
    </div>
  );
};

export default Register;
