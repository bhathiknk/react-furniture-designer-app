// src/pages/Viewer3D.js
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    useTexture,
    Environment,
    ContactShadows
} from '@react-three/drei';
import { useState } from 'react';
import * as THREE from 'three';

const roomDefinitions = {
    living: {
        default: { width: 6, depth: 5, height: 3 },
        textures: {
            floor: '/textures/wood_floor.jpg',
            wall:  '/textures/paint_wall.jpg'
        }
    },
    kitchen: {
        default: { width: 4, depth: 3, height: 3 },
        textures: {
            floor: '/textures/tile_floor.jpg',
            wall:  '/textures/kitchen_wall_tiled.jpg'
        }
    },
    bedroom: {
        default: { width: 5, depth: 4, height: 3 },
        textures: {
            floor: '/textures/carpet_floor.jpg',
            wall:  '/textures/paint_wall2.jpg'
        }
    },
    office: {
        default: { width: 4, depth: 4, height: 3 },
        textures: {
            floor: '/textures/laminate_floor.jpg',
            wall:  '/textures/paint_wall3.jpg'
        }
    },
    bath: {
        default: { width: 3, depth: 2.5, height: 3 },
        textures: {
            floor: '/textures/bath_floor_tile.jpg',
            wall:  '/textures/bath_wall_tile.jpg'
        }
    },
    dining: {
        default: { width: 5, depth: 4, height: 3 },
        textures: {
            floor: '/textures/wood_floor2.jpg',
            wall:  '/textures/paint_wall4.jpg'
        }
    },
    study: {
        default: { width: 4, depth: 3.5, height: 3 },
        textures: {
            floor: '/textures/laminate_floor2.jpg',
            wall:  '/textures/paint_wall5.jpg'
        }
    }
};

function RoomBox({ width, depth, height, textures, openSide, wallColor, floorColor }) {
    // Load textures
    const [floorMap, wallMap] = useTexture([textures.floor, textures.wall]);

    // Texture repetition
    floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
    floorMap.repeat.set(width / 2, depth / 2);
    wallMap.wrapS = wallMap.wrapT = THREE.RepeatWrapping;
    wallMap.repeat.set(width / 2, height / 2);

    // Wall definitions
    const walls = [
        { name: 'back',  rot: [0, 0, 0],       pos: [0, height / 2, -depth / 2], size: [width, height] },
        { name: 'front', rot: [0, Math.PI, 0], pos: [0, height / 2,  depth / 2], size: [width, height] },
        { name: 'left',  rot: [0, Math.PI / 2, 0], pos: [-width / 2, height / 2, 0], size: [depth, height] },
        { name: 'right', rot: [0, -Math.PI / 2, 0], pos: [width / 2, height / 2, 0], size: [depth, height] }
    ];

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[width, depth]} />
                <meshStandardMaterial
                    {...(floorColor
                            ? { color: floorColor }
                            : { map: floorMap }
                    )}
                />
            </mesh>

            {/* Walls (skip the open front wall) */}
            {walls
                .filter(w => w.name !== openSide)
                .map((w, i) => (
                    <mesh key={i} rotation={w.rot} position={w.pos} castShadow>
                        <planeGeometry args={w.size} />
                        <meshStandardMaterial
                            side={THREE.DoubleSide}
                            {...(wallColor
                                    ? { color: wallColor }
                                    : { map: wallMap }
                            )}
                        />
                    </mesh>
                ))
            }
        </group>
    );
}

export default function Viewer3D() {
    const { roomKey } = useParams();
    const nav = useNavigate();
    const defOriginal = roomDefinitions[roomKey];

    // Hooks must always run first
    const def = defOriginal || roomDefinitions['living'];
    const [width, setWidth]     = useState(def.default.width);
    const [depth, setDepth]     = useState(def.default.depth);
    const [height, setHeight]   = useState(def.default.height);
    const [wallColor, setWallColor]   = useState(''); // empty = use texture
    const [floorColor, setFloorColor] = useState('');

    // Early return for invalid room
    if (!defOriginal) {
        return (
            <div style={{ padding: 20 }}>
                <p>Unknown room type.</p>
                <button onClick={() => nav('/dashboard')}>← Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* Back Button */}
            <button
                onClick={() => nav('/dashboard')}
                style={{
                    position: 'absolute', top: 20, left: 20, zIndex: 1,
                    padding: '8px 12px', border: 'none',
                    borderRadius: '4px', background: '#fff', cursor: 'pointer'
                }}
            >
                ← Dashboard
            </button>

            {/* Controls Panel */}
            <div style={{
                position: 'absolute', top: 20, right: 20, zIndex: 1,
                background: 'rgba(255,255,255,0.9)', padding: '16px',
                borderRadius: '8px', maxWidth: '260px', fontFamily: 'sans-serif'
            }}>
                <h4 style={{ margin: '0 0 8px' }}>Room Settings</h4>

                {/* Dimension Sliders */}
                <label>
                    Width: {width.toFixed(1)} m<br />
                    <input
                        type="range" min="2" max="10" step="0.5"
                        value={width} onChange={e => setWidth(+e.target.value)}
                    />
                </label>
                <br /><br />
                <label>
                    Depth: {depth.toFixed(1)} m<br />
                    <input
                        type="range" min="2" max="10" step="0.5"
                        value={depth} onChange={e => setDepth(+e.target.value)}
                    />
                </label>
                <br /><br />
                <label>
                    Height: {height.toFixed(1)} m<br />
                    <input
                        type="range" min="2" max="6" step="0.5"
                        value={height} onChange={e => setHeight(+e.target.value)}
                    />
                </label>
                <br /><br />

                {/* Wall Color Override (applies to all walls) */}
                <label>
                    Wall Color Override:<br />
                    <input
                        type="color" value={wallColor}
                        onChange={e => setWallColor(e.target.value)}
                    />
                    <button onClick={() => setWallColor('')} style={{ marginLeft: 8 }}>
                        Reset
                    </button>
                </label>
                <br /><br />

                {/* Floor Color Override */}
                <label>
                    Floor Color Override:<br />
                    <input
                        type="color" value={floorColor}
                        onChange={e => setFloorColor(e.target.value)}
                    />
                    <button onClick={() => setFloorColor('')} style={{ marginLeft: 8 }}>
                        Reset
                    </button>
                </label>
            </div>

            {/* 3D Canvas */}
            <Canvas
                shadows
                camera={{ position: [0, height, depth * 1.5], fov: 60 }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight
                    castShadow position={[5, 10, 5]} intensity={1}
                    shadow-mapSize-width={1024} shadow-mapSize-height={1024}
                    shadow-camera-far={50}
                    shadow-camera-left={-10} shadow-camera-right={10}
                    shadow-camera-top={10} shadow-camera-bottom={-10}
                />

                {/* Environment & Shadows */}
                <Environment preset="sunset" background={false} />
                <RoomBox
                    width={width}
                    depth={depth}
                    height={height}
                    textures={def.textures}
                    openSide="front"
                    wallColor={wallColor}
                    floorColor={floorColor}
                />
                <ContactShadows
                    position={[0, 0.01, 0]}
                    opacity={0.7}
                    width={width}
                    height={depth}
                    blur={2}
                    far={1}
                />
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
}
