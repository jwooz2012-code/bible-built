import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3"
    >
      <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
    </motion.div>
  );
}