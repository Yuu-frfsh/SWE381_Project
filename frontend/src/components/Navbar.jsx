import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-green-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity duration-150">
          SoccerHub
        </Link>

        <div className="flex items-center gap-5 text-sm">
          {!user && (
            <>
              <Link to="/signin" className="text-green-100 hover:text-white transition-colors duration-150">Sign In</Link>
              <Link
                to="/signup"
                className="bg-white text-green-800 px-4 py-1.5 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-150"
              >
                Sign Up
              </Link>
            </>
          )}

          {user?.role === 'owner' && (
            <>
              <Link to="/owner/dashboard" className="text-green-100 hover:text-white transition-colors duration-150">Dashboard</Link>
              <Link to="/owner/add-stadium" className="text-green-100 hover:text-white transition-colors duration-150">Add Stadium</Link>
              <Link to="/owner/messages" className="text-green-100 hover:text-white transition-colors duration-150">Messages</Link>
            </>
          )}

          {user?.role === 'user' && (
            <>
              <Link to="/" className="text-green-100 hover:text-white transition-colors duration-150">Search</Link>
              <Link to="/my-reservations" className="text-green-100 hover:text-white transition-colors duration-150">My Reservations</Link>
              <Link to="/messages" className="text-green-100 hover:text-white transition-colors duration-150">Messages</Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-3 ml-1 pl-4 border-l border-green-600">
              <span className="text-green-200 text-xs">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors duration-150"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
