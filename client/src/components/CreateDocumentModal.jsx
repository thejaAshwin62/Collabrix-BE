"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, FileText, Folder, Sparkles, ArrowRight } from "lucide-react";
import AnimatedButton from "./AnimatedButton";
import FormInput from "./FormInput";

const CreateDocumentModal = ({ isOpen, onClose, onDocumentCreated }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "document",
    template: "blank",
  });

  const templates = [
    {
      id: "blank",
      name: "Blank Document",
      description: "Start with a clean slate",
      icon: FileText,
      cover:
        "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2",
    },
    {
      id: "meeting-notes",
      name: "Meeting Notes",
      description: "Template for meeting documentation",
      icon: FileText,
      cover:
        "https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2",
    },
    {
      id: "project-plan",
      name: "Project Plan",
      description: "Structured project planning template",
      icon: Folder,
      cover:
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2",
    },
    {
      id: "design-brief",
      name: "Design Brief",
      description: "Creative project brief template",
      icon: Sparkles,
      cover:
        "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Create document using the callback function
      try {
        await onDocumentCreated({
          title: formData.title,
          description: formData.description,
        });
        handleClose();
      } catch (error) {
        console.error("Failed to create document:", error);
        // Error handling is done in the parent component
      }
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      title: "",
      description: "",
      type: "document",
      template: "blank",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl glass-panel p-8 neon-glow"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {step === 1 ? "Create New Document" : "Choose Template"}
                </h2>
                <p className="text-gray-300">
                  {step === 1
                    ? "Start your next collaborative project"
                    : "Select a template to get started quickly"}
                </p>
              </div>
              <motion.button
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                onClick={handleClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormInput
                    type="text"
                    name="title"
                    placeholder="Document title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    icon={FileText}
                    required
                  />

                  <FormInput
                    type="text"
                    name="description"
                    placeholder="Brief description (optional)"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    icon={Sparkles}
                  />

                  <div className="flex gap-4">
                    <motion.button
                      type="button"
                      className={`flex-1 p-4 rounded-2xl border transition-all duration-300 ${
                        formData.type === "document"
                          ? "border-neon-purple bg-neon-purple/20 text-white"
                          : "border-white/20 bg-glass-white text-gray-300 hover:border-white/30"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, type: "document" })
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FileText className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Document</div>
                    </motion.button>

                    <motion.button
                      type="button"
                      className={`flex-1 p-4 rounded-2xl border transition-all duration-300 ${
                        formData.type === "workspace"
                          ? "border-neon-teal bg-neon-teal/20 text-white"
                          : "border-white/20 bg-glass-white text-gray-300 hover:border-white/30"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, type: "workspace" })
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Folder className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Workspace</div>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <motion.button
                        key={template.id}
                        type="button"
                        className={`p-4 rounded-2xl border transition-all duration-300 text-left ${
                          formData.template === template.id
                            ? "border-neon-purple bg-neon-purple/20"
                            : "border-white/20 bg-glass-white hover:border-white/30"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, template: template.id })
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="h-24 rounded-xl overflow-hidden mb-3">
                          <img
                            src={template.cover || "/placeholder.svg"}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <template.icon className="w-5 h-5 text-neon-purple" />
                          <h3 className="font-medium text-white">
                            {template.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-300">
                          {template.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-8">
                {step === 2 && (
                  <AnimatedButton
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </AnimatedButton>
                )}
                <div className="flex-1" />
                <AnimatedButton
                  type="submit"
                  variant="primary"
                  className="group"
                  disabled={!formData.title}
                >
                  {step === 1 ? "Continue" : "Create Document"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateDocumentModal;
