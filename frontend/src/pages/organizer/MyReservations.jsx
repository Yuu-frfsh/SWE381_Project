import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MyReservations() {
  const { token } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/slots/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setSlots(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [token]);

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
      setSlots(prev => prev.filter(s => s._id !== slotId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-center mt-20 text-gray-400 text-sm">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-500 text-sm">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Reservations</h1>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg mb-5 text-sm">{error}</div>
        )}

        {slots.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500 text-sm">
            No reservations yet.{' '}
            <Link to="/" className="text-green-700 font-semibold hover:underline">
              Browse stadiums
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {slots.map(slot => (
            <div
              key={slot._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex justify-between items-center gap-4"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{slot.stadium?.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{slot.stadium?.location}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
                    {slot.date}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-medium tabular-nums">
                    {slot.startTime} &ndash; {slot.endTime}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  to={`/stadiums/${slot.stadium?._id}`}
                  className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors duration-150 font-medium"
                >
                  View
                </Link>
                <button
                  onClick={() => handleCancel(slot._id)}
                  className="bg-red-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors duration-150 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
