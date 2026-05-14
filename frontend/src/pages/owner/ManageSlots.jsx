import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SlotGrid from '../../components/SlotGrid';

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export default function ManageSlots() {
  const { id } = useParams();
  const { token } = useAuth();
  const days = getNext7Days();

  const [stadium, setStadium] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  }, [id]);

  useEffect(() => {
    loadSlots();
  }, [id, selectedDate]);

  async function loadSlots() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/${id}/slots?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setSlots(json);
    } catch {
      setSlots([]);
    }
  }

  async function handleAddSlot() {
    setError(null);
    setSuccess('');
    if (startTime >= endTime) {
      setError('Start time must be before end time');
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
        loadSlots();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-center mt-20 text-gray-400 text-sm">Loading...</p>;
  if (error && !stadium) return <p className="text-center mt-20 text-red-500 text-sm">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
          <SlotGrid slots={slots} onReserve={() => {}} onCancel={() => {}} currentUser={{ role: 'owner' }} />
        </div>
      </div>
    </div>
  );
}
