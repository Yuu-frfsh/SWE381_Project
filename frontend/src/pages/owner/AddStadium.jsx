import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FACILITIES = [
  'Parking', 'Changing Rooms', 'Lighting (Night Play)', 'Cafeteria',
  'Showers', 'Seating / Stands', 'First Aid', 'Equipment Rental', 'Restrooms',
  'Prayer Room', 'Vending Machine',
];

export default function AddStadium() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  function toggleFacility(f) {
    setFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('location', location);
      fd.append('facilities', JSON.stringify(facilities));
      photos.forEach(p => fd.append('photos', p));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stadiums`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `Error ${res.status}`);
      }
      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Stadium</h1>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg mb-5 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Stadium Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. King Fahad Stadium"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Riyadh, Saudi Arabia"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your stadium, facilities, capacity..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-shadow duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
            <div className="flex flex-wrap gap-2">
              {FACILITIES.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFacility(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 ${
                    facilities.includes(f)
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-green-500 hover:text-green-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {facilities.length > 0 && (
              <p className="text-xs text-gray-400 mt-1.5">{facilities.length} selected</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Photos (up to 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => setPhotos(Array.from(e.target.files).slice(0, 5))}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium hover:file:bg-green-100 file:transition-colors file:duration-150"
            />
            {photos.length > 0 && (
              <p className="text-xs text-gray-400 mt-1.5">{photos.length} photo(s) selected</p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-700 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors duration-150"
            >
              {loading ? 'Saving...' : 'Add Stadium'}
            </button>
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="px-6 bg-gray-100 text-gray-600 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
