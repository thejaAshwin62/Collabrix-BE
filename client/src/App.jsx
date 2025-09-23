"use client";

import { Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Toaster } from "sonner";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import Teams from "./pages/Teams";
import AIAssistant from "./pages/AIAssistant";
import Offline from "./pages/Offline";
import PublicShare from "./pages/PublicShare";
import SharedDocs from "./pages/SharedDocs";
import AccessRequests from "./pages/AccessRequests";
import JoinDocument from "./pages/JoinDocument";

// Context
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-accent">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Routes location={location}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/editor/:docId?" element={<Editor />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/ai" element={<AIAssistant />} />
                <Route path="/offline" element={<Offline />} />
                <Route path="/share/:docId" element={<PublicShare />} />
                <Route path="/shared" element={<SharedDocs />} />
                <Route path="/access-requests" element={<AccessRequests />} />
                <Route path="/join" element={<JoinDocument />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sonner Toast Notifications */}
        <Toaster
          theme="dark"
          position="top-right"
          expand={true}
          richColors={true}
          closeButton={true}
          toastOptions={{
            style: {
              background: "rgba(17, 24, 39, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
