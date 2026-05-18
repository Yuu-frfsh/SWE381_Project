const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium', required: [true, 'Stadium is required'] },
    date: { type: String, required: [true, 'Date is required'] },
    startTime: { type: String, required: [true, 'Start time is required'] },
    endTime: { type: String, required: [true, 'End time is required'] },
    status: { type: String, enum: ['available', 'reserved'], default: 'available' },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Prevent duplicate slots for the same stadium / date / time window
slotSchema.index({ stadium: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
