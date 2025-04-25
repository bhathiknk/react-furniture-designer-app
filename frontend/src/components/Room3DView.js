import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

import { SCALE3D, floorOffsets, DEFAULT_OFFSET, Furniture3D } from './FurnitureManager';

export default function Room3DView({
                                       width, depth, height, x0, y0,
                                       furniture, furnitureModels, textures, wallTint    // ← accept wallTint
                                   }) {
    const max3 = Math.max(width, depth) / SCALE3D;
    const camY = (height / SCALE3D) * 0.6 + max3 * 0.4;
    const camZ = max3 * 1.2;

    const to3D = (coord, dim, offset) =>
        THREE.MathUtils.clamp((coord - offset - dim / 2) / SCALE3D, -dim / (2 * SCALE3D), dim / (2 * SCALE3D));

    return (
        <Canvas shadows camera={{ position: [0, camY, camZ], fov: 60 }} style={{ width: '100%', height: '100%' }}>
            <ambientLight intensity={0.5} />
            <directionalLight
                castShadow
                position={[5, 10, 5]}
                intensity={1}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={max3 * 3}
                shadow-camera-left={-max3}
                shadow-camera-right={max3}
                shadow-camera-top={max3}
                shadow-camera-bottom={-max3}
            />
            <Environment preset="sunset" background={false} />

            {/* floor + walls */}
            <RoomBox
                width={width}
                depth={depth}
                height={height}
                textures={textures}
                openSide="front"
                wallTint={wallTint}    // ← use the user-selected tint
            />

            {/* furniture */}
            {furniture.map(item => {
                const x3 = to3D(item.x, width, x0);
                const z3 = to3D(item.y, depth, y0);
                const yaw = -item.rotation;
                return (
                    <Furniture3D
                        key={item.id}
                        modelUrl={furnitureModels[item.type]}
                        type={item.type}
                        position={[x3, floorOffsets[item.type] ?? DEFAULT_OFFSET, z3]}
                        rotation={yaw}
                        color={item.color}
                        size={item.iconW}  // unchanged
                    />
                );
            })}

            <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.7}
                width={width / SCALE3D}
                height={depth / SCALE3D}
                blur={2}
                far={max3}
            />
            <OrbitControls makeDefault />
        </Canvas>
    );
}

function RoomBox({ width, depth, height, textures, openSide, wallTint }) {
    const [floorMap, wallMap] = useTexture([textures.floor, textures.wall]);

    floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
    floorMap.repeat.set(width / SCALE3D, depth / SCALE3D);
    wallMap.wrapS = wallMap.wrapT = THREE.RepeatWrapping;
    wallMap.repeat.set(width / SCALE3D, height / SCALE3D);

    const floorThickness = 0.1, wallThickness = 0.08;
    const normals = { back: [0, 0, -1], front: [0, 0, 1], left: [-1, 0, 0], right: [1, 0, 0] };
    const walls = [
        { name: 'back',  rot: [0, 0, 0],        pos: [0, height / (2 * SCALE3D), -depth / (2 * SCALE3D)], size: [width / SCALE3D, height / SCALE3D] },
        { name: 'front', rot: [0, Math.PI, 0],  pos: [0, height / (2 * SCALE3D),  depth / (2 * SCALE3D)], size: [width / SCALE3D, height / SCALE3D] },
        { name: 'left',  rot: [0, Math.PI/2, 0],pos: [-width / (2 * SCALE3D), height / (2 * SCALE3D), 0],       size: [depth / SCALE3D, height / SCALE3D] },
        { name: 'right', rot: [0, -Math.PI/2, 0],pos: [ width / (2 * SCALE3D), height / (2 * SCALE3D), 0],       size: [depth / SCALE3D, height / SCALE3D] }
    ];

    return (
        <group>
            <mesh position={[0, floorThickness/2, 0]} receiveShadow>
                <boxGeometry args={[width / SCALE3D, floorThickness, depth / SCALE3D]} />
                <meshStandardMaterial map={floorMap} roughness={0.8} metalness={0.2} />
            </mesh>
            {walls.filter(w => w.name !== openSide).map((w,i) => {
                const [nx,,nz] = normals[w.name];
                const offset = [w.pos[0] + nx * wallThickness/2, w.pos[1], w.pos[2] + nz * wallThickness/2];
                return (
                    <mesh key={i} rotation={w.rot} position={offset} receiveShadow castShadow>
                        <boxGeometry args={[w.size[0], w.size[1], wallThickness]} />
                        <meshStandardMaterial
                            map={wallMap}
                            color={wallTint || '#ffffff'}  // apply tint, fallback to white
                            roughness={0.9}
                            metalness={0.1}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}
