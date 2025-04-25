import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Room2DView from '../components/Room2DView';
import Room3DView from '../components/Room3DView';
import {
    furnitureModels,
    getIconSize,
    defaultRotations
} from '../components/FurnitureManager';

const roomDefinitions = {
    living:  { default:{ width:600, depth:500, height:300 }, textures:{ floor:'/textures/wood_floor.jpg',       wall:'/textures/living_wall.jpg' } },
    kitchen: { default:{ width:400, depth:300, height:300 }, textures:{ floor:'/textures/tile_floor.jpg',      wall:'/textures/kitchen_wall.jpg' } },
    bedroom: { default:{ width:500, depth:400, height:300 }, textures:{ floor:'/textures/carpet_floor.jpg',    wall:'/textures/bedroom_wall_.jpg' } },
    office:  { default:{ width:400, depth:400, height:300 }, textures:{ floor:'/textures/laminate_floor.jpg',  wall:'/textures/office_wall.jpg' } },
    bath:    { default:{ width:300, depth:250, height:300 }, textures:{ floor:'/textures/bath_floor_tile.jpg', wall:'/textures/bathroom_wall.jpg' } },
    dining:  { default:{ width:500, depth:400, height:300 }, textures:{ floor:'/textures/wood_floor2.jpg',     wall:'/textures/dining_wall.jpg' } },
    study:   { default:{ width:400, depth:350, height:300 }, textures:{ floor:'/textures/laminate_floor2.jpg', wall:'/textures/study_wall.jpg' } }
};

export default function RoomEditor() {
    const { roomKey } = useParams();
    const nav = useNavigate();
    const defOrig = roomDefinitions[roomKey];
    const roomDef = defOrig || roomDefinitions['living'];
    const def      = roomDef.default;
    const textures = roomDef.textures;

    const [view,      setView]      = useState('2D');
    const [width,     setWidth]     = useState(def.width);
    const [depth,     setDepth]     = useState(def.depth);
    const [height,    setHeight]    = useState(def.height);
    const [wallTint,  setWallTint]  = useState('');
    const [furniture, setFurniture] = useState([]);
    const [selected,  setSelected]  = useState(null);

    if (!defOrig && view === '2D') {
        return (
            <div style={styles.fallback}>
                <p style={styles.fallbackText}>Unknown room type.</p>
                <button style={styles.backBtn} onClick={()=>nav('/dashboard')}>← Back</button>
            </div>
        );
    }

    const vw = window.innerWidth, vh = window.innerHeight;
    const x0 = (vw - width) / 2, y0 = (vh - depth) / 2;

    const addFurniture = type => {
        const { iconW, iconH } = getIconSize(type);
        setFurniture(f => [
            ...f,
            {
                id: Date.now(),
                type,
                x: x0 + width/2,
                y: y0 + depth/2,
                iconW, iconH,
                rotation: defaultRotations[type] || 0,
                color: null
            }
        ]);
        setSelected(null);
    };

    const resizeSel = d => {
        setFurniture(f => f.map(i =>
            i.id === selected
                ? { ...i, iconW: Math.max(10,i.iconW + d), iconH: Math.max(10,i.iconH + d) }
                : i
        ));
    };

    const rotateSel = d => {
        setFurniture(f => f.map(i =>
            i.id === selected
                ? { ...i, rotation: (i.rotation + d + 360) % 360 }
                : i
        ));
    };

    const changeColor = hex => {
        setFurniture(f => f.map(i =>
            i.id === selected ? { ...i, color: hex } : i
        ));
    };

    const deleteSel = () => {
        setFurniture(f => f.filter(i => i.id !== selected));
        setSelected(null);
    };

    return (
        <div style={styles.container}>
            <div style={styles.tabs}>
                {['2D','3D'].map(t => (
                    <button
                        key={t}
                        onClick={()=>setView(t)}
                        style={{ ...styles.tab, ...(view===t?styles.activeTab:{}) }}
                    >{t} View</button>
                ))}
            </div>

            {view==='2D'
                ? <Room2DView
                    width={width}     setWidth={setWidth}
                    depth={depth}     setDepth={setDepth}
                    height={height}   setHeight={setHeight}
                    x0={x0}           y0={y0}

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
                />
                : <Room3DView
                    width={width}
                    depth={depth}
                    height={height}
                    x0={x0}
                    y0={y0}
                    furniture={furniture}
                    textures={textures}
                    furnitureModels={furnitureModels}
                    wallTint={wallTint}       // ← pass wallTint here
                />
            }

            <button style={styles.backCorner} onClick={()=>nav('/dashboard')}>
                ← Dashboard
            </button>
        </div>
    );
}

const styles = {
    container:    { position:'relative', width:'100vw', height:'100vh', fontFamily:'Segoe UI,sans-serif' },
    tabs:         { display:'flex', position:'absolute', top:0,left:0,right:0,zIndex:2 },
    tab:          { flex:1,padding:16,border:'none',background:'#d0d7de',cursor:'pointer' },
    activeTab:    { background:'#286090',color:'#fff' },
    backCorner:   { position:'absolute',top:12,left:12,padding:8,background:'#286090',color:'#fff',
        border:'none',borderRadius:4,cursor:'pointer',zIndex:3 },
    fallback:     { padding:20 },
    fallbackText: { marginBottom:12 },
    backBtn:      { padding:8,background:'#286090',color:'#fff',border:'none',borderRadius:4 }
};
