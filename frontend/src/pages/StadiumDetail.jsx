import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SlotGrid from '../components/SlotGrid';

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export default function StadiumDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const days = getNext7Days();

  const [stadium, setStadium] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(null);
  const [msgModal, setMsgModal] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    const fetchStadium = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/${id}`);
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
    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/${id}/slots?date=${selectedDate}`);
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
  }, [id, selectedDate]);

  async function handleReserve(slotId) {
    if (!user) return navigate('/signin');
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/slots/${slotId}/reserve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `Error ${res.status}`);
      }
      const json = await res.json();
      setSlots(prev => prev.map(s => s._id === slotId ? json : s));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(slotId) {
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/slots/${slotId}/reserve`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `Error ${res.status}`);
      }
      const json = await res.json();
      setSlots(prev => prev.map(s => s._id === slotId ? json : s));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendMsg() {
    if (!msgText.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: stadium.owner._id, stadium: stadium._id, content: msgText }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setMsgSent(true);
      setMsgText('');
      setTimeout(() => { setMsgModal(false); setMsgSent(false); }, 1500);
    } catch {
      setError('Could not send message');
    }
  }

  if (loading) return <p className="text-center mt-20 text-gray-400 text-sm">Loading...</p>;
  if (error && !stadium) return <p className="text-center mt-20 text-red-500 text-sm">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Stadium Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          {stadium.photos?.length > 0 ? (
            <div className={`grid gap-2 mb-5 ${stadium.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {stadium.photos.map((photo, i) => (
                <img
                  key={i}
                  src={`${import.meta.env.VITE_API_URL}${photo}`}
                  alt={`${stadium.name} photo ${i + 1}`}
                  className={`w-full object-cover rounded-xl ${stadium.photos.length === 1 ? 'h-56' : 'h-40'}`}
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-56 bg-green-50 rounded-xl mb-5 flex items-center justify-center text-6xl">&#9917;</div>
          )}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{stadium.name}</h1>
              <p className="text-gray-500 mt-1">{stadium.location}</p>
              {stadium.description && <p className="text-gray-600 mt-2 leading-relaxed">{stadium.description}</p>}
              <p className="text-sm text-gray-400 mt-2">Owner: {stadium.owner.name}</p>
            </div>
            {user?.role === 'user' && (
              <button
                onClick={() => setMsgModal(true)}
                className="flex-shrink-0 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors duration-150"
              >
                Message Owner
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Schedule</h2>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  selectedDate === day
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {new Date(day + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                })}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block"></span> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Reserved
            </span>
          </div>

          {slotsLoading && <p className="text-center text-gray-400 text-sm">Loading...</p>}
          {slotsError && <p className="text-center text-red-500 text-sm">Error: {slotsError}</p>}
          {!slotsLoading && !slotsError && (
            <SlotGrid slots={slots} onReserve={handleReserve} onCancel={handleCancel} currentUser={user} />
          )}
        </div>
      </div>

      {/* Message Modal */}
      {msgModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-base font-semibold mb-4 text-gray-900">Message Stadium Owner</h3>
            {msgSent ? (
              <p className="text-green-600 text-center py-4 font-medium text-sm">Message sent!</p>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  rows={4}
                  placeholder="Write your message..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSendMsg}
                    className="flex-1 bg-green-700 text-white py-2 rounded-lg font-semibold text-sm hover:bg-green-800 transition-colors duration-150"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setMsgModal(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
