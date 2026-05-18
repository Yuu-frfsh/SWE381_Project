const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Stadium name is required'], trim: true },
    description: { type: String, trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    photos: [{ type: String }],
    facilities: { type: [String], default: [] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Owner is required'] },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stadium', stadiumSchema);
