import { motion } from 'framer-motion';

const ChartCard = ({ title, children, delay = 0 }) => (
  <motion.article
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.4, delay }}
    className="cyber-panel cyber-sweep rounded-2xl border border-slate-700/70 bg-glass-light p-5 shadow-card backdrop-blur-xl"
  >
    <h3 className="mb-4 font-heading text-xl text-slate-100">{title}</h3>
    {children}
  </motion.article>
);

export default ChartCard;
