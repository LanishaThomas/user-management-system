import { motion } from 'framer-motion';

const EmptyState = ({ title, message }) => {
  return (
    <motion.div
      className="mx-auto mt-8 max-w-lg rounded-2xl border border-slate-700/70 bg-glass-light p-8 text-center backdrop-blur-xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/10">
        <motion.div
          className="h-14 w-14 rounded-full border-2 border-dashed border-violet-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
        />
      </div>
      <h3 className="font-heading text-2xl text-slate-100">{title}</h3>
      <p className="mt-2 text-slate-400">{message}</p>
    </motion.div>
  );
};

export default EmptyState;
