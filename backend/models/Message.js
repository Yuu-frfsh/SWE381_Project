const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Sender is required'] },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Recipient is required'] },
    stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium', default: null },
    content: { type: String, required: [true, 'Message content is required'], trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
