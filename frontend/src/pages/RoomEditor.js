// src/pages/RoomEditor.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';
import Swal from 'sweetalert2';

import Room2DView from '../components/Room2DView';
import Room3DView from '../components/Room3DView';
import {
    furnitureModels,
    getIconSize,
    defaultRotations
} from '../components/FurnitureManager';

const roomDefinitions = {
    living:  { default:{ width:600, depth:500, height:300 }, textures:{ floor:'/textures/wood_floor.jpg',      wall:'/textures/living_wall.jpg' } },
    kitchen: { default:{ width:400, depth:300, height:300 }, textures:{ floor:'/textures/tile_floor.jpg',      wall:'/textures/kitchen_wall.jpg' } },
    bed:     { default:{ width:500, depth:400, height:300 }, textures:{ floor:'/textures/carpet_floor.jpg',    wall:'/textures/bedroom_wall_.jpg' } },
    office:  { default:{ width:400, depth:400, height:300 }, textures:{ floor:'/textures/office_floor.jpg',     wall:'/textures/office_wall.jpg' } },
    bath:    { default:{ width:300, depth:250, height:300 }, textures:{ floor:'/textures/bath_floor_tile.jpg',  wall:'/textures/bathroom_wall.jpg' } },
    dining:  { default:{ width:500, depth:400, height:300 }, textures:{ floor:'/textures/wood_floor2.jpg',      wall:'/textures/dining_wall.jpg' } },
    study:   { default:{ width:400, depth:350, height:300 }, textures:{ floor:'/textures/laminate_floor2.jpg',  wall:'/textures/study_wall.jpg' } }
};

