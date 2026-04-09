import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getActivityLogs, getAnalytics, getUsers } from '../services/userApi';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import ActivityTimeline from '../components/ActivityTimeline';

const Dashboard = ({ refreshSignal, showToast }) => {
  const [state, setState] = useState({
    loading: true,
    error: '',
    total: 0,
    users: [],
    analytics: { hobbies: [], ageDistribution: [] },
    logs: []
  });

  useEffect(() => {
    const fetchSummary = async () => {
      setState((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const [usersData, analyticsData, logsData] = await Promise.all([
          getUsers({ page: 1, limit: 100, sortBy: 'createdAt', order: 'desc' }),
          getAnalytics(),
          getActivityLogs({ limit: 20 })
        ]);

        setState({
          loading: false,
          error: '',
          total: usersData.total || 0,
          users: usersData.users || [],
          analytics: {
            hobbies: analyticsData.hobbies || [],
            ageDistribution: analyticsData.ageDistribution || []
          },
          logs: logsData.logs || []
        });
      } catch (error) {
        const message = error.response?.data?.message || error.message;
        setState({
          loading: false,
          error: message,
          total: 0,
          users: [],
          analytics: { hobbies: [], ageDistribution: [] },
          logs: []
        });
        if (showToast) showToast(message, 'error');
      }
    };

    fetchSummary();
  }, [refreshSignal]);

  const avgAge = useMemo(() => {
    const ages = state.users.map((user) => user.age).filter((age) => typeof age === 'number');
    if (!ages.length) return 0;
    const total = ages.reduce((sum, age) => sum + age, 0);
    return (total / ages.length).toFixed(1);
  }, [state.users]);

  const topHobbies = useMemo(() => {
    const hobbyCount = new Map();
    state.users.forEach((user) => {
      (user.hobbies || []).forEach((hobby) => {
        const key = hobby.toLowerCase();
        hobbyCount.set(key, (hobbyCount.get(key) || 0) + 1);
      });
    });

    return [...hobbyCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  }, [state.users]);

  if (state.loading) {
    return <div className="rounded-2xl border border-slate-700/70 bg-glass-light p-8 text-slate-300">Loading dashboard...</div>;
  }

  if (state.error) {
    return <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">{state.error}</div>;
  }

  return (
    <section className="space-y-5">
      <motion.h2
        className="font-heading text-3xl text-slate-100"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        System Dashboard
      </motion.h2>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Users" value={state.total} hint="Across all pages" delay={0.05} />
        <StatCard
          title="Most Common Hobbies"
          hint="Based on latest indexed records"
          delay={0.12}
          renderValue={() => (
            <div className="mt-3 flex flex-wrap gap-2">
              {topHobbies.length > 0 ? (
                topHobbies.map((item) => (
                  <span
                    key={item.name}
                    className="rounded-full border border-violet-300/35 bg-violet-500/10 px-3 py-1 text-sm font-medium text-violet-100"
                  >
                    {item.name} ({item.count})
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-300">No hobby data</span>
              )}
            </div>
          )}
        />
        <StatCard title="Average Age" value={avgAge} hint="Computed from user ages" delay={0.2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Most Common Hobbies (Bar Chart)" delay={0.1}>
          <div className="space-y-2">
            {state.analytics.hobbies.map((item) => (
              <div key={item.hobby} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{item.hobby}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                    style={{
                      width: `${Math.max(8, (item.count / Math.max(1, state.analytics.hobbies[0]?.count || 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
            {state.analytics.hobbies.length === 0 && <p className="text-sm text-slate-400">No hobby data available.</p>}
          </div>
        </ChartCard>

        <ChartCard title="Age Distribution (Histogram)" delay={0.15}>
          <div className="flex min-h-40 items-end gap-2">
            {state.analytics.ageDistribution.map((bucket) => {
              const max = Math.max(1, ...state.analytics.ageDistribution.map((item) => item.count));
              const height = Math.max(10, (bucket.count / max) * 120);
              return (
                <div key={bucket.range} className="flex-1">
                  <div className="group flex h-36 items-end justify-center">
                    <div
                      title={`${bucket.range}: ${bucket.count}`}
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-500/70 to-violet-300/70 transition-all duration-300 group-hover:from-violet-400/80"
                      style={{ height }}
                    />
                  </div>
                  <p className="mt-1 text-center text-[10px] text-slate-400">{bucket.range}</p>
                </div>
              );
            })}
          </div>
          {state.analytics.ageDistribution.length === 0 && <p className="text-sm text-slate-400">No age data available.</p>}
        </ChartCard>
      </div>

      <ChartCard title="Activity Timeline" delay={0.2}>
        <ActivityTimeline logs={state.logs} />
      </ChartCard>
    </section>
  );
};

export default Dashboard;
