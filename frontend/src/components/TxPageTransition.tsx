import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface TxPageTransitionProps {
  children: ReactNode;
}

export default function TxPageTransition({ children }: TxPageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
