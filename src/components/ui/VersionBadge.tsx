import { motion } from 'framer-motion';

export const APP_VERSION = '1.2.0';

export const VersionBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 left-4 text-xs text-white/40 font-mono z-50"
    >
      v{APP_VERSION}
    </motion.div>
  );
};
