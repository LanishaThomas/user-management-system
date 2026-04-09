const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateUserForm = (values) => {
  const errors = {};

  if (!values.name || values.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }

  if (!values.email || !emailRegex.test(values.email)) {
    errors.email = 'A valid email is required';
  }

  const ageValue = Number(values.age);
  if (values.age === '' || Number.isNaN(ageValue) || ageValue < 0 || ageValue > 120) {
    errors.age = 'Age must be between 0 and 120';
  }

  if (!Array.isArray(values.hobbies) || values.hobbies.length === 0) {
    errors.hobbies = 'Add at least one hobby';
  }

  if ((values.bio || '').trim().length < 10) {
    errors.bio = 'Bio should be at least 10 characters';
  }

  return errors;
};
