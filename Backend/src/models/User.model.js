const mongoose = require('mongoose');

/**
 * User Schema — authentication accounts only.
 *
 * A "User" is anyone who can log in to HostelEase:
 *   - role: 'warden'  → hostel staff / admin
 *   - role: 'student' → student portal login
 *
 * This is separate from the Student hostel-profile model (Student.model.js),
 * which stores academic / room-allotment data.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['student', 'warden'],
      default: 'student',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
