const router = require('express').Router();
const Slot = require('../models/Slot');
const protect = require('../middleware/protect');

// Must come before /:id routes to avoid "my" being treated as an id
router.get('/my', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ error: 'Access denied' });
    const slots = await Slot.find({ reservedBy: req.user.id, status: 'reserved' })
      .populate('stadium', 'name location photos')
      .sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reserve', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ error: 'Access denied' });
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status === 'reserved') return res.status(409).json({ error: 'Slot is already reserved' });

    const updated = await Slot.findByIdAndUpdate(
      req.params.id,
      { status: 'reserved', reservedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('reservedBy', 'name email _id');

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/reserve', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ error: 'Access denied' });
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status !== 'reserved') return res.status(400).json({ error: 'Slot is not reserved' });
    if (slot.reservedBy.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not your reservation' });

    const updated = await Slot.findByIdAndUpdate(
      req.params.id,
      { status: 'available', reservedBy: null },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
