import React from 'react';
import { Stage, Layer, Rect, Text, Line, Arrow, Group } from 'react-konva';
import { WALL_2D_THICKNESS, furnitureModels } from './FurnitureManager';

export default function Room2DView({
                                       width, depth, height, x0, y0,
                                       setWidth, setDepth, setHeight,
                                       furniture, selectedId, setFurniture, setSelected,
                                       addFurniture, resizeSel, rotateSel, changeColor, deleteSel,
                                       wallTint, setWallTint,
                                       onSave,      // callback for new designs
                                       onUpdate,    // callback for editing existing
                                       isEditing    // boolean: true when editing an existing design
                                   }) {
    return (
        <>
            {/* Palette */}
            <div style={styles.palette}>
                {Object.keys(furnitureModels).map(type => (
                    <button
                        key={type}
                        style={styles.iconBtn}
                        onClick={() => addFurniture(type)}
                    >
                        {type.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div style={styles.controls}>
                <h3 style={styles.controlHeader}>🛠 Room & Furniture Settings</h3>

                {/* Room Size */}
                <div style={styles.section}>
                    <h4 style={styles.sectionHeader}>Room Size</h4>
                    {[
                        { label: 'Width', value: width, setter: setWidth, max: window.innerWidth - 100 },
                        { label: 'Depth', value: depth, setter: setDepth, max: window.innerHeight - 100 },
                        { label: 'Height', value: height, setter: setHeight, max: 1000 }
                    ].map(({ label, value, setter, max }) => (
                        <div key={label} style={styles.dimRow}>
                            <label style={styles.dimLabel}>{label} (px):</label>
                            <input
                                type="number"
                                min={10} max={max}
                                value={value}
                                onChange={e => setter(Number(e.target.value) || 10)}
                                style={styles.dimInput}
                            />
                            <input
                                type="range"
                                min={10} max={max}
                                value={value}
                                onChange={e => setter(Number(e.target.value))}
                                style={styles.dimSlider}
                            />
                        </div>
                    ))}
                </div>

                {/* Wall Tint */}
                <div style={styles.section}>
                    <h4 style={styles.sectionHeader}>Wall Tint</h4>
                    <input
                        type="color"
                        value={wallTint}
                        onChange={e => setWallTint(e.target.value)}
                        style={styles.colorInputLarge}
                    />
                    <button onClick={() => setWallTint('')} style={styles.clearBtn}>
                        Reset
                    </button>
                </div>

                {/* Furniture Edit */}
                <div style={styles.section}>
                    <h4 style={styles.sectionHeader}>Furniture Edit</h4>
                    <div style={styles.transformGrid}>
                        <button style={styles.actionBtn} onClick={() => resizeSel(+10)}>➕ Size</button>
                        <button style={styles.actionBtn} onClick={() => resizeSel(-10)}>➖ Size</button>
                        <button style={styles.actionBtn} onClick={() => rotateSel(+15)}>⟳ +15°</button>
                        <button style={styles.actionBtn} onClick={() => rotateSel(-15)}>⟲ -15°</button>
                        <div style={styles.colorPickerRow}>
                            <label style={styles.dimLabel}>Color:</label>
                            <input
                                type="color"
                                value={furniture.find(i => i.id === selectedId)?.color || '#777777'}
                                onChange={e => changeColor(e.target.value)}
                                style={styles.colorInputLarge}
                            />
                        </div>
                        <button style={styles.deleteBtn} onClick={deleteSel}>🗑️ Delete</button>
                    </div>
                </div>

                {/* Save or Update */}
                <div style={styles.section}>
                    {isEditing ? (
                        <button style={styles.updateBtn} onClick={onUpdate}>
                            🔄 Update Design
                        </button>
                    ) : (
                        <button style={styles.saveBtn} onClick={onSave}>
                            💾 Save Design
                        </button>
                    )}
                </div>
            </div>

            {/* 2D Canvas */}
            <Stage width={window.innerWidth} height={window.innerHeight} style={styles.stage}>
                <Layer>
                    {/* Floor */}
                    <Rect
                        x={x0} y={y0}
                        width={width} height={depth}
                        fill="#f3f7fa"
                        stroke={wallTint || '#336699'}
                        strokeWidth={4}
                        cornerRadius={10}
                    />

                    {/* Walls */}
                    <Rect x={x0} y={y0} width={width} height={WALL_2D_THICKNESS} fill="#b0b0b0" />
                    <Rect x={x0} y={y0 + depth - WALL_2D_THICKNESS}
                          width={width} height={WALL_2D_THICKNESS} fill="#b0b0b0" />
                    <Rect x={x0} y={y0} width={WALL_2D_THICKNESS} height={depth} fill="#b0b0b0" />
                    <Rect x={x0 + width - WALL_2D_THICKNESS} y={y0}
                          width={WALL_2D_THICKNESS} height={depth} fill="#b0b0b0" />

                    {/* Furniture */}
                    {furniture.map(item => (
                        <Group
                            key={item.id}
                            x={item.x} y={item.y}
                            offset={{ x: item.iconW / 2, y: item.iconH / 2 }}
                            rotation={item.rotation}
                            draggable
                            onClick={() => setSelected(item.id)}
                            onDragMove={e => setFurniture(fs =>
                                fs.map(f =>
                                    f.id === item.id
                                        ? { ...f, x: e.target.x(), y: e.target.y() }
                                        : f
                                )
                            )}
                        >
                            <Rect
                                width={item.iconW} height={item.iconH}
                                fill={item.color ?? '#cccccc'}
                                stroke={item.id === selectedId ? '#ff4444' : '#333333'}
                                strokeWidth={item.id === selectedId ? 4 : 2}
                                cornerRadius={6}
                            />
                            <Arrow
                                points={[0, item.iconH/2, 0, item.iconH]}
                                pointerLength={8} pointerWidth={8}
                                fill="#ff4444" stroke="#ff4444"
                            />
                        </Group>
                    ))}

                    {/* Measurements */}
                    <Text text={`${width}px`} x={x0 + width/2 - 25} y={y0 - 30} fontSize={14} fill="#444"/>
                    <Text text={`${depth}px`} x={x0 + width + 12} y={y0 + depth/2 - 8} fontSize={14} fill="#444"/>
                    <Line points={[x0 - 35, y0, x0 - 35, y0 + height]} stroke="#444" strokeWidth={2}/>
                    <Text text={`${height}px`} x={x0 - 70} y={y0 + height/2 - 8} fontSize={14} fill="#444"/>
                </Layer>
            </Stage>
        </>
    );
}

const styles = {
    stage:           { position:'absolute', top:0, left:0, background:'#eef3f8' },
    palette:         {
        position:'absolute', top:90, left:20,
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:10,
        background:'#fff', padding:14, borderRadius:10,
        boxShadow:'0 4px 12px rgba(0,0,0,0.15)', zIndex:10
    },
    iconBtn:         {
        padding:'8px 0', background:'linear-gradient(135deg,#4a90e2,#357abd)',
        color:'#fff', border:'none', borderRadius:6,
        cursor:'pointer', fontWeight:600, transition:'opacity .2s'
    },
    controls:        {
        position:'absolute', top:90, right:20,
        width:300, background:'#fff', padding:20,
        borderRadius:10, boxShadow:'0 4px 12px rgba(0,0,0,0.15)', zIndex:10
    },
    controlHeader:   { margin:0, marginBottom:16, color:'#357abd', fontSize:18 },
    section:         { marginBottom:18 },
    sectionHeader:   { margin:0, marginBottom:8, color:'#4a4a4a', fontSize:16 },
    dimRow:          { display:'flex', alignItems:'center', marginBottom:8 },
    dimLabel:        { width:80, fontSize:14, color:'#555' },
    dimInput:        {
        width:60, padding:4, marginRight:8, fontSize:14,
        border:'1px solid #ccc', borderRadius:4
    },
    dimSlider:       { flex:1, cursor:'pointer' },
    colorInputLarge: {
        width:32, height:32, border:'1px solid #ccc',
        borderRadius:4, cursor:'pointer'
    },
    clearBtn:        {
        marginLeft:8, padding:'4px 8px', background:'#e74c3c',
        color:'#fff', border:'none', borderRadius:4, cursor:'pointer'
    },
    transformGrid:   {
        display:'grid', gridTemplateColumns:'repeat(2,1fr)',
        gap:10, marginTop:10
    },
    actionBtn:       {
        padding:'8px 0',
        background:'linear-gradient(135deg,#7ed321,#6abf18)',
        color:'#fff', border:'none', borderRadius:6,
        fontSize:14, fontWeight:600, cursor:'pointer'
    },
    colorPickerRow:  { gridColumn:'span 2', display:'flex', alignItems:'center', marginTop:8 },
    deleteBtn:       {
        gridColumn:'span 2', padding:'8px 0',
        background:'#e74c3c', color:'#fff',
        border:'none', borderRadius:6,
        cursor:'pointer', fontSize:14, fontWeight:600
    },
    saveBtn:         {
        width:'100%', padding:'10px 0',
        background:'linear-gradient(135deg,#4caf50,#388e3c)',
        color:'#fff', border:'none', borderRadius:6,
        cursor:'pointer', fontSize:16, fontWeight:600
    },
    updateBtn:       {
        width:'100%', padding:'10px 0',
        background:'linear-gradient(135deg,#2196f3,#1976d2)',
        color:'#fff', border:'none', borderRadius:6,
        cursor:'pointer', fontSize:16, fontWeight:600
    }
};
