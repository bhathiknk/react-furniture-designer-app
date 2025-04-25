// src/pages/RoomEditor.js
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    useTexture,
    Environment,
    ContactShadows
} from '@react-three/drei';
import {
    Stage,
    Layer,
    Rect,
    Text,
    Line,
    Arrow,
    Group
} from 'react-konva';
import { useState } from 'react';
import * as THREE from 'three';

import {
    SCALE3D,
    WALL_2D_THICKNESS,
    furnitureModels,
    getIconSize,
    defaultRotations,
    floorOffsets,
    DEFAULT_OFFSET,
    Furniture3D
} from '../components/FurnitureManager';

const roomDefinitions = {
    living:  { default:{ width:600, depth:500, height:300 }, textures:{ floor:'/textures/wood_floor.jpg',       wall:'/textures/paint_wall.jpg' } },
    kitchen: { default:{ width:400, depth:300, height:300 }, textures:{ floor:'/textures/tile_floor.jpg',      wall:'/textures/kitchen_wall_tiled.jpg' } },
    bedroom: { default:{ width:500, depth:400, height:300 }, textures:{ floor:'/textures/carpet_floor.jpg',    wall:'/textures/paint_wall2.jpg' } },
    office:  { default:{ width:400, depth:400, height:300 }, textures:{ floor:'/textures/laminate_floor.jpg',  wall:'/textures/paint_wall3.jpg' } },
    bath:    { default:{ width:300, depth:250, height:300 }, textures:{ floor:'/textures/bath_floor_tile.jpg', wall:'/textures/bath_wall_tile.jpg' } },
    dining:  { default:{ width:500, depth:400, height:300 }, textures:{ floor:'/textures/wood_floor2.jpg',     wall:'/textures/paint_wall4.jpg' } },
    study:   { default:{ width:400, depth:350, height:300 }, textures:{ floor:'/textures/laminate_floor2.jpg', wall:'/textures/paint_wall5.jpg' } }
};

