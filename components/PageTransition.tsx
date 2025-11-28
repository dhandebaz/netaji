
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<Props> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
      className={`w-full min-h-screen ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