export default function RoomEditor() {
    const { roomKey } = useParams();
    const nav         = useNavigate();
    const { search }  = useLocation();
    const designId    = new URLSearchParams(search).get('design');

    const defOrig    = roomDefinitions[roomKey];
    const roomDef    = defOrig || roomDefinitions['living'];
    const def        = roomDef.default;
    const textures   = roomDef.textures;

    const [view,      setView]      = useState('2D');
    const [width,     setWidth]     = useState(def.width);
    const [depth,     setDepth]     = useState(def.depth);
    const [height,    setHeight]    = useState(def.height);
    const [wallTint,  setWallTint]  = useState('');
    const [furniture, setFurniture] = useState([]);
    const [selected,  setSelected]  = useState(null);

    // Load existing design if editing
    useEffect(() => {
        if (!designId) return;

        API.get(`/designs/${designId}`)
            .then(res => {
                const d  = res.data.design;
                const vw = window.innerWidth, vh = window.innerHeight;
                const x0 = (vw - d.width ) / 2;
                const y0 = (vh - d.depth ) / 2;

                setWidth(d.width);
                setDepth(d.depth);
                setHeight(d.height);
                setWallTint(d.wallTint);

                setFurniture(
                    d.furniture.map(i => ({
                        ...i,
                        x: x0 + i.x,
                        y: y0 + i.y
                    }))
                );
            })
            .catch(err => {
                console.error(err);
                Swal.fire(
                    'Load failed',
                    'Could not load saved design. Opening blank editor.',
                    'error'
                ).then(() => {
                    // strip the ?design= so we fall back to a fresh 2D view
                    nav(`/viewer/${roomKey}`, { replace: true });
                });
            });
    }, [designId, roomKey, nav]);

    // Save new design
    const saveDesign = () => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const x0 = (vw - width ) / 2;
        const y0 = (vh - depth ) / 2;
        const rel = furniture.map(i => ({
            ...i,
            x: i.x - x0,
            y: i.y - y0
        }));

        API.post('/designs', { roomKey, width, depth, height, wallTint, furniture: rel })
            .then(() => {
                Swal.fire('Saved!', 'Your design has been saved.', 'success')
                    .then(() => nav('/dashboard'));
            })
            .catch(() => {
                Swal.fire('Error', 'Failed to save design.', 'error');
            });
    };

    // Update existing design
    const updateDesign = () => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const x0 = (vw - width ) / 2;
        const y0 = (vh - depth ) / 2;
        const rel = furniture.map(i => ({
            ...i,
            x: i.x - x0,
            y: i.y - y0
        }));

        API.put(`/designs/${designId}`, { roomKey, width, depth, height, wallTint, furniture: rel })
            .then(() => {
                Swal.fire('Updated!', 'Design updated successfully.', 'success')
                    .then(() => nav('/dashboard'));
            })
            .catch(() => {
                Swal.fire('Error', 'Failed to update design.', 'error');
            });
    };

    // Delete design
    const deleteDesign = () => {
        API.delete(`/designs/${designId}`)
            .then(() => {
                Swal.fire('Deleted!', 'Design has been deleted.', 'success')
                    .then(() => nav('/dashboard'));
            })
            .catch(() => {
                Swal.fire('Error', 'Failed to delete design.', 'error');
            });
    };

    // If the route is wrong, show a simple fallback
    if (!defOrig && view === '2D') {
        return (
            <div style={styles.fallback}>
                <p style={styles.fallbackText}>Unknown room type.</p>
                <button style={styles.backBtn} onClick={() => nav('/dashboard')}>← Back</button>
            </div>
        );
    }

    const vw = window.innerWidth, vh = window.innerHeight;
    const x0 = (vw - width) / 2, y0 = (vh - depth) / 2;

    // Furniture handlers
    const addFurniture = type => {
        const { iconW, iconH } = getIconSize(type);
        setFurniture(f => [
            ...f,
            {
                id:      Date.now(),
                type,
                x:       x0 + width/2,
                y:       y0 + depth/2,
                iconW,
                iconH,
                rotation: defaultRotations[type] || 0,
                color:   null
            }
        ]);
        setSelected(null);
    };
    const resizeSel   = delta => setFurniture(f =>
        f.map(i => i.id === selected
            ? { ...i,
                iconW: Math.max(10, i.iconW + delta),
                iconH: Math.max(10, i.iconH + delta)
            }
            : i
        )
    );
    const rotateSel   = delta => setFurniture(f =>
        f.map(i => i.id === selected
            ? { ...i, rotation: (i.rotation + delta + 360) % 360 }
            : i
        )
    );
    const changeColor = hex => setFurniture(f =>
        f.map(i => i.id === selected
            ? { ...i, color: hex }
            : i
        )
    );
    const deleteSel   = () => {
        setFurniture(f => f.filter(i => i.id !== selected));
        setSelected(null);
    };

    return (
        <div style={styles.container}>
            {/* Tab Bar */}
            <div style={styles.tabs}>
                {['2D','3D'].map(t => (
                    <button
                        key={t}
                        onClick={() => setView(t)}
                        style={{
                            ...styles.tab,
                            ...(view === t ? styles.activeTab : {})
                        }}
                    >
                        {t} View
                    </button>
                ))}
            </div>

            {/* 2D or 3D Editor */}
            {view === '2D' ? (
                <Room2DView
                    width={width}      setWidth={setWidth}
                    depth={depth}      setDepth={setDepth}
                    height={height}    setHeight={setHeight}
                    x0={x0}            y0={y0}
                    furniture={furniture}
                    selectedId={selected}
                    setFurniture={setFurniture}
                    setSelected={setSelected}
                    addFurniture={addFurniture}
                    resizeSel={resizeSel}
                    rotateSel={rotateSel}
                    changeColor={changeColor}
                    deleteSel={deleteSel}
                    wallTint={wallTint}
                    setWallTint={setWallTint}
                    onSave={saveDesign}
                    onUpdate={updateDesign}
                    onDelete={deleteDesign}
                    isEditing={!!designId}
                />
            ) : (
                <Room3DView
                    width={width}
                    depth={depth}
                    height={height}
                    x0={x0}
                    y0={y0}
                    furniture={furniture}
                    textures={textures}
                    furnitureModels={furnitureModels}
                    wallTint={wallTint}
                    enableControls
                />
            )}

            {/* Back to Dashboard */}
            <button style={styles.dashboardBtn} onClick={() => nav('/dashboard')}>
                ← Dashboard
            </button>
        </div>
    );
}

const styles = {
    container: {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        fontFamily: 'Segoe UI, sans-serif',
        overflow: 'hidden'
    },
    tabs: {
        display: 'flex',
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#fff',
        padding: '8px',
        borderRadius: '28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 20
    },
    tab: {
        flex: 1,
        padding: '12px 32px',
        fontSize: '16px',
        border: 'none',
        background: 'transparent',
        borderRadius: '24px',
        cursor: 'pointer',
        fontWeight: 500,
        color: '#555',
        transition: 'background .2s, color .2s'
    },
    activeTab: {
        background: 'linear-gradient(135deg,#4a90e2,#357abd)',
        color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
    },
    dashboardBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: '12px 24px',
        fontSize: '16px',
        background: '#357abd',
        color: '#fff',
        border: 'none',
        borderRadius: '24px',
        cursor: 'pointer',
        fontWeight: 600,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        zIndex: 20
    },
    fallback: { padding: 20 },
    fallbackText: { marginBottom: 12 },
    backBtn: { padding: 8, background: '#286090', color: '#fff', border: 'none', borderRadius: 4 }
};
