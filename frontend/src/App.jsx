import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import StadiumDetail from './pages/StadiumDetail';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddStadium from './pages/owner/AddStadium';
import ManageSlots from './pages/owner/ManageSlots';
import OwnerMessages from './pages/owner/OwnerMessages';
import MyReservations from './pages/organizer/MyReservations';
import OrganizerMessages from './pages/organizer/OrganizerMessages';

function PrivateRoute() {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/signin" />;
}

function RoleRoute({ role }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/signin" />;
  if (user?.role !== role) return <Navigate to="/" />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/stadiums/:id" element={<StadiumDetail />} />

          <Route element={<RoleRoute role="owner" />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/add-stadium" element={<AddStadium />} />
            <Route path="/owner/stadiums/:id/slots" element={<ManageSlots />} />
            <Route path="/owner/messages" element={<OwnerMessages />} />
          </Route>

          <Route element={<RoleRoute role="organizer" />}>
            <Route path="/my-reservations" element={<MyReservations />} />
            <Route path="/messages" element={<OrganizerMessages />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
