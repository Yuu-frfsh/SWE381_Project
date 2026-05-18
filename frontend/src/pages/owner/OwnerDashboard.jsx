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

  async function handleToggleHidden(stadiumId, currentHidden) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums/${stadiumId}/hidden`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setStadiums(prev => prev.map(s => s._id === stadiumId ? { ...s, hidden: data.hidden } : s));
    } catch (err) {
      setError(err.message);
    }
  }

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
        <div className="flex gap-3 mb-8 border-b border-gray-100 pb-6 flex-wrap">
          <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full">
            {stadiums.length} Stadium{stadiums.length !== 1 ? 's' : ''}
          </span>
          <span className="bg-red-100 text-red-600 text-sm font-semibold px-4 py-1.5 rounded-full">
            {totalBookings} Booked
          </span>
          <span className="bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full">
            {totalAvailable} Available
          </span>
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
                className={`bg-white rounded-xl shadow-sm border overflow-hidden flex ${s.hidden ? 'border-gray-300 opacity-75' : 'border-gray-100'}`}
              >
                {s.photos?.[0] ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${s.photos[0]}`}
                    alt={s.name}
                    className="w-24 h-auto object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 bg-green-50 flex items-center justify-center text-3xl flex-shrink-0">
                    &#9917;
                  </div>
                )}
                <div className="p-5 flex flex-1 justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{s.name}</h3>
                      {s.hidden && (
                        <span className="bg-gray-200 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">Hidden</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{s.location}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {st.total ?? 0} total
                      </span>
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {st.reserved ?? 0} reserved
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {st.available ?? 0} available
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
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
                    <button
                      onClick={() => handleToggleHidden(s._id, s.hidden)}
                      className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors duration-150 ${
                        s.hidden
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {s.hidden ? 'Unhide' : 'Hide'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
