const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: number of occupied beds
roomSchema.virtual('occupiedBeds').get(function () {
  return this.occupants ? this.occupants.length : 0;
});

// Virtual: number of available beds
roomSchema.virtual('availableBeds').get(function () {
  const occCount = this.occupants ? this.occupants.length : 0;
  return this.capacity - occCount;
});

module.exports = mongoose.model('Room', roomSchema);
