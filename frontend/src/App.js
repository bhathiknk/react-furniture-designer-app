import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login    from './pages/Login';
import Dashboard from './pages/Dashboard';
import { getCurrentUser } from './utils/auth';

function ProtectedRoute({ children }) {
  return getCurrentUser() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register/>} />
          <Route path="/login"    element={<Login/>} />
          <Route path="/dashboard"
                 element={
                   <ProtectedRoute>
                     <Dashboard/>
                   </ProtectedRoute>
                 } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
  );
}
