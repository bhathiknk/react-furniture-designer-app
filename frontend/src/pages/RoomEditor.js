// src/pages/RoomEditor.js
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    useTexture,
    Environment,
    ContactShadows
} from '@react-three/drei';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useState } from 'react';
import * as THREE from 'three';

// Scale factor: how many 2D pixels map to 1 unit in 3D
const SCALE3D = 100;

const roomDefinitions = {
    living: {
        default: { width: 600, depth: 500, height: 300 },
        textures: { floor: '/textures/wood_floor.jpg', wall: '/textures/paint_wall.jpg' }
    },
    kitchen: {
        default: { width: 400, depth: 300, height: 300 },
        textures: { floor: '/textures/tile_floor.jpg', wall: '/textures/kitchen_wall_tiled.jpg' }
    },
    bedroom: {
        default: { width: 500, depth: 400, height: 300 },
        textures: { floor: '/textures/carpet_floor.jpg', wall: '/textures/paint_wall2.jpg' }
    },
    office: {
        default: { width: 400, depth: 400, height: 300 },
        textures: { floor: '/textures/laminate_floor.jpg', wall: '/textures/paint_wall3.jpg' }
    },
    bath: {
        default: { width: 300, depth: 250, height: 300 },
        textures: { floor: '/textures/bath_floor_tile.jpg', wall: '/textures/bath_wall_tile.jpg' }
    },
    dining: {
        default: { width: 500, depth: 400, height: 300 },
        textures: { floor: '/textures/wood_floor2.jpg', wall: '/textures/paint_wall4.jpg' }
    },
    study: {
        default: { width: 400, depth: 350, height: 300 },
        textures: { floor: '/textures/laminate_floor2.jpg', wall: '/textures/paint_wall5.jpg' }
    }
};