function RoomBox({ width, depth, height, textures, openSide, wallTint }) {
    const [floorMap, wallMap] = useTexture([textures.floor, textures.wall]);

    floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
    floorMap.repeat.set(width/SCALE3D, depth/SCALE3D);
    wallMap.wrapS  = wallMap.wrapT  = THREE.RepeatWrapping;
    wallMap.repeat.set(width/SCALE3D, height/SCALE3D);

    const floorThickness = 0.1;
    const wallThickness  = 0.08;
    const normals = {
        back:  [ 0, 0, -1 ], front: [ 0, 0, 1 ],
        left: [-1, 0,  0 ], right: [ 1, 0, 0 ]
    };

    const walls = [
        { name:'back',  rot:[0,0,0],        pos:[0, height/(2*SCALE3D), -depth/(2*SCALE3D)], size:[width/SCALE3D, height/SCALE3D] },
        { name:'front', rot:[0,Math.PI,0],  pos:[0, height/(2*SCALE3D),  depth/(2*SCALE3D)], size:[width/SCALE3D, height/SCALE3D] },
        { name:'left',  rot:[0,Math.PI/2,0],pos:[-width/(2*SCALE3D), height/(2*SCALE3D), 0],   size:[depth/SCALE3D, height/SCALE3D] },
        { name:'right', rot:[0,-Math.PI/2,0],pos:[ width/(2*SCALE3D), height/(2*SCALE3D),0],   size:[depth/SCALE3D, height/SCALE3D] }
    ];

    return (
        <group>
            <mesh position={[0, floorThickness/2, 0]} receiveShadow castShadow>
                <boxGeometry args={[ width/SCALE3D, floorThickness, depth/SCALE3D ]} />
                <meshStandardMaterial map={floorMap} roughness={0.8} metalness={0.2}/>
            </mesh>

            {walls.filter(w=>w.name!==openSide).map((w,i)=>{
                const [nx,,nz] = normals[w.name];
                const offset = [ w.pos[0]+nx*wallThickness/2, w.pos[1], w.pos[2]+nz*wallThickness/2 ];
                return (
                    <mesh key={i} rotation={w.rot} position={offset} receiveShadow castShadow>
                        <boxGeometry args={[ w.size[0], w.size[1], wallThickness ]}/>
                        <meshStandardMaterial
                            map={wallMap}
                            color={wallTint||'#ffffff'}
                            roughness={0.9}
                            metalness={0.1}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

export default function RoomEditor() {
    const { roomKey } = useParams();
    const nav = useNavigate();
    const defOrig = roomDefinitions[roomKey];
    const { default: def, textures } = defOrig || roomDefinitions['living'];

    const [view,setView]         = useState('2D');
    const [width,setWidth]       = useState(def.width);
    const [depth,setDepth]       = useState(def.depth);
    const [height,setHeight]     = useState(def.height);
    const [wallTint,setWallTint] = useState('');
    const [furniture,setFurniture] = useState([]);
    const [selectedId,setSelected] = useState(null);

    if(!defOrig && view==='2D'){
        return (
            <div style={styles.fallback}>
                <p style={styles.fallbackText}>Unknown room type.</p>
                <button style={styles.backButton} onClick={()=>nav('/dashboard')}>← Back</button>
            </div>
        );
    }

    const vw = window.innerWidth, vh = window.innerHeight;
    const x0 = (vw-width)/2, y0 = (vh-depth)/2;
    const max3= Math.max(width, depth)/SCALE3D;
    const camY= height/SCALE3D*0.6 + max3*0.4;
    const camZ= max3*1.2;

    function addFurniture(type){
        const { iconW, iconH } = getIconSize(type);
        setFurniture(f=>[
            ...f,
            {
                id:Date.now(),
                type,
                x: x0 + width/2,
                y: y0 + depth/2,
                iconW, iconH,
                rotation: defaultRotations[type]||0,
                color: '#555555'
            }
        ]);
        setSelected(null);
    }
    function resizeSel(d){
        setFurniture(fs=>fs.map(i=>
            i.id===selectedId
                ? {...i, iconW:Math.max(10,i.iconW+d), iconH:Math.max(10,i.iconH+d)}
                : i
        ));
    }
    function rotateSel(d){
        setFurniture(fs=>fs.map(i=>
            i.id===selectedId
                ? {...i, rotation:(i.rotation+d+360)%360}
                : i
        ));
    }
    function changeColor(hex){
        setFurniture(fs=>fs.map(i=>
            i.id===selectedId
                ? {...i, color:hex}
                : i
        ));
    }

    return (
        <div style={styles.container}>
            <div style={styles.tabs}>
                {['2D','3D'].map(t=>(
                    <button key={t}
                            onClick={()=>setView(t)}
                            style={{...styles.tab, ...(view===t?styles.activeTab:{})}}>
                        {t} View
                    </button>
                ))}
            </div>

            {view==='2D' && (
                <div style={styles.palette}>
                    {Object.keys(furnitureModels).map(type=>(
                        <button key={type} style={styles.iconBtn} onClick={()=>addFurniture(type)}>
                            {type.replace('_',' ')}
                        </button>
                    ))}
                </div>
            )}

            {view==='2D' && (
                <div style={styles.controls}>
                    <h4 style={styles.controlHeader}>Room Settings</h4>
                    <DimensionControl label="Width(px)"  value={width}  onChange={setWidth}  min={10} max={vw} step={1}/>
                    <DimensionControl label="Depth(px)"  value={depth}  onChange={setDepth}  min={10} max={vh} step={1}/>
                    <DimensionControl label="Height(px)" value={height} onChange={setHeight} min={10} max={vh} step={1}/>
                    <div style={styles.tintGroup}>
                        <label style={styles.tintLabel}>Wall Tint:</label>
                        <input type="color" value={wallTint} onChange={e=>setWallTint(e.target.value)} style={styles.colorInput}/>
                        <button onClick={()=>setWallTint('')} style={styles.resetButton}>Reset</button>
                    </div>
                    {selectedId && (
                        <div style={styles.sizeControls}>
                            <button onClick={()=>resizeSel(+10)}>Increase</button>
                            <button onClick={()=>resizeSel(-10)}>Decrease</button>
                            <button onClick={()=>rotateSel(+15)}>Rotate +15°</button>
                            <button onClick={()=>rotateSel(-15)}>Rotate -15°</button>
                            <div style={{ marginTop:8 }}>
                                <label style={{ marginRight:6 }}>Color:</label>
                                <input
                                    type="color"
                                    value={furniture.find(i=>i.id===selectedId)?.color || '#555555'}
                                    onChange={e=>changeColor(e.target.value)}
                                    style={styles.colorInput}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {view==='2D' ? (
                <Stage width={vw} height={vh} style={styles.fullStage}>
                    <Layer>
                        <Rect x={x0} y={y0} width={width} height={depth}
                              fill="#fafafa" stroke={wallTint||'#2980b9'} strokeWidth={4} cornerRadius={6}/>
                        <Rect x={x0} y={y0} width={width} height={WALL_2D_THICKNESS} fill="#ccc"/>
                        <Rect x={x0} y={y0+depth-WALL_2D_THICKNESS} width={width} height={WALL_2D_THICKNESS} fill="#ccc"/>
                        <Rect x={x0} y={y0} width={WALL_2D_THICKNESS} height={depth} fill="#ccc"/>
                        <Rect x={x0+width-WALL_2D_THICKNESS} y={y0} width={WALL_2D_THICKNESS} height={depth} fill="#ccc"/>

                        {furniture.map(item=>(
                            <Group key={item.id}
                                   x={item.x} y={item.y}
                                   offset={{ x:item.iconW/2, y:item.iconH/2 }}
                                   rotation={item.rotation}
                                   draggable
                                   onClick={()=>setSelected(item.id)}
                                   onDragMove={e=>setFurniture(fs=>
                                       fs.map(f=>f.id===item.id
                                           ? { ...f, x:e.target.x(), y:e.target.y() }
                                           : f
                                       )
                                   )}>
                                <Rect
                                    width={item.iconW}
                                    height={item.iconH}
                                    fill={item.color}
                                    stroke={item.id===selectedId ? '#e74c3c' : null}
                                    strokeWidth={item.id===selectedId ? 4 : 0}
                                />
                                <Arrow
                                    points={[0, item.iconH/2, 0, item.iconH]}
                                    pointerLength={10}
                                    pointerWidth={10}
                                    fill="#e74c3c"
                                    stroke="#e74c3c"
                                />
                            </Group>
                        ))}

                        <Text text={`${width}px`} x={x0+width/2-20} y={y0-24} fontSize={16} fill="#2c3e50"/>
                        <Text text={`${depth}px`} x={x0+width+8} y={y0+depth/2-8} fontSize={16} fill="#2c3e50"/>
                        <Line points={[x0-30,y0, x0-30,y0+height]} stroke="#2c3e50" strokeWidth={2}/>
                        <Text text={`${height}px`} x={x0-60} y={y0+height/2-8} fontSize={16} fill="#2c3e50"/>
                    </Layer>
                </Stage>
            ) : (
                <Canvas shadows camera={{position:[0,camY,camZ],fov:60}} style={styles.canvas}>
                    <ambientLight intensity={0.5}/>
                    <directionalLight castShadow position={[5,10,5]} intensity={1}
                                      shadow-mapSize-width={1024} shadow-mapSize-height={1024}
                                      shadow-camera-far={max3*3}
                                      shadow-camera-left={-max3} shadow-camera-right={max3}
                                      shadow-camera-top={max3} shadow-camera-bottom={-max3}/>
                    <Environment preset="sunset" background={false}/>
                    <RoomBox width={width} depth={depth} height={height}
                             textures={textures} openSide="front" wallTint={wallTint}/>
                    {furniture.map(item=>{
                        const x3 = THREE.MathUtils.clamp((item.x - x0 - width/2)/SCALE3D, -width/(2*SCALE3D), width/(2*SCALE3D));
                        const z3 = THREE.MathUtils.clamp((item.y - y0 - depth/2)/SCALE3D, -depth/(2*SCALE3D), depth/(2*SCALE3D));
                        const yaw = -item.rotation;
                        return (
                            <Furniture3D key={item.id}
                                         modelUrl={furnitureModels[item.type]}
                                         type={item.type}
                                         position={[ x3, floorOffsets[item.type] ?? DEFAULT_OFFSET, z3 ]}
                                         rotation={yaw}
                                         color={item.color}
                            />
                        );
                    })}
                    <ContactShadows position={[0,0.01,0]} opacity={0.7}
                                    width={width/SCALE3D} height={depth/SCALE3D} blur={2} far={max3}/>
                    <OrbitControls makeDefault/>
                </Canvas>
            )}

            <button style={styles.backCorner} onClick={()=>nav('/dashboard')}>← Dashboard</button>
        </div>
    );
}

// DimensionControl unchanged…
function DimensionControl({ label, value, onChange, min, max, step }) {
    return (
        <div style={styles.controlRow}>
            <span style={styles.controlText}>{label}:</span>
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={e => onChange(Number(e.target.value)||0)}
                style={styles.numberInput}
            />
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={styles.slider}
            />
        </div>
    );
}

// styles unchanged…
const styles = {
    container:    { background:'#f0f3f5', width:'100vw', height:'100vh', position:'relative', fontFamily:'Segoe UI, sans-serif' },
    tabs:         { display:'flex', position:'absolute', top:0,left:0,right:0,zIndex:2, boxShadow:'0 2px 4px rgba(0,0,0,0.1)' },
    tab:          { flex:1,padding:'16px 0',border:'none',background:'#d0d7de',color:'#333',fontSize:16,cursor:'pointer',transition:'background .2s' },
    activeTab:    { background:'#286090', color:'#fff' },
    controls:     { position:'absolute', top:70,right:20,zIndex:2, background:'#fff', padding:24, borderRadius:8, boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:300 },
    controlHeader:{ margin:'0 0 16px', color:'#444' },
    controlRow:   { display:'flex',alignItems:'center',marginBottom:16 },
    controlText:  { flex:'0 0 100px', color:'#555' },
    numberInput:  { width:60,marginRight:12,padding:'4px 8px',border:'1px solid #ccc',borderRadius:4 },
    slider:       { flex:1 },
    tintGroup:    { display:'flex',alignItems:'center',marginTop:8 },
    tintLabel:    { marginRight:8, color:'#555' },
    colorInput:   { width:32,height:32,border:'none',cursor:'pointer' },
    resetButton:  { marginLeft:12,padding:'6px 12px',background:'#c0392b',color:'#fff',border:'none',borderRadius:4,cursor:'pointer' },
    sizeControls: { marginTop:12,textAlign:'center',display:'flex',gap:8,justifyContent:'space-between' },
    palette:      { position:'absolute',top:70,left:20,zIndex:2,background:'#fff',padding:12,borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,0.1)' },
    iconBtn:      { display:'block',marginBottom:8,padding:'6px 12px',background:'#2980b9',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',width:'100%' },
    fullStage:    { position:'absolute',top:0,left:0,background:'#fff' },
    canvas:       { width:'100%',height:'100%' },
    backCorner:   { position:'absolute',top:12,left:12,zIndex:3,padding:'8px 14px',background:'#286090',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',boxShadow:'0 2px 6px rgba(0,0,0,0.2)' },
    fallback:     { padding:20,fontFamily:'Segoe UI, sans-serif' },
    fallbackText: { marginBottom:12,color:'#a94442' },
    backButton:   { padding:'8px 14px',background:'#286090',color:'#fff',border:'none',borderRadius:4,cursor:'pointer' }
};
