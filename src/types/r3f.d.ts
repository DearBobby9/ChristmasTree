import * as THREE from 'three'
import { Object3DNode } from '@react-three/fiber'

// Extend JSX intrinsic elements to include our custom shader material
declare module '@react-three/fiber' {
    interface ThreeElements {
        treeParticleMaterial: Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>
    }
}
