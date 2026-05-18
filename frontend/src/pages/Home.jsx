import { useState, useEffect } from 'react';
import StadiumCard from '../components/StadiumCard';

const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 0; h <= 23; h++) {
    opts.push(`${String(h).padStart(2, '0')}:00`);
    opts.push(`${String(h).padStart(2, '0')}:30`);
  }
  return opts;
})();

export default function Home() {
  const [stadiums, setStadiums] = useState([]);
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pastWarning, setPastWarning] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setStadiums(json);
        setLocations([...new Set(json.map(s => s.location).filter(Boolean))]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  async function fetchStadiums() {
    setPastWarning('');

    if (date) {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);

      if (date < today) {
        setPastWarning('The selected date is in the past. Please choose today or a future date.');
        return;
      }

      if (date === today && startTime) {
        const [h, m] = startTime.split(':').map(Number);
        const selected = new Date();
        selected.setHours(h, m, 0, 0);
        if (selected < now) {
          setPastWarning('The selected start time has already passed today. Please choose a later time.');
          return;
        }
      }
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (date) params.append('date', date);
      if (date && startTime) params.append('startTime', startTime);
      if (date && endTime) params.append('endTime', endTime);
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

          <div className="flex flex-col gap-3">

            {/* Row 1: Location search bar */}
            <div className="flex gap-2">
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                list="location-list"
                placeholder="Search by location..."
                className="flex-1 rounded-lg px-4 py-3 text-gray-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-white border-2 border-white/70"
              />
              <datalist id="location-list">
                {locations.map(loc => <option key={loc} value={loc} />)}
              </datalist>
              <button
                onClick={fetchStadiums}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors duration-150 whitespace-nowrap"
              >
                Search
              </button>
            </div>

            {/* Row 2: Date + Time filters grouped in border */}
            <div className="flex flex-col sm:flex-row gap-0 border border-white/30 rounded-lg overflow-hidden bg-white/10">
              <div className="flex items-center flex-1 px-3 py-2 border-b sm:border-b-0 sm:border-r border-white/20">
                <span className="text-green-200 text-xs mr-2 whitespace-nowrap">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={e => { setDate(e.target.value); setStartTime(''); setEndTime(''); setPastWarning(''); }}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-green-300 min-w-0"
                />
              </div>
              <div className="flex items-center flex-1 px-3 py-2 border-b sm:border-b-0 sm:border-r border-white/20">
                <span className="text-green-200 text-xs mr-2 whitespace-nowrap">From</span>
                <select
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  disabled={!date}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none disabled:opacity-40 min-w-0"
                >
                  <option value="" className="text-gray-800">-- Any --</option>
                  {TIME_OPTIONS.map(t => <option key={t} value={t} className="text-gray-800">{t}</option>)}
                </select>
              </div>
              <div className="flex items-center flex-1 px-3 py-2">
                <span className="text-green-200 text-xs mr-2 whitespace-nowrap">To</span>
                <select
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  disabled={!date}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none disabled:opacity-40 min-w-0"
                >
                  <option value="" className="text-gray-800">-- Any --</option>
                  {TIME_OPTIONS.map(t => <option key={t} value={t} className="text-gray-800">{t}</option>)}
                </select>
              </div>
            </div>

          </div>

          {pastWarning && (
            <div className="mt-4 flex items-center gap-2 bg-yellow-400/20 border border-yellow-300/60 text-yellow-100 text-sm rounded-lg px-4 py-3">
              <span>⚠</span>
              <span>{pastWarning}</span>
            </div>
          )}
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
