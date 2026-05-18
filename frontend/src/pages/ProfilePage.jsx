import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Avatar placeholder */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <span className={`inline-block mt-1.5 text-xs font-semibold px-3 py-0.5 rounded-full ${
              user.role === 'owner'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {user.role === 'owner' ? 'Stadium Owner' : 'Match Organizer'}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-sm text-gray-700">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Account ID</p>
              <p className="text-sm text-gray-400 font-mono">{user.id}</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-semibold hover:bg-red-100 transition-colors duration-150 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
