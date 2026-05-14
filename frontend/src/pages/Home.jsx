import { useState, useEffect } from 'react';
import StadiumCard from '../components/StadiumCard';

export default function Home() {
  const [stadiums, setStadiums] = useState([]);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchStadiums(); }, []);

  async function fetchStadiums() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (date) params.append('date', date);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums?${params}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setStadiums(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero / Search */}
      <div className="bg-green-800 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Find &amp; Book Soccer Stadiums</h1>
          <p className="text-green-200 mb-8 text-base">Search available slots and reserve your match time</p>

          <div className="flex flex-col sm:flex-row gap-2.5 bg-white p-2.5 rounded-xl shadow-lg">
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Search by location..."
              className="flex-1 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-200"
            />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-200"
            />
            <button
              onClick={fetchStadiums}
              className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition-colors duration-150"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading && <p className="text-center text-gray-400 text-sm">Loading...</p>}
        {error && <p className="text-center text-red-500 text-sm">Error: {error}</p>}

        {!loading && !error && stadiums.length === 0 && (
          <p className="text-center text-gray-400 py-16 text-sm">No stadiums found. Try a different search.</p>
        )}

        {!loading && !error && stadiums.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-5">
              {stadiums.length} stadium{stadiums.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stadiums.map(s => <StadiumCard key={s._id} stadium={s} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
