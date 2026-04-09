import { motion } from 'framer-motion';

const actionStyles = {
  CREATE: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40',
  UPDATE: 'bg-violet-500/20 text-violet-200 border-violet-400/40',
  DELETE: 'bg-rose-500/20 text-rose-200 border-rose-400/40'
};

const ActivityTimeline = ({ logs }) => {
  if (!logs.length) {
    return <p className="text-sm text-slate-400">No activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log, idx) => (
        <motion.div
          key={log._id || `${log.action}-${idx}`}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-900/55 p-3"
        >
          <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${actionStyles[log.action] || actionStyles.UPDATE}`}>
            {log.action}
          </span>
          <div>
            <p className="text-sm text-slate-200">{log.userName}</p>
            <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
            {log.details && <p className="mt-1 text-xs text-slate-300">{log.details}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
