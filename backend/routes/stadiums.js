const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const Stadium = require('../models/Stadium');
const Slot = require('../models/Slot');
const protect = require('../middleware/protect');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Owner: get my stadiums — before /:id to avoid conflict
router.get('/owner/my', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Access denied' });
    const stadiums = await Stadium.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(stadiums);
  } catch (err) {
    next(err);
  }
});

// Public: search stadiums by location and/or available date
router.get('/', async (req, res, next) => {
  try {
    const { location, date, startTime, endTime } = req.query;
    const query = { hidden: { $ne: true } };
    if (location) query.location = { $regex: location, $options: 'i' };

    let stadiums = await Stadium.find(query).populate('owner', 'name email').sort({ createdAt: -1 });

    if (date) {
      const ids = stadiums.map(s => s._id);
      const slotQuery = { stadium: { $in: ids }, date, status: 'available' };
      if (startTime && endTime) {
        slotQuery.startTime = { $lt: endTime };
        slotQuery.endTime = { $gt: startTime };
      }
      const available = await Slot.find(slotQuery);
      const hasAvail = new Set(available.map(s => s.stadium.toString()));
      stadiums = stadiums.filter(s => hasAvail.has(s._id.toString()));
    }

    res.json(stadiums);
  } catch (err) {
    next(err);
  }
});

// Public: single stadium
router.get('/:id', async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id).populate('owner', 'name email _id');
    if (!stadium) return res.status(404).json({ error: 'Stadium not found' });
    res.json(stadium);
  } catch (err) {
    next(err);
  }
});

// Owner: create stadium
router.post('/', protect, upload.array('photos', 5), async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Access denied' });
    const { name, description, location } = req.body;
    let facilities = [];
    try { facilities = JSON.parse(req.body.facilities || '[]'); } catch { facilities = []; }
    const photos = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const stadium = await Stadium.create({ name, description, location, photos, facilities, owner: req.user.id });
    res.status(201).json(stadium);
  } catch (err) {
    next(err);
  }
});

// Owner: toggle hidden status
router.patch('/:id/hidden', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Access denied' });
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) return res.status(404).json({ error: 'Stadium not found' });
    if (stadium.owner.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not your stadium' });
    stadium.hidden = !stadium.hidden;
    await stadium.save();
    res.json({ hidden: stadium.hidden });
  } catch (err) {
    next(err);
  }
});

// Owner: add slots (next 7 days only)
router.post('/:id/slots', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Access denied' });
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) return res.status(404).json({ error: 'Stadium not found' });
    if (stadium.owner.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not your stadium' });

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const { slots } = req.body;
    const created = [];
    const errors = [];

    for (const s of slots) {
      const d = new Date(s.date + 'T00:00:00');
      if (d < today || d > maxDate) {
        errors.push(`${s.date} is outside the 7-day window`);
        continue;
      }
      if (s.date === todayStr && s.startTime <= currentTime) {
        errors.push(`Cannot add a slot in the past. Please select a future time for ${s.date}`);
        continue;
      }
      if (s.startTime === s.endTime) {
        errors.push(`Start time and end time cannot be the same for ${s.date}`);
        continue;
      }
      if (s.endTime < s.startTime) {
        errors.push(`End time must be after start time for ${s.date}`);
        continue;
      }
      try {
        const slot = await Slot.create({ stadium: stadium._id, date: s.date, startTime: s.startTime, endTime: s.endTime });
        created.push(slot);
      } catch (e) {
        errors.push(e.code === 11000 ? `Slot ${s.date} ${s.startTime}–${s.endTime} already exists` : e.message);
      }
    }

    res.status(201).json({ created, errors });
  } catch (err) {
    next(err);
  }
});

// Public: get slots for a stadium (optionally filter by date)
router.get('/:id/slots', async (req, res, next) => {
  try {
    const { date } = req.query;
    const query = { stadium: req.params.id };
    if (date) query.date = date;
    const slots = await Slot.find(query)
      .populate('reservedBy', 'name email _id')
      .sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    next(err);
  }
});

// Owner: stats for a stadium
router.get('/:id/stats', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Access denied' });
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) return res.status(404).json({ error: 'Stadium not found' });
    if (stadium.owner.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not your stadium' });

    const total = await Slot.countDocuments({ stadium: req.params.id });
    const reserved = await Slot.countDocuments({ stadium: req.params.id, status: 'reserved' });
    res.json({ total, reserved, available: total - reserved });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
