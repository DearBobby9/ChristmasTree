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
        uColorPhase: 0,
    },
  // Vertex Shader
  /*glsl*/ `
    attribute vec3 treePosition;
    attribute vec3 scatterPosition;
    attribute vec3 color;

    uniform float uMorphProgress;
    uniform float uTime;
    uniform float uColorPhase;

    varying vec3 vColor;
    varying float vFlowingLight;
    varying float vDistFromCenter;

    // Simple noise function for organic movement
    float noise(float x) {
      return fract(sin(x * 12.9898) * 43758.5453);
    }

    // HSL to RGB conversion
    vec3 hsl2rgb(float h, float s, float l) {
      vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
      return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
    }

    void main() {
      // Color breathing - shift hue over time
      vec3 baseColor = color;
      float hueShift = sin(uColorPhase) * 0.08; // Subtle hue shift
      
      // Apply color modification
      vColor = baseColor + vec3(hueShift * 0.5, hueShift * 0.3, -hueShift * 0.2);

      // GPU-based interpolation between scatter and tree positions
      vec3 pos = mix(scatterPosition, treePosition, uMorphProgress);

      // Add floating animation with more organic movement
      float particleId = float(gl_VertexID);
      float floatingOffset = sin(uTime * 0.8 + particleId * 0.01) * 0.06;
      floatingOffset += sin(uTime * 1.3 + particleId * 0.007) * 0.03;
      pos.y += floatingOffset;
      
      // Subtle XZ jitter for force field feel
      float jitterX = sin(uTime * 2.0 + particleId * 0.05) * 0.02 * uMorphProgress;
      float jitterZ = cos(uTime * 2.0 + particleId * 0.05) * 0.02 * uMorphProgress;
      pos.x += jitterX;
      pos.z += jitterZ;

      // Flowing light wave traveling up the tree
      float normalizedY = (treePosition.y + 3.5) / 7.0; // Normalize to 0-1
      vFlowingLight = sin(normalizedY * 6.28 - uTime * 2.0) * 0.5 + 0.5;
      vFlowingLight *= uMorphProgress; // Only show when formed
      
      // Distance from center for Fresnel-like effect
      vDistFromCenter = length(treePosition.xz) / 2.5;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 85.0 / -mvPosition.z; // Slightly larger particles
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  /*glsl*/ `
    varying vec3 vColor;
    varying float vFlowingLight;
    varying float vDistFromCenter;

    void main() {
      // Circular point shape (discard corners)
      vec2 uv = gl_PointCoord - 0.5;
      float dist = length(uv);
      if (dist > 0.5) discard;

      // Fresnel-like edge glow (brighter at edges)
      float fresnel = 1.0 - smoothstep(0.2, 0.5, dist);
      float edgeGlow = smoothstep(0.3, 0.5, dist) * 0.4;
      
      // Combine base color with flowing light and fresnel
      vec3 finalColor = vColor;
      finalColor += vec3(1.0, 0.9, 0.7) * vFlowingLight * 0.3; // Warm flowing light
      finalColor += vec3(1.0, 1.0, 0.95) * edgeGlow; // White edge glow
      
      // Soft edge alpha
      float alpha = 1.0 - smoothstep(0.25, 0.5, dist);
      alpha *= 0.9;
      
      // Boost brightness for bloom
      finalColor *= 1.2;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
)


// Extend R3F to recognize our custom material
extend({ TreeParticleMaterial })

// Store for mutable hand tracking data (avoids React re-renders)
// Store for mutable hand tracking data (avoids React re-renders)
type Listener = (isFormed: boolean) => void
const listeners: Set<Listener> = new Set()

export const handTrackingStore = {
    _isTreeFormed: false,
    rotation: [0, 0] as [number, number],
    manualOverrideUntil: 0,  // Timestamp until which hand tracking should be ignored

    get isTreeFormed() {
        return this._isTreeFormed
    },

    set isTreeFormed(value: boolean) {
        if (this._isTreeFormed !== value) {
            this._isTreeFormed = value
            listeners.forEach(cb => cb(value))
        }
    },

    // Set manual override for a duration (in ms)
    setManualOverride(durationMs: number = 2000) {
        this.manualOverrideUntil = Date.now() + durationMs
    },

    // Check if manual override is active
    isManualOverrideActive() {
        return Date.now() < this.manualOverrideUntil
    },

    subscribe(cb: Listener) {
        listeners.add(cb)
        return () => listeners.delete(cb)
    },

    // Hand tracking lock state
    _isLocked: false,

    get isLocked() {
        return this._isLocked
    },

    toggleLock() {
        this._isLocked = !this._isLocked
        return this._isLocked
    }
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
        const previousProgress = morphProgress.current

        // Enhanced transition with different speeds for form vs scatter
        const isScattering = targetProgress < previousProgress
        const transitionSpeed = isScattering ? 3.5 : 2.5 // Faster scatter, smooth form

        morphProgress.current += (targetProgress - morphProgress.current) * Math.min(delta * transitionSpeed, 1)

        // Add slight "charge" overshoot when transitioning
        let displayProgress = morphProgress.current
        const transitionDelta = Math.abs(targetProgress - previousProgress)
        if (transitionDelta > 0.3) {
            // Brief compression/expansion during fast transitions
            const overshoot = Math.sin(transitionDelta * Math.PI) * 0.05
            displayProgress = Math.max(0, Math.min(1, morphProgress.current + (isScattering ? -overshoot : overshoot)))
        }

        // Update shader uniforms (GPU handles the rest)
        materialRef.current.uniforms.uMorphProgress.value = displayProgress
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
        materialRef.current.uniforms.uColorPhase.value = state.clock.elapsedTime * 0.3 // Slow color breathing

        // Enhanced rotation with momentum during transitions
        const [rx, ry] = handTrackingStore.rotation
        const rotationDamping = isScattering ? 0.15 : 0.08 // More responsive during scatter
        pointsRef.current.rotation.x += (ry / 5 - pointsRef.current.rotation.x) * rotationDamping
        pointsRef.current.rotation.y += (-rx / 5 - pointsRef.current.rotation.y) * rotationDamping

        // Add subtle auto-rotation when scattered
        if (targetProgress === 0 && morphProgress.current < 0.1) {
            pointsRef.current.rotation.y += delta * 0.15
        }
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
