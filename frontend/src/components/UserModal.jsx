import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { deleteUser, updateUser } from '../services/userApi';
import { validateUserForm } from '../utils/validation';
import TagInput from './TagInput';

const UserModal = ({ user, onClose, onSaved, onDeleted, showToast }) => {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    age: user.age ?? '',
    hobbies: Array.isArray(user.hobbies) ? user.hobbies : [],
    bio: user.bio || ''
  });
  const [status, setStatus] = useState({ saving: false, deleting: false, error: '' });

  const errors = useMemo(() => validateUserForm(form), [form]);

  const onFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) {
      setStatus((prev) => ({ ...prev, error: 'Please fix validation errors before saving.' }));
      if (showToast) showToast('Please fix validation errors before saving.', 'error');
      return;
    }

    setStatus({ saving: true, deleting: false, error: '' });
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        age: Number(form.age),
        hobbies: form.hobbies,
        bio: form.bio.trim()
      };
      const updated = await updateUser(user._id, payload);
      onSaved(updated);
      if (showToast) showToast('User updated successfully.', 'success');
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      setStatus({ saving: false, deleting: false, error: message });
      if (showToast) showToast(message, 'error');
      return;
    }
    setStatus({ saving: false, deleting: false, error: '' });
  };

  const handleDelete = async () => {
    setStatus({ saving: false, deleting: true, error: '' });
    try {
      await deleteUser(user._id);
      onDeleted(user._id);
      if (showToast) showToast('User deleted successfully.', 'success');
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      setStatus({ saving: false, deleting: false, error: message });
      if (showToast) showToast(message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
      <motion.div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900/90 p-6 backdrop-blur-xl"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-2xl text-slate-100">User Details</h3>
          <button className="text-slate-400 transition hover:text-slate-100" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Name</label>
            <input
              value={form.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              className="input-glass"
            />
            {errors.name && <p className="text-xs text-rose-300">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Email</label>
            <input
              value={form.email}
              onChange={(event) => onFieldChange('email', event.target.value)}
              className="input-glass"
            />
            {errors.email && <p className="text-xs text-rose-300">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Age</label>
            <input
              type="number"
              value={form.age}
              onChange={(event) => onFieldChange('age', event.target.value)}
              className="input-glass"
            />
            {errors.age && <p className="text-xs text-rose-300">{errors.age}</p>}
          </div>

          <div className="sm:col-span-2">
            <TagInput label="Hobbies" tags={form.hobbies} onChange={(next) => onFieldChange('hobbies', next)} />
            {errors.hobbies && <p className="mt-1 text-xs text-rose-300">{errors.hobbies}</p>}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm text-slate-300">Bio</label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(event) => onFieldChange('bio', event.target.value)}
              className="input-glass"
            />
            {errors.bio && <p className="text-xs text-rose-300">{errors.bio}</p>}
          </div>
        </div>

        {status.error && <p className="mt-4 text-sm text-rose-300">{status.error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            disabled={status.saving}
            onClick={handleSave}
          >
            {status.saving ? 'Saving...' : 'Update User'}
          </button>

          <button
            type="button"
            className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
            disabled={status.deleting}
            onClick={handleDelete}
          >
            {status.deleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserModal;
