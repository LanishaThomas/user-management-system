import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EmptyState from '../components/EmptyState';
import UserModal from '../components/UserModal';
import { exportUsersCsv, getUsers, getUsersPerformance } from '../services/userApi';
import { useDebounce } from '../utils/useDebounce';
import { highlightTextParts } from '../utils/textHighlight';

const limit = 8;

const requiresRange = (operator) => operator === 'between' || operator === 'outside_between';

const UsersPage = ({ refreshSignal, onUserChanged, showToast }) => {
  const [filters, setFilters] = useState({
    search: '',
    ageOperator: 'eq',
    ageFrom: '',
    ageTo: '',
    hobbies: '',
    sort: 'createdAt:desc'
  });
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: '', users: [], total: 0, totalPages: 1 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [performance, setPerformance] = useState({ open: false, loading: false, error: '', stats: null });

  const debouncedSearch = useDebounce(filters.search, 450);

  const sortParams = useMemo(() => {
    const [sortBy, order] = filters.sort.split(':');
    return { sortBy, order };
  }, [filters.sort]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.ageOperator, filters.ageFrom, filters.ageTo, filters.hobbies, filters.sort]);

  useEffect(() => {
    const fetchUsers = async () => {
      setState((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const hasAgeFrom = String(filters.ageFrom).trim() !== '';
        const hasAgeTo = String(filters.ageTo).trim() !== '';
        const shouldSendRange = requiresRange(filters.ageOperator) && hasAgeFrom && hasAgeTo;
        const shouldSendSingleAge = !requiresRange(filters.ageOperator) && hasAgeFrom;

        const data = await getUsers({
          page,
          limit,
          name: debouncedSearch || undefined,
          ageOperator: shouldSendRange || shouldSendSingleAge ? filters.ageOperator : undefined,
          ageFrom: shouldSendRange || shouldSendSingleAge ? filters.ageFrom || undefined : undefined,
          ageTo: shouldSendRange ? filters.ageTo || undefined : undefined,
          hobbies: filters.hobbies || undefined,
          sortBy: sortParams.sortBy,
          order: sortParams.order
        });

        setState({
          loading: false,
          error: '',
          users: data.users || [],
          total: data.total || 0,
          totalPages: data.totalPages || 1
        });
      } catch (error) {
        setState({
          loading: false,
          error: error.response?.data?.message || error.message,
          users: [],
          total: 0,
          totalPages: 1
        });
        if (showToast) showToast(error.response?.data?.message || error.message, 'error');
      }
    };

    fetchUsers();
  }, [
    page,
    debouncedSearch,
    filters.ageOperator,
    filters.ageFrom,
    filters.ageTo,
    filters.hobbies,
    sortParams.sortBy,
    sortParams.order,
    refreshSignal
  ]);

  const onChangeFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const onSaved = () => {
    if (onUserChanged) onUserChanged();
  };

  const onDeleted = () => {
    if (onUserChanged) onUserChanged();
  };

  const buildQueryParams = () => {
    const hasAgeFrom = String(filters.ageFrom).trim() !== '';
    const hasAgeTo = String(filters.ageTo).trim() !== '';
    const shouldSendRange = requiresRange(filters.ageOperator) && hasAgeFrom && hasAgeTo;
    const shouldSendSingleAge = !requiresRange(filters.ageOperator) && hasAgeFrom;

    return {
      page,
      limit,
      name: debouncedSearch || undefined,
      ageOperator: shouldSendRange || shouldSendSingleAge ? filters.ageOperator : undefined,
      ageFrom: shouldSendRange || shouldSendSingleAge ? filters.ageFrom || undefined : undefined,
      ageTo: shouldSendRange ? filters.ageTo || undefined : undefined,
      hobbies: filters.hobbies || undefined,
      sortBy: sortParams.sortBy,
      order: sortParams.order
    };
  };

  const fetchPerformanceStats = async () => {
    setPerformance((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await getUsersPerformance(buildQueryParams());
      setPerformance({ open: true, loading: false, error: '', stats: data.executionStats || null });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      setPerformance({ open: true, loading: false, error: message, stats: null });
      if (showToast) showToast(message, 'error');
    }
  };

  const downloadCsv = async () => {
    try {
      const queryParams = buildQueryParams();
      const blob = await exportUsersCsv({
        name: queryParams.name,
        ageOperator: queryParams.ageOperator,
        ageFrom: queryParams.ageFrom,
        ageTo: queryParams.ageTo,
        hobbies: queryParams.hobbies
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'users-export.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      if (showToast) showToast('CSV exported successfully.', 'success');
    } catch (error) {
      if (showToast) showToast(error.response?.data?.message || error.message, 'error');
    }
  };

  const renderHighlighted = (value, query) => {
    const parts = highlightTextParts(value, query);
    return parts.map((part, index) => (
      <span key={`${part.text}-${index}`} className={part.match ? 'rounded bg-violet-300/20 px-1 text-violet-100' : ''}>
        {part.text}
      </span>
    ));
  };

  return (
    <section className="cyber-panel cyber-sweep space-y-5 rounded-2xl border border-slate-700/70 bg-glass-light p-6 shadow-card backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-heading text-2xl text-slate-100">Users</h2>
          <p className="text-sm text-slate-400">Browse, filter, and manage users</p>
        </div>

        <button type="button" className="btn-primary" onClick={downloadCsv}>
          Export CSV
        </button>

        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            if (performance.open) {
              setPerformance((prev) => ({ ...prev, open: false }));
              return;
            }
            fetchPerformanceStats();
          }}
        >
          {performance.open ? 'Hide Query Performance' : 'Show Query Performance'}
        </button>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={filters.search}
            onChange={(event) => onChangeFilter('search', event.target.value)}
            placeholder="Search by name"
            className="input-glass"
          />
          <select
            value={filters.ageOperator}
            onChange={(event) => onChangeFilter('ageOperator', event.target.value)}
            className="input-glass"
          >
            <option value="eq">Age =</option>
            <option value="gt">Age {'>'}</option>
            <option value="lt">Age {'<'}</option>
            <option value="between">Age Between</option>
            <option value="outside_between">Age Out of Between</option>
          </select>
          <input
            type="number"
            value={filters.ageFrom}
            onChange={(event) => onChangeFilter('ageFrom', event.target.value)}
            placeholder={requiresRange(filters.ageOperator) ? 'Age from' : 'Age value'}
            className="input-glass"
          />
          {requiresRange(filters.ageOperator) && (
            <input
              type="number"
              value={filters.ageTo}
              onChange={(event) => onChangeFilter('ageTo', event.target.value)}
              placeholder="Age to"
              className="input-glass"
            />
          )}
          <input
            value={filters.hobbies}
            onChange={(event) => onChangeFilter('hobbies', event.target.value)}
            placeholder="Hobbies (comma separated)"
            className="input-glass"
          />
          <select
            value={filters.sort}
            onChange={(event) => onChangeFilter('sort', event.target.value)}
            className="input-glass"
          >
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="name:asc">Name A-Z</option>
            <option value="name:desc">Name Z-A</option>
            <option value="age:asc">Age Low-High</option>
            <option value="age:desc">Age High-Low</option>
          </select>
        </div>
      </div>

      {performance.open && (
        <div className="cyber-panel rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4 backdrop-blur-xl">
          <h3 className="font-heading text-lg text-indigo-100">Query Performance</h3>
          {performance.loading ? (
            <p className="mt-2 text-sm text-slate-300">Collecting execution stats...</p>
          ) : performance.error ? (
            <p className="mt-2 text-sm text-rose-300">{performance.error}</p>
          ) : performance.stats ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-indigo-300/30 bg-slate-900/40 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Keys Examined</p>
                <p className="mt-1 text-2xl font-semibold text-indigo-100">{performance.stats.totalKeysExamined}</p>
              </div>
              <div className="rounded-xl border border-indigo-300/30 bg-slate-900/40 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Docs Examined</p>
                <p className="mt-1 text-2xl font-semibold text-indigo-100">{performance.stats.totalDocsExamined}</p>
              </div>
              <div className="rounded-xl border border-indigo-300/30 bg-slate-900/40 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Execution Time</p>
                <p className="mt-1 text-2xl font-semibold text-indigo-100">{performance.stats.executionTimeMillis} ms</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {state.loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-800/70" />
          ))}
        </div>
      ) : state.error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">{state.error}</div>
      ) : state.users.length === 0 ? (
        <EmptyState title="No users found" message="Try different search terms or reset your filters." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-700/70">
            <table className="min-w-full text-left">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.12em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Hobbies</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t border-slate-800/80 bg-slate-900/35 text-sm text-slate-100 transition hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-3">{renderHighlighted(user.name, filters.search)}</td>
                    <td className="px-4 py-3">{renderHighlighted(user.email, filters.search)}</td>
                    <td className="px-4 py-3">{user.age ?? '-'}</td>
                    <td className="px-4 py-3">{renderHighlighted((user.hobbies || []).join(', ') || '-', filters.hobbies)}</td>
                    <td className="px-4 py-3">
                      <button className="btn-outline" type="button" onClick={() => setSelectedUser(user)}>
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">Total: {state.total}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <span className="text-sm text-slate-300">
                Page {page} of {state.totalPages}
              </span>
              <button
                type="button"
                className="btn-outline"
                disabled={page >= state.totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, state.totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onSaved={onSaved}
            onDeleted={onDeleted}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default UsersPage;
