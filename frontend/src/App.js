// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Viewer3D  from './pages/RoomEditor'; // create this

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login"    element={<Login/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/viewer/:roomKey" element={<Viewer3D/>} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}
