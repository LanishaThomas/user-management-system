const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95">
      <div className="cyber-panel cyber-sweep relative rounded-3xl border border-indigo-300/30 bg-glass-dark px-16 py-14 backdrop-blur-xl">
        <div
          className="absolute -inset-2 rounded-[2rem] border border-violet-400/30"
          style={{ animation: 'spin 8s linear infinite' }}
        />
        <div
          className="mx-auto mb-6 h-20 w-20 rounded-full border-2 border-indigo-300/50 border-t-violet-300"
          style={{ animation: 'spin 1.1s linear infinite' }}
        />
        <h2 className="animate-pulse text-center font-heading text-2xl text-slate-100">
          Preparing User Hub...
        </h2>
      </div>
    </div>
  );
};

export default LoadingScreen;
