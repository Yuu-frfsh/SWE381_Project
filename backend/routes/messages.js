const router = require('express').Router();
const Message = require('../models/Message');
const protect = require('../middleware/protect');

router.post('/', protect, async (req, res, next) => {
  try {
    const { to, stadium, content } = req.body;
    const message = await Message.create({ from: req.user.id, to, stadium: stadium || null, content });
    await message.populate('from', 'name role');
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

// Must come before /conversation/:userId
router.get('/inbox', protect, async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ from: req.user.id }, { to: req.user.id }],
    })
      .populate('from', 'name role email')
      .populate('to', 'name role email')
      .sort({ createdAt: -1 });

    const conversations = {};
    for (const msg of messages) {
      const partner =
        msg.from._id.toString() === req.user.id ? msg.to : msg.from;
      const key = partner._id.toString();
      if (!conversations[key]) conversations[key] = { partner, lastMessage: msg };
    }

    res.json(Object.values(conversations));
  } catch (err) {
    next(err);
  }
});

router.get('/conversation/:userId', protect, async (req, res, next) => {
  try {
    const query = {
      $or: [
        { from: req.user.id, to: req.params.userId },
        { from: req.params.userId, to: req.user.id },
      ],
    };
    const messages = await Message.find(query)
      .populate('from', 'name role')
      .populate('to', 'name role')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
