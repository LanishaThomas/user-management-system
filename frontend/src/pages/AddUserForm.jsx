import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { createUser, getRecommendations } from '../services/userApi';
import { validateUserForm } from '../utils/validation';
import TagInput from '../components/TagInput';

const initialValues = {
  name: '',
  email: '',
  age: '',
  hobbies: [],
  bio: ''
};

const AddUserForm = ({ onCreated, showToast }) => {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });
  const [recommendations, setRecommendations] = useState([]);

  const errors = useMemo(() => validateUserForm(values), [values]);

  const setField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const data = await getRecommendations();
        setRecommendations(data.recommendations || []);
      } catch {
        setRecommendations([]);
      }
    };

    loadRecommendations();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, age: true, hobbies: true, bio: true });

    if (Object.keys(errors).length > 0) {
      setStatus({ loading: false, success: '', error: 'Please correct the highlighted fields.' });
      if (showToast) showToast('Please fix form errors before submit.', 'error');
      return;
    }

    setStatus({ loading: true, success: '', error: '' });

    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        age: Number(values.age),
        hobbies: values.hobbies,
        bio: values.bio.trim(),
        userId: `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      };

      const created = await createUser(payload);
      setValues(initialValues);
      setTouched({});
      setStatus({ loading: false, success: 'User created successfully.', error: '' });
      if (showToast) showToast('User created successfully.', 'success');
      if (onCreated) onCreated(created);
    } catch (error) {
      setStatus({
        loading: false,
        success: '',
        error: error.response?.data?.message || error.message
      });
      if (showToast) showToast(error.response?.data?.message || error.message, 'error');
    }
  };

  const fieldError = (field) => (touched[field] ? errors[field] : '');

  return (
    <section className="cyber-panel cyber-sweep rounded-2xl border border-slate-700/70 bg-glass-light p-6 shadow-card backdrop-blur-xl">
      <h2 className="mb-5 font-heading text-2xl text-slate-100">Add New User</h2>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Name</label>
          <input
            className="input-glass"
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            placeholder="Enter full name"
          />
          {fieldError('name') && <p className="text-xs text-rose-300">{fieldError('name')}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-300">Email</label>
          <input
            className="input-glass"
            value={values.email}
            onChange={(event) => setField('email', event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder="name@example.com"
          />
          {fieldError('email') && <p className="text-xs text-rose-300">{fieldError('email')}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-300">Age</label>
          <input
            type="number"
            className="input-glass"
            value={values.age}
            onChange={(event) => setField('age', event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
            placeholder="0 - 120"
          />
          {fieldError('age') && <p className="text-xs text-rose-300">{fieldError('age')}</p>}
        </div>

        <div className="md:col-span-2">
          <TagInput
            label="Hobbies"
            tags={values.hobbies}
            onChange={(next) => {
              setField('hobbies', next);
              setTouched((prev) => ({ ...prev, hobbies: true }));
            }}
            placeholder="Type hobby then Enter"
          />
          {recommendations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {recommendations.map((item) => (
                <button
                  key={item.hobby}
                  type="button"
                  className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-100 transition hover:bg-violet-500/20"
                  onClick={() => {
                    if (values.hobbies.includes(item.hobby)) return;
                    setField('hobbies', [...values.hobbies, item.hobby]);
                  }}
                >
                  + {item.hobby}
                </button>
              ))}
            </div>
          )}
          {fieldError('hobbies') && <p className="mt-1 text-xs text-rose-300">{fieldError('hobbies')}</p>}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm text-slate-300">Bio</label>
          <textarea
            rows={4}
            className="input-glass"
            value={values.bio}
            onChange={(event) => setField('bio', event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, bio: true }))}
            placeholder="Write a short profile"
          />
          {fieldError('bio') && <p className="text-xs text-rose-300">{fieldError('bio')}</p>}
        </div>

        <div className="md:col-span-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={status.loading}
            className="btn-primary animate-pulseGlow"
            type="submit"
          >
            {status.loading ? 'Creating User...' : 'Create User'}
          </motion.button>
        </div>
      </form>

      {status.success && <p className="mt-4 text-sm text-indigo-300">{status.success}</p>}
      {status.error && <p className="mt-4 text-sm text-rose-300">{status.error}</p>}
    </section>
  );
};

export default AddUserForm;
