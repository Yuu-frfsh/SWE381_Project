import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SlotGrid from '../../components/SlotGrid';

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 0; h <= 23; h++) {
    opts.push(`${String(h).padStart(2, '0')}:00`);
    opts.push(`${String(h).padStart(2, '0')}:30`);
  }
  return opts;
})();

function hasOverlap(existingSlots, date, startTime, endTime) {
  return existingSlots.some(
    s => s.date === date && s.startTime < endTime && s.endTime > startTime
  );
}

export default function ManageSlots() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const days = getNext7Days();

  const [stadium, setStadium] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchStadium = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setStadium(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStadium();
  }, [id, token]);

  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/${id}/slots?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setSlots(json);
      } catch (err) {
        setSlotsError(err.message);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate, token]);

  function isPastSlot(date, time) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (date !== todayStr || !time) return false;
    const [h, m] = time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);
    return slotTime <= now;
  }

  async function handleDeleteSlot(slotId) {
    if (!window.confirm('Are you sure you want to permanently delete this slot?')) return;
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/slots/${slotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `Error ${res.status}`);
      }
      setSlots(prev => prev.filter(s => s._id !== slotId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddSlot() {
    setError(null);
    setSuccess('');
    if (!startTime || !endTime) {
      setError('Please select both start and end times');
      return;
    }
    if (isPastSlot(selectedDate, startTime)) {
      setError('Cannot add a slot in the past. Please select a future date and time.');
      return;
    }
    if (startTime === endTime) {
      setError('Start time and end time cannot be the same');
      return;
    }
    if (endTime < startTime) {
      setError('End time must be after start time');
      return;
    }
    if (hasOverlap(slots, selectedDate, startTime, endTime)) {
      setError('This time slot overlaps with an existing slot');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/${id}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slots: [{ date: selectedDate, startTime, endTime }] }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `Error ${res.status}`);
      }
      const data = await res.json();
      if (data.errors?.length > 0) {
        setError(data.errors.join(' | '));
      } else {
        setSuccess('Slot added successfully!');
        setStartTime('');
        setEndTime('');
        setSlotsLoading(true);
        setSlotsError(null);
        const slotsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/${id}/slots?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!slotsRes.ok) throw new Error(`Error ${slotsRes.status}`);
        const slotsJson = await slotsRes.json();
        setSlots(slotsJson);
        setSlotsLoading(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
      setSlotsLoading(false);
    }
  }

  if (loading) return <p className="text-center mt-20 text-gray-400 text-sm">Loading...</p>;
  if (error && !stadium) return <p className="text-center mt-20 text-red-500 text-sm">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back button */}
        <Link
          to="/owner/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors duration-150"
        >
          &#8592; Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Manage Slots</h1>
        <p className="text-gray-500 text-sm mb-6">{stadium.name} &mdash; {stadium.location}</p>

        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {days.map(day => (
            <button
              key={day}
              onClick={() => { setSelectedDate(day); setError(null); setSuccess(''); }}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                selectedDate === day
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {new Date(day + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              })}
            </button>
          ))}
        </div>

        {/* Add slot form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Add Slot &mdash;{' '}
            <span className="font-normal text-gray-500">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </span>
          </h2>

          {error && <div className="bg-red-50 text-red-600 px-3 py-2.5 rounded-lg mb-3 text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 px-3 py-2.5 rounded-lg mb-3 text-sm">{success}</div>}

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Start Time</label>
              <select
                value={startTime}
                onChange={e => {
                  const val = e.target.value;
                  setStartTime(val);
                  if (isPastSlot(selectedDate, val)) {
                    setError('Cannot add a slot in the past. Please select a future date and time.');
                  } else {
                    setError(null);
                  }
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">-- Select --</option>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">End Time</label>
              <select
                value={endTime}
                onChange={e => {
                  const val = e.target.value;
                  setEndTime(val);
                  if (val && startTime && val <= startTime) {
                    setError('End time must be after start time');
                  } else {
                    setError(null);
                  }
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">-- Select --</option>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button
              onClick={handleAddSlot}
              className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors duration-150"
            >
              Add Slot
            </button>
          </div>
        </div>

        {/* Schedule view */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Slots for Selected Day</h2>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-600 rounded-full"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Reserved</span>
            </div>
          </div>
          {slotsLoading && <p className="text-center text-gray-400 text-sm">Loading...</p>}
          {slotsError && <p className="text-center text-red-500 text-sm">Error: {slotsError}</p>}
          {!slotsLoading && !slotsError && (
            <SlotGrid slots={slots} onReserve={() => {}} onCancel={() => {}} onDelete={handleDeleteSlot} currentUser={{ role: 'owner' }} />
          )}
        </div>
      </div>
    </div>
  );
}
