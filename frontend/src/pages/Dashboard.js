import { getCurrentUser, logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const rooms = [
    { key: 'living',  label: 'Living Area',  width: 6, depth: 5, height: 3, wallColor:'#f5f5dc', floorColor:'#d3d3d3' },
    { key: 'kitchen', label: 'Kitchen',      width: 4, depth: 3, height: 3, wallColor:'#ffe4e1', floorColor:'#faf0e6' },
    { key: 'bedroom', label: 'Bedroom',      width: 5, depth: 4, height: 3, wallColor:'#e6e6fa', floorColor:'#fffafa' },
    { key: 'office',  label: 'Home Office',  width: 4, depth: 4, height: 3, wallColor:'#f0fff0', floorColor:'#f0f8ff' },
    { key: 'bath',    label: 'Bathroom',     width: 3, depth: 2.5, height: 3, wallColor:'#e0ffff', floorColor:'#f5fffa' },
    { key: 'dining',  label: 'Dining Room',  width: 5, depth: 4, height: 3, wallColor:'#fff0f5', floorColor:'#fdf5e6' },
    { key: 'study',   label: 'Study',        width: 4, depth: 3.5, height: 3, wallColor:'#f5f5dc', floorColor:'#ffe4c4' },
];

export default function Dashboard() {
    const user = getCurrentUser();
    const nav  = useNavigate();

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1>Welcome, {user?.name || 'User'}</h1>
                    <p>Role: {user?.role}</p>
                </div>
                <button
                    onClick={() => { logout(); nav('/login'); }}
                    style={styles.logoutBtn}
                >
                    Logout
                </button>
            </header>

            <div style={styles.grid}>
                {rooms.map(room => (
                    <div
                        key={room.key}
                        style={styles.card}
                        onClick={() => nav(`/viewer/${room.key}`)}
                    >
                        <h3 style={styles.label}>{room.label}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '24px', fontFamily: 'sans-serif' },
    header: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '32px'
    },
    logoutBtn: {
        background: '#e74c3c', color: '#fff', border: 'none',
        padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '24px'
    },
    card: {
        background: '#fff', borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        cursor: 'pointer', textAlign: 'center',
        transition: 'transform .2s', padding: '16px'
    },
    label: {
        margin: 'auto', fontSize: '18px', color: '#333'
    }
};
