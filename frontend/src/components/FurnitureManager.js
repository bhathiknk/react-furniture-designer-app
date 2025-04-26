// src/components/FurnitureManager.js
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import React from 'react';

// 2D px → 1 unit in 3D
export const SCALE3D = 100;
// thickness of 2D wall border in pixels
export const WALL_2D_THICKNESS = 10;

// per-model 3D scale factors
export const furnitureScales = {
    chair:            0.003,
    sofa:             0.0018,
    bed:              1,
    table:            0.09,
    lamp:             0.009,
    wardrobe:         0.6,
    bookshelf:        0.006,
    coffee_table:     0.006,
    desk:             1,
    dining_chair:     0.5,
    kitchen_cabinet:  0.02       // ← new
};

// per-model footprint dimensions in meters (width, depth)
export const modelFootprints = {
    chair:            [0.5, 0.5],
    sofa:             [2.0, 0.8],
    bed:              [2.0, 1.6],
    table:            [1.0, 1.0],
    lamp:             [0.2, 0.2],
    wardrobe:         [1.2, 0.6],
    bookshelf:        [1.0, 0.3],
    coffee_table:     [1.2, 0.6],
    desk:             [1.6, 0.8],
    dining_chair:     [0.5, 0.5],
    kitchen_cabinet:  [1.5, 0.6] // ← new
};

// convert footprint (m) → 2D icon size (px)
export function getIconSize(type) {
    const [w, d] = modelFootprints[type] || [0.5, 0.5];
    return { iconW: w * SCALE3D, iconH: d * SCALE3D };
}

// GLB model URLs under public/models/furniture/
export const furnitureModels = {
    chair:            '/models/furniture/chair.glb',
    sofa:             '/models/furniture/sofa.glb',
    bed:              '/models/furniture/bed.glb',
    table:            '/models/furniture/table.glb',
    lamp:             '/models/furniture/lamp.glb',
    wardrobe:         '/models/furniture/wardrobe.glb',
    bookshelf:        '/models/furniture/bookshelf.glb',
    coffee_table:     '/models/furniture/coffee_table.glb',
    desk:             '/models/furniture/desk.glb',
    dining_chair:     '/models/furniture/dining_chair.glb',
    kitchen_cabinet:  '/models/furniture/kitchen_cabinet.glb' // ← new
};

// default “front” rotations
export const defaultRotations = {
    chair:            0,
    sofa:             0,
    bed:              0,
    table:            0,
    lamp:             0,
    wardrobe:         180,
    bookshelf:        0,
    coffee_table:     0,
    desk:             0,
    dining_chair:     0,
    kitchen_cabinet:  0        // ← new
};

// per-type 3D floor offsets
export const floorOffsets = {
    chair:            0.01,
    sofa:             0.02,
    bed:              0.01,
    table:            0.01,
    lamp:             1.9,
    wardrobe:         0.2,
    bookshelf:        0.1,
    coffee_table:     0.1,
    desk:             0.01,
    dining_chair:     0.5,
    kitchen_cabinet:  0.1      // ← new
};

export const DEFAULT_OFFSET = 0.01;

/**
 * 3D furniture component.
 * Accepts an optional color prop (hex string) to recolor the entire model.
 */
export function Furniture3D({ modelUrl, type, position, rotation, color, size }) {
    const { scene } = useGLTF(modelUrl);
    const obj = React.useMemo(() => {
        const cloned = scene.clone();

        // base 3D scale from static table
        const baseScale = furnitureScales[type] ?? 0.003;

        // if a size (px) is passed in, re-scale proportionally
        let s = baseScale;
        if (size != null) {
            const defaultIconPx = getIconSize(type).iconW;
            s = baseScale * (size / defaultIconPx);
        }

        cloned.scale.set(s, s, s);
        cloned.rotation.y = THREE.MathUtils.degToRad(rotation);

        if (color) {
            cloned.traverse(child => {
                if (child.isMesh && child.material) {
                    const mat = child.material.clone();
                    mat.color = new THREE.Color(color);
                    child.material = mat;
                }
            });
        }

        return cloned;
    }, [scene, type, rotation, color, size]);

    return <primitive object={obj} position={position} />;
}
