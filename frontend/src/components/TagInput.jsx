import { useState } from 'react';

const TagInput = ({ label, tags, onChange, placeholder = 'Add and press Enter' }) => {
  const [value, setValue] = useState('');

  const addTag = () => {
    const next = value.trim().toLowerCase();
    if (!next || tags.includes(next)) return;
    onChange([...tags, next]);
    setValue('');
  };

  const removeTag = (tag) => {
    onChange(tags.filter((item) => item !== tag));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">{label}</label>
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => removeTag(tag)}
              className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-xs text-violet-100 transition hover:bg-violet-500/20"
            >
              {tag} x
            </button>
          ))}
        </div>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              addTag();
            }
          }}
          onBlur={addTag}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
      </div>
    </div>
  );
};

export default TagInput;
