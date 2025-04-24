import { getCurrentUser, logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const user = getCurrentUser();
    const nav = useNavigate();

    return (
        <div>
            <h1>Welcome, {user?.name || 'User'}</h1>
            <p>Your role: {user?.role}</p>
            <button onClick={() => { logout(); nav('/login'); }}>
                Logout
            </button>
            {/* TODO: list and link to designs */}
        </div>
    );
}
