import { AnimatePresence, motion } from 'framer-motion';

const toneMap = {
  success: 'border-indigo-400/40 bg-indigo-500/15 text-indigo-100',
  error: 'border-rose-400/40 bg-rose-500/15 text-rose-100',
  info: 'border-violet-400/40 bg-violet-500/15 text-violet-100'
};

const ToastContainer = ({ toasts }) => {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-card backdrop-blur-xl ${toneMap[toast.type] || toneMap.info}`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
