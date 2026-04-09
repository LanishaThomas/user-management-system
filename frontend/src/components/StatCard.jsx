import { motion } from 'framer-motion';

const StatCard = ({ title, value, hint, delay = 0, renderValue }) => {
  return (
    <motion.article
      className="cyber-panel cyber-sweep group rounded-2xl border border-slate-700/60 bg-glass-light p-5 shadow-card backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-300/40"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <p className="text-sm uppercase tracking-[0.16em] text-slate-300">{title}</p>
      {renderValue ? renderValue() : <p className="mt-3 font-heading text-3xl text-slate-100 break-words">{value}</p>}
      <p className="mt-2 text-sm text-slate-400">{hint}</p>
    </motion.article>
  );
};

export default StatCard;
