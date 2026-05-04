const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['Paid', 'Unpaid'],
        message: 'Status must be either Paid or Unpaid',
      },
      default: 'Unpaid',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
