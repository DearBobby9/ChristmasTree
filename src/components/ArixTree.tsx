import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

const COUNT = 6000
const SCATTER_RADIUS = 8
const TREE_HEIGHT = 7
const TREE_BASE_RADIUS = 2.5

// Custom Shader Material for GPU-based interpolation
const TreeParticleMaterial = shaderMaterial(
    {
        uMorphProgress: 0,
        uTime: 0,
    },
  // Vertex Shader
  /*glsl*/ `
    attribute vec3 treePosition;
    attribute vec3 scatterPosition;
    attribute vec3 color;

    uniform float uMorphProgress;
    uniform float uTime;

    varying vec3 vColor;

    void main() {
      vColor = color;

      // GPU-based interpolation between scatter and tree positions
      vec3 pos = mix(scatterPosition, treePosition, uMorphProgress);

      // Add floating animation (subtle sine wave based on vertex index)
      float floatingOffset = sin(uTime + float(gl_VertexID) * 0.01) * 0.05;
      pos.y += floatingOffset;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 80.0 / -mvPosition.z; // Size attenuation
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  /*glsl*/ `
    varying vec3 vColor;

    void main() {
      // Circular point shape (discard corners)
      vec2 uv = gl_PointCoord - 0.5;
      if (length(uv) > 0.5) discard;

      // Soft edge
      float alpha = 1.0 - smoothstep(0.3, 0.5, length(uv));
      
      gl_FragColor = vec4(vColor, alpha * 0.85);
    }
  `
)

// Extend R3F to recognize our custom material
extend({ TreeParticleMaterial })

// Store for mutable hand tracking data (avoids React re-renders)
export const handTrackingStore = {
    isTreeFormed: false,
    rotation: [0, 0] as [number, number],
}

export function ArixTree() {
    const pointsRef = useRef<THREE.Points>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    // Animation progress (mutable ref, not React state)
    const morphProgress = useRef(0)

    // Generate all position data once
    const { treePositions, scatterPositions, colors, initialPositions } = useMemo(() => {
        const tPos = new Float32Array(COUNT * 3)
        const sPos = new Float32Array(COUNT * 3)
        const cols = new Float32Array(COUNT * 3)
        const initPos = new Float32Array(COUNT * 3)
        const colorObj = new THREE.Color()

        for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3

            // Scatter positions (sphere)
            const r = SCATTER_RADIUS * Math.cbrt(Math.random())
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            sPos[i3] = r * Math.sin(phi) * Math.cos(theta)
            sPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            sPos[i3 + 2] = r * Math.cos(phi)

            // Tree positions (cone with spiral)
            const normalizedH = Math.random()
            const y = (normalizedH - 0.5) * TREE_HEIGHT
            const currentRadius = TREE_BASE_RADIUS * (1 - normalizedH)
            const radius = currentRadius * Math.sqrt(Math.random())
            const angle = Math.random() * Math.PI * 2
            const spiral = normalizedH * 10
            tPos[i3] = radius * Math.cos(angle + spiral)
            tPos[i3 + 1] = y
            tPos[i3 + 2] = radius * Math.sin(angle + spiral)

            // Initial positions (start scattered)
            initPos[i3] = sPos[i3]
            initPos[i3 + 1] = sPos[i3 + 1]
            initPos[i3 + 2] = sPos[i3 + 2]

            // Colors (Emerald 60%, Gold 25%, Red 10%, Silver 5%)
            const rand = Math.random()
            if (rand < 0.6) {
                colorObj.setHSL(0.4, 0.8, 0.1 + Math.random() * 0.4)
            } else if (rand < 0.85) {
                colorObj.setHSL(0.12, 1.0, 0.5 + Math.random() * 0.3)
            } else if (rand < 0.95) {
                colorObj.setHSL(0.97, 0.9, 0.4 + Math.random() * 0.2)
            } else {
                colorObj.setHSL(0.6, 0.0, 0.9 + Math.random() * 0.1)
            }
            colorObj.toArray(cols, i3)
        }

        return { treePositions: tPos, scatterPositions: sPos, colors: cols, initialPositions: initPos }
    }, [])

    useFrame((state, delta) => {
        if (!pointsRef.current || !materialRef.current) return

        // Read from mutable store (NOT React state)
        const targetProgress = handTrackingStore.isTreeFormed ? 1 : 0

        // Smooth damping (eased transition)
        morphProgress.current += (targetProgress - morphProgress.current) * Math.min(delta * 2, 1)

        // Update shader uniforms (GPU handles the rest)
        materialRef.current.uniforms.uMorphProgress.value = morphProgress.current
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime

        // Smooth rotation from hand tracking
        const [rx, ry] = handTrackingStore.rotation
        pointsRef.current.rotation.x += (ry / 5 - pointsRef.current.rotation.x) * 0.1
        pointsRef.current.rotation.y += (-rx / 5 - pointsRef.current.rotation.y) * 0.1
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={COUNT} args={[initialPositions, 3]} />
                <bufferAttribute attach="attributes-treePosition" count={COUNT} args={[treePositions, 3]} />
                <bufferAttribute attach="attributes-scatterPosition" count={COUNT} args={[scatterPositions, 3]} />
                <bufferAttribute attach="attributes-color" count={COUNT} args={[colors, 3]} />
            </bufferGeometry>
            <treeParticleMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}
