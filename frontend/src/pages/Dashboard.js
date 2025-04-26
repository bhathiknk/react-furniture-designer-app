// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import API                 from '../utils/api';
import { logout }          from '../utils/auth';
import { useNavigate }     from 'react-router-dom';
import Room3DView          from '../components/Room3DView';
import { furnitureModels } from '../components/FurnitureManager';

const rooms = [
    { key:'living',  label:'Living Area'  },
    { key:'kitchen', label:'Kitchen'      },
    { key:'bed',     label:'Bedroom'      },
    { key:'office',  label:'Home Office'  },
    { key:'bath',    label:'Bathroom'     },
    { key:'dining',  label:'Dining Room'  },
    { key:'study',   label:'Study'        }
];

// must match RoomEditor textures map
const texturesMap = {
    living:  { floor:'/textures/wood_floor.jpg',      wall:'/textures/living_wall.jpg' },
    kitchen: { floor:'/textures/tile_floor.jpg',      wall:'/textures/kitchen_wall.jpg' },
    bed:     { floor:'/textures/carpet_floor.jpg',    wall:'/textures/bedroom_wall_.jpg' },
    office:  { floor:'/textures/laminate_floor.jpg',  wall:'/textures/office_wall.jpg' },
    bath:    { floor:'/textures/bath_floor_tile.jpg', wall:'/textures/bathroom_wall.jpg' },
    dining:  { floor:'/textures/wood_floor2.jpg',     wall:'/textures/dining_wall.jpg' },
    study:   { floor:'/textures/laminate_floor2.jpg', wall:'/textures/study_wall.jpg' }
};

export default function Dashboard() {
    const [user,    setUser]    = useState(null);
    const [designs, setDesigns] = useState([]);
    const nav = useNavigate();

    useEffect(() => {
        // fetch current user
        API.get('/auth/me')
            .then(res => setUser(res.data.user))
            .catch(() => { logout(); nav('/login'); });

        // fetch all saved designs
        API.get('/designs')
            .then(res => setDesigns(res.data.designs))
            .catch(() => {});
    }, [nav]);

    return (
        <div style={styles.container}>
            <style>{`
        .room-card { transition: transform .3s, box-shadow .3s; }
        .room-card:hover { transform: translateY(-6px) scale(1.03); box-shadow:0 10px 20px rgba(0,0,0,0.15); }
      `}</style>

            <header style={styles.header}>
                <div>
                    <h1 style={styles.welcome}>Welcome, {user?.name || 'User'}</h1>
                    <p style={styles.role}>Role: {user?.role || '—'}</p>
                </div>
                <button style={styles.logoutBtn} onClick={() => { logout(); nav('/login'); }}>
                    Logout
                </button>
            </header>

            {/* Room selection */}
            <h2 style={styles.title}>Select Room</h2>
            <div style={styles.separator}/>
            <div style={styles.grid}>
                {rooms.map(r => (
                    <div
                        key={r.key}
                        className="room-card"
                        style={styles.card}
                        onClick={() => nav(`/viewer/${r.key}`)}
                    >
                        <div style={styles.imageWrapper}>
                            <img
                                src={`/rooms_images/${r.key}_room.png`}
                                alt={r.label}
                                style={styles.image}
                            />
                        </div>
                        <div style={styles.labelBar}>
                            <h3 style={styles.label}>{r.label}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Saved designs */}
            <h2 style={styles.title}>My Saved Designs</h2>
            <div style={styles.separator}/>
            {designs.length === 0 ? (
                <p style={styles.noDesigns}>No saved designs yet.</p>
            ) : (
                <div style={styles.savedGrid}>
                    {designs.map(d => (
                        <div
                            key={d._id}
                            className="room-card"
                            style={styles.savedCard}
                            onClick={() => nav(`/viewer/${d.roomKey}?design=${d._id}`)}
                        >
                            <div style={styles.thumbnail}>
                                <Room3DView
                                    width={d.width}
                                    depth={d.depth}
                                    height={d.height}
                                    x0={0}
                                    y0={0}
                                    furniture={d.furniture}
                                    textures={texturesMap[d.roomKey]}
                                    furnitureModels={furnitureModels}
                                    wallTint={d.wallTint}
                                />
                            </div>
                            <div style={styles.savedLabelBar}>
                                <h4 style={styles.savedLabel}>
                                    {d.roomKey.charAt(0).toUpperCase() + d.roomKey.slice(1)}<br/>
                                    <small>{new Date(d.createdAt).toLocaleDateString()}</small>
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'16px 24px', background:'#fffddc', borderRadius:8,
        boxShadow:'0 4px 12px rgba(0,0,0,0.1)', marginBottom:'32px'
    },
    welcome:   { margin:0, fontSize:'24px', fontWeight:600 },
    role:      { margin:'4px 0 0', fontSize:'14px', color:'#666' },
    logoutBtn: {
        background:'linear-gradient(135deg,#ff5252,#ff1744)',
        color:'#fff', border:'none',
        padding:'10px 20px', borderRadius:6,
        cursor:'pointer', fontWeight:600,
        boxShadow:'0 4px 12px rgba(0,0,0,0.1)'
    },
    title:     { textAlign:'center', fontSize:'28px', fontWeight:600, margin:'0 0 8px', color:'#34495e' },
    separator: { width:100, height:4, background:'#34495e', margin:'0 auto 32px', borderRadius:2 },

    grid:           { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'32px', marginBottom:'48px' },
    card:           { background:'#fff', borderRadius:12, overflow:'hidden', cursor:'pointer', display:'flex', flexDirection:'column', boxShadow:'0 6px 18px rgba(0,0,0,0.08)', height:'360px' },
    imageWrapper:   { flex:'0 0 220px', overflow:'hidden' },
    image:          { width:'100%', height:'100%', objectFit:'cover' },
    labelBar:       { background:'#34495e', padding:12, textAlign:'center', flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center' },
    label:          { margin:0, color:'#fff', fontSize:'20px', fontWeight:500 },

    noDesigns:      { textAlign:'center', color:'#666', marginBottom:'48px' },

    savedGrid:      { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'24px', marginBottom:'48px' },
    savedCard:      { background:'#fff', borderRadius:8, overflow:'hidden', cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', height:'200px' },
    thumbnail:      { width:'100%', height:'140px', overflow:'hidden' },
    savedLabelBar:  { background:'#52616b', flex:1, display:'flex', alignItems:'center', justifyContent:'center' },
    savedLabel:     { margin:0, color:'#fff', fontSize:'16px', fontWeight:500, lineHeight:1.2, textAlign:'center' }
};
