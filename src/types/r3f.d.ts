import * as THREE from 'three'
import { Object3DNode } from '@react-three/fiber'

// Extend JSX intrinsic elements to include our custom shader materials
declare module '@react-three/fiber' {
    interface ThreeElements {
        treeParticleMaterial: Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>
        twinklingStarMaterial: Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>
        orbParticleMaterial: Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>
    }
}

// Image module declarations for Vite
declare module '*.jpg' {
    const src: string
    export default src
}

declare module '*.JPG' {
    const src: string
    export default src
}

declare module '*.jpeg' {
    const src: string
    export default src
}

declare module '*.png' {
    const src: string
    export default src
}

declare module '*.webp' {
    const src: string
    export default src
}