function RoomBox({ width, depth, height, textures, openSide, wallTint }) {
    const [floorMap, wallMap] = useTexture([textures.floor, textures.wall]);
    floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
    floorMap.repeat.set(width / SCALE3D, depth / SCALE3D);
    wallMap.wrapS = wallMap.wrapT = THREE.RepeatWrapping;
    wallMap.repeat.set(width / SCALE3D, height / SCALE3D);

    const walls = [
        { name:'back',  rot:[0,0,0],         pos:[0,height/(2*SCALE3D), -depth/(2*SCALE3D)], size:[width/SCALE3D, height/SCALE3D] },
        { name:'front', rot:[0,Math.PI,0],   pos:[0,height/(2*SCALE3D),  depth/(2*SCALE3D)], size:[width/SCALE3D, height/SCALE3D] },
        { name:'left',  rot:[0,Math.PI/2,0], pos:[-width/(2*SCALE3D), height/(2*SCALE3D), 0],   size:[depth/SCALE3D, height/SCALE3D] },
        { name:'right', rot:[0,-Math.PI/2,0],pos:[ width/(2*SCALE3D), height/(2*SCALE3D), 0],   size:[depth/SCALE3D, height/SCALE3D] }
    ];

    return (
        <group>
            <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
                <planeGeometry args={[width/SCALE3D, depth/SCALE3D]} />
                <meshStandardMaterial map={floorMap} />
            </mesh>
            {walls.filter(w => w.name !== openSide).map((w,i) => (
                <mesh key={i} rotation={w.rot} position={w.pos} castShadow>
                    <planeGeometry args={w.size} />
                    <meshStandardMaterial
                        side={THREE.DoubleSide}
                        map={wallMap}
                        color={wallTint || '#ffffff'}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function RoomEditor() {
    const { roomKey } = useParams();
    const nav = useNavigate();
    const defOrig = roomDefinitions[roomKey];
    const defFull = defOrig || roomDefinitions['living'];
    const { default: def, textures } = defFull;

    // Hooks
    const [view, setView]         = useState('2D');
    const [width, setWidth]       = useState(def.width);
    const [depth, setDepth]       = useState(def.depth);
    const [height, setHeight]     = useState(def.height);
    const [wallTint, setWallTint] = useState('');
    // End hooks

    if (!defOrig) {
        return (
            <div style={styles.fallback}>
                <p style={styles.fallbackText}>Unknown room type.</p>
                <button style={styles.backButton} onClick={()=>nav('/dashboard')}>← Back</button>
            </div>
        );
    }

    // Full-viewport dims
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Center 2D rectangle
    const x0 = (vw - width) / 2;
    const y0 = (vh - depth) / 2;

    // Camera positioning in 3D (scaled):
    const maxDim3 = Math.max(width, depth) / SCALE3D;
    const camY    = (height / SCALE3D) * 0.6 + maxDim3 * 0.4;
    const camZ    = maxDim3 * 1.2;

    return (
        <div style={styles.container}>
            {/* Tabs */}
            <div style={styles.tabs}>
                {['2D','3D'].map(tab => (
                    <button key={tab}
                            onClick={()=>setView(tab)}
                            style={{
                                ...styles.tab,
                                ...(view===tab?styles.activeTab:{})
                            }}
                    >{tab} View</button>
                ))}
            </div>

            {/* Controls (2D only) */}
            {view==='2D' && (
                <div style={styles.controls}>
                    <h4 style={styles.controlHeader}>Room Settings</h4>
                    <DimensionControl label="Width (px)"
                                      value={width} onChange={setWidth}
                                      min={10} max={vw} step={1} />
                    <DimensionControl label="Depth (px)"
                                      value={depth} onChange={setDepth}
                                      min={10} max={vh} step={1} />
                    <DimensionControl label="Height (px)"
                                      value={height} onChange={setHeight}
                                      min={10} max={vh} step={1} />
                    <div style={styles.tintGroup}>
                        <label style={styles.tintLabel}>Wall Tint:</label>
                        <input type="color" value={wallTint}
                               onChange={e=>setWallTint(e.target.value)}
                               style={styles.colorInput}/>
                        <button onClick={()=>setWallTint('')} style={styles.resetButton}>
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {view === '2D' ? (
                <Stage width={vw} height={vh} style={styles.fullStage}>
                    <Layer>
                        {/* Floor plan */}
                        <Rect
                            x={x0} y={y0}
                            width={width} height={depth}
                            fill="#fafafa"
                            stroke={wallTint||'#2980b9'}
                            strokeWidth={4}
                            cornerRadius={6}
                        />
                        {/* Width label */}
                        <Text
                            text={`${width}px`}
                            x={x0 + width/2 - 20}
                            y={y0 - 24}
                            fontSize={16}
                            fill="#2c3e50"
                        />
                        {/* Depth label */}
                        <Text
                            text={`${depth}px`}
                            x={x0 + width + 8}
                            y={y0 + depth/2 - 8}
                            fontSize={16}
                            fill="#2c3e50"
                        />
                        {/* Height indicator line */}
                        <Line
                            points={[x0 - 30, y0, x0 - 30, y0 + height]}
                            stroke="#2c3e50"
                            strokeWidth={2}
                        />
                        <Text
                            text={`${height}px`}
                            x={x0 - 60}
                            y={y0 + height/2 - 8}
                            fontSize={16}
                            fill="#2c3e50"
                        />
                    </Layer>
                </Stage>
            ) : (
                <Canvas
                    shadows
                    camera={{ position: [0, camY, camZ], fov: 60 }}
                    style={styles.canvas}
                >
                    <ambientLight intensity={0.5}/>
                    <directionalLight
                        castShadow
                        position={[5, 10, 5]}
                        intensity={1}
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                        shadow-camera-far={maxDim3*3}
                        shadow-camera-left={-maxDim3}
                        shadow-camera-right={maxDim3}
                        shadow-camera-top={maxDim3}
                        shadow-camera-bottom={-maxDim3}
                    />
                    <Environment preset="sunset" background={false}/>
                    <RoomBox
                        width={width}
                        depth={depth}
                        height={height}
                        textures={textures}
                        openSide="front"
                        wallTint={wallTint}
                    />
                    <ContactShadows
                        position={[0,0.01,0]}
                        opacity={0.7}
                        width={width/SCALE3D}
                        height={depth/SCALE3D}
                        blur={2}
                        far={maxDim3}
                    />
                    <OrbitControls makeDefault/>
                </Canvas>
            )}

            {/* Back Button */}
            <button style={styles.backCorner} onClick={()=>nav('/dashboard')}>
                ← Dashboard
            </button>
        </div>
    );
}

// Slider + number input
function DimensionControl({ label, value, onChange, min, max, step }) {
    return (
        <div style={styles.controlRow}>
            <span style={styles.controlText}>{label}:</span>
            <input
                type="number"
                value={value}
                min={min} max={max} step={step}
                onChange={e=>onChange(Number(e.target.value)||0)}
                style={styles.numberInput}
            />
            <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                onChange={e=>onChange(Number(e.target.value))}
                style={styles.slider}
            />
        </div>
    );
}

const styles = {
    container: {
        background:'#f0f3f5', width:'100vw', height:'100vh',
        position:'relative', fontFamily:'Segoe UI, sans-serif'
    },
    tabs: {
        display:'flex', position:'absolute', top:0,left:0,right:0,zIndex:2,
        boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
    },
    tab: {
        flex:1, padding:'16px 0', border:'none',
        background:'#d0d7de', color:'#333', fontSize:16,
        cursor:'pointer', transition:'background .2s'
    },
    activeTab:{ background:'#286090', color:'#fff' },
    controls:{
        position:'absolute', top:70, right:20, zIndex:2,
        background:'#fff', padding:24, borderRadius:8,
        boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:300
    },
    controlHeader:{ margin:'0 0 16px', color:'#444' },
    controlRow:{ display:'flex', alignItems:'center', marginBottom:16 },
    controlText:{ flex:'0 0 100px', color:'#555' },
    numberInput:{
        width:60, marginRight:12, padding:'4px 8px',
        border:'1px solid #ccc', borderRadius:4
    },
    slider:{ flex:1 },
    tintGroup:{ display:'flex', alignItems:'center', marginTop:8 },
    tintLabel:{ marginRight:8, color:'#555' },
    colorInput:{ width:32, height:32, border:'none', cursor:'pointer' },
    resetButton:{
        marginLeft:12, padding:'6px 12px',
        background:'#c0392b', color:'#fff',
        border:'none', borderRadius:4, cursor:'pointer'
    },
    fullStage:{ position:'absolute', top:0,left:0, background:'#fff' },
    canvas:{ width:'100%', height:'100%' },
    backCorner:{
        position:'absolute', top:12, left:12, zIndex:3,
        padding:'8px 14px', background:'#286090',
        color:'#fff', border:'none', borderRadius:4,
        cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.2)'
    },
    fallback:{ padding:20, fontFamily:'Segoe UI, sans-serif' },
    fallbackText:{ marginBottom:12, color:'#a94442' },
    backButton:{
        padding:'8px 14px', background:'#286090',
        color:'#fff', border:'none', borderRadius:4,
        cursor:'pointer'
    }
};
