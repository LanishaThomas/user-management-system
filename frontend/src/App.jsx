import { useEffect, useState } from 'react';
import AddUserForm from './pages/AddUserForm';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import CursorGlow from './components/CursorGlow';
import LoadingScreen from './components/LoadingScreen';
import ToastContainer from './components/ToastContainer';

const tabs = ['dashboard', 'add-user', 'users'];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsBootLoading(false), 1300);
    return () => clearTimeout(timer);
  }, []);

  const onUserChanged = () => {
    setRefreshSignal((prev) => prev + 1);
  };

  const showToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  };

  if (isBootLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 pb-12 text-slate-100">
      <CursorGlow />
      <ToastContainer toasts={toasts} />
      <div className="bg-orb-cyan" aria-hidden="true" />
      <div className="bg-orb-mint" aria-hidden="true" />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <header className="cyber-panel cyber-sweep mb-8 rounded-2xl border border-slate-700/70 bg-glass-light p-6 backdrop-blur-xl">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-violet-300">User Management System</p>
          <h1 className="font-heading text-4xl sm:text-5xl">UserFlow Nexus</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Monitor, analyze, and optimize user data with enterprise-grade precision.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? 'bg-indigo-400/20 text-indigo-100 shadow-glow'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/70'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'add-user' ? 'Add User' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <section>
          {activeTab === 'dashboard' && <Dashboard refreshSignal={refreshSignal} showToast={showToast} />}
          {activeTab === 'add-user' && (
            <AddUserForm
              showToast={showToast}
              onCreated={() => {
                onUserChanged();
                setActiveTab('users');
              }}
            />
          )}
          {activeTab === 'users' && (
            <UsersPage refreshSignal={refreshSignal} onUserChanged={onUserChanged} showToast={showToast} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
