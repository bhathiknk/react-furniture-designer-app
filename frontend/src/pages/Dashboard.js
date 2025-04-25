// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import API             from '../utils/api';
import { logout }      from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const rooms = [
    { key:'living',  label:'Living Area'  },
    { key:'kitchen', label:'Kitchen'      },
    { key:'bed',     label:'Bedroom'      },
    { key:'office',  label:'Home Office'  },
    { key:'bath',    label:'Bathroom'     },
    { key:'dining',  label:'Dining Room'  },
    { key:'study',   label:'Study'        }
];

export default function Dashboard() {
    const [user,    setUser]    = useState(null);
    const [designs, setDesigns] = useState([]);
    const nav = useNavigate();

    useEffect(() => {
        API.get('/auth/me')
            .then(res => setUser(res.data.user))
            .catch(() => {
                logout();
                nav('/login');
            });

        API.get('/designs')
            .then(res => setDesigns(res.data.designs))
            .catch(() => {});
    }, [nav]);

    // ensure exactly 4 slots
    const slots = Array.from({length: 4}, (_, i) => designs[i] || null);

    return (
        <div style={styles.container}>
            {/* hover styles */}
            <style>{`
        .room-card { transition: transform .3s, box-shadow .3s; }
        .room-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 12px 24px rgba(0,0,0,0.2); }
      `}</style>

            <header style={styles.header}>
                <div>
                    <h1 style={styles.welcome}>Welcome, {user?.name || 'User'}</h1>
                    <p style={styles.role}>Role: {user?.role || '—'}</p>
                </div>
                <button
                    onClick={() => { logout(); nav('/login'); }}
                    style={styles.logoutBtn}
                >
                    Logout
                </button>
            </header>

            {/* Room selection */}
            <h2 style={styles.title}>Select Room</h2>
            <div style={styles.separator}/>
            <div style={styles.grid}>
                {rooms.map(room => (
                    <div
                        key={room.key}
                        className="room-card"
                        style={styles.card}
                        onClick={() => nav(`/viewer/${room.key}`)}
                    >
                        <div style={styles.imageWrapper}>
                            <img
                                src={`/rooms_images/${room.key}_room.png`}
                                alt={room.label}
                                style={styles.image}
                            />
                        </div>
                        <div style={styles.labelBar}>
                            <h3 style={styles.label}>{room.label}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Saved designs */}
            <h2 style={styles.title}>My Saved Designs</h2>
            <div style={styles.separator}/>
            <div style={styles.savedGrid}>
                {slots.map((d, i) => (
                    d ? (
                        <div
                            key={d._id}
                            className="room-card"
                            style={styles.savedCard}
                            onClick={() => nav(`/viewer/${d.roomKey}?design=${d._id}`)}
                        >
                            <div style={styles.savedLabelBar}>
                                <h4 style={styles.savedLabel}>
                                    {d.roomKey.charAt(0).toUpperCase() + d.roomKey.slice(1)}<br/>
                                    <small>{new Date(d.createdAt).toLocaleDateString()}</small>
                                </h4>
                            </div>
                        </div>
                    ) : (
                        <div key={`empty-${i}`} style={styles.savedCard} />
                    )
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding:'32px',
        fontFamily:`'Segoe UI','Helvetica Neue',Arial,sans-serif`,
        background:'linear-gradient(145deg,#e0f7fa,#e8f5e9)',
        minHeight:'100vh',
        color:'#2c3e50'
    },
    header: {
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        padding:'16px 24px',
        background:'#fffddc',
        borderRadius:8,
        boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
        marginBottom:'32px'
    },
    welcome: { margin:0, fontSize:'24px', fontWeight:600 },
    role:    { margin:'4px 0 0', fontSize:'14px', color:'#666' },
    logoutBtn: {
        background:'linear-gradient(135deg,#ff5252,#ff1744)',
        color:'#fff',
        border:'none',
        padding:'10px 20px',
        borderRadius:6,
        cursor:'pointer',
        fontWeight:600,
        boxShadow:'0 4px 12px rgba(0,0,0,0.1)'
    },
    title: {
        textAlign:'center',
        fontSize:'28px',
        fontWeight:600,
        margin:'0 0 8px',
        color:'#34495e'
    },
    separator: {
        width:100,
        height:4,
        background:'#34495e',
        margin:'0 auto 32px',
        borderRadius:2
    },
    grid: {
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',
        gap:'32px',
        marginBottom:'48px'
    },
    card: {
        background:'#fff',
        borderRadius:12,
        overflow:'hidden',
        cursor:'pointer',
        display:'flex',
        flexDirection:'column',
        boxShadow:'0 6px 18px rgba(0,0,0,0.08)',
        height:'360px'
    },
    imageWrapper: {
        flex:'0 0 220px',
        overflow:'hidden'
    },
    image: {
        width:'100%',
        height:'100%',
        objectFit:'cover',
        display:'block'
    },
    labelBar: {
        background:'#34495e',
        padding:12,
        textAlign:'center',
        flexGrow:1,
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
    },
    label: {
        margin:0,
        color:'#fff',
        fontSize:'20px',
        fontWeight:500
    },

    // new fixed‐size grid for saved designs
    savedGrid: {
        display:'grid',
        gridTemplateColumns:'repeat(4,200px)',
        gap:'24px',
        justifyContent:'center',
        marginBottom:'48px'
    },
    savedCard: {
        width:'200px',
        height:'150px',
        background:'#fff',
        borderRadius:8,
        overflow:'hidden',
        cursor:'pointer',
        boxShadow:'0 4px 12px rgba(0,0,0,0.08)',
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
    },
    savedLabelBar: {
        background:'#52616b',
        width:'100%',
        height:'100%',
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
    },
    savedLabel: {
        margin:0,
        color:'#fff',
        fontSize:'16px',
        fontWeight:500,
        lineHeight:1.2,
        textAlign:'center'
    }
};
