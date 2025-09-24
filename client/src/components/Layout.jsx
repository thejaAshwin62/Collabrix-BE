"use client";

import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

const Layout = ({ children, showSidebar = true }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen bg-dark-300">
      <Navbar />
      {showSidebar && <Sidebar />}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`${showSidebar ? "ml-80" : ""} pt-16 h-screen`}
        style={{ marginLeft: showSidebar ? "280px" : "0" }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
