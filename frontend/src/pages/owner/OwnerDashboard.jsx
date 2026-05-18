import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function OwnerDashboard() {
  const { user, token } = useAuth();
  const [stadiums, setStadiums] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/owner/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setStadiums(data);

        const allStats = await Promise.all(
          data.map(s =>
            fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/${s._id}/stats`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => {
              if (!r.ok) throw new Error(`Error ${r.status}`);
              return r.json();
            }).then(rs => ({ id: s._id, ...rs }))
          )
        );
        const map = {};
        allStats.forEach(s => { map[s.id] = s; });
        setStats(map);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const totalBookings = Object.values(stats).reduce((sum, s) => sum + (s.reserved || 0), 0);
  const totalAvailable = Object.values(stats).reduce((sum, s) => sum + (s.available || 0), 0);

  if (loading) return <p className="text-center mt-20 text-gray-400 text-sm">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-500 text-sm">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user.name}</p>
          </div>
          <Link
            to="/owner/add-stadium"
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors duration-150"
          >
            + Add Stadium
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-8 text-sm border-b border-gray-100 pb-6">
          <div>
            <span className="font-semibold text-gray-900">{stadiums.length}</span>{' '}
            <span className="text-gray-500">stadium{stadiums.length !== 1 ? 's' : ''}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">{totalBookings}</span>{' '}
            <span className="text-gray-500">booked</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">{totalAvailable}</span>{' '}
            <span className="text-gray-500">available</span>
          </div>
        </div>

        {/* Stadiums List */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">My Stadiums</h2>

        {stadiums.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-500 text-sm">
            No stadiums yet.{' '}
            <Link to="/owner/add-stadium" className="text-green-700 font-semibold hover:underline">
              Add your first stadium
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {stadiums.map(s => {
            const st = stats[s._id] || {};
            return (
              <div
                key={s._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex justify-between items-center gap-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{s.location}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-red-500 font-medium">{st.reserved ?? 0} reserved</span>
                    <span className="text-green-700 font-medium">{st.available ?? 0} available</span>
                    <span className="text-gray-400">{st.total ?? 0} total</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    to={`/owner/stadiums/${s._id}/slots`}
                    className="bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors duration-150 font-medium"
                  >
                    Manage Slots
                  </Link>
                  <Link
                    to={`/stadiums/${s._id}`}
                    className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors duration-150 font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
