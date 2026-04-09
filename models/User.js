const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (value) => emailRegex.test(value),
      message: 'Please provide a valid email address'
    }
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be less than 0'],
    max: [120, 'Age cannot be more than 120']
  },
  hobbies: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    required: [true, 'userId is required'],
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Single index on name
userSchema.index({ name: 1 });

// Compound index on email and age
userSchema.index({ email: 1, age: 1 });

// Multikey index on hobbies
userSchema.index({ hobbies: 1 });

// Text index on bio
userSchema.index({ bio: 'text' });

// Hashed index on userId
userSchema.index({ userId: 'hashed' });

// TTL index on createdAt (7 days)
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const User = mongoose.model('User', userSchema);

module.exports = User;
