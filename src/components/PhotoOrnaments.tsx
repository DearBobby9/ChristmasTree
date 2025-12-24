import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial, Html, useCursor, useTexture } from '@react-three/drei'
import { handTrackingStore } from './ArixTree'

// Import photo assets
import photo1 from '../assets/photos/1.JPG'
import photo2 from '../assets/photos/2.JPG'
import photo3 from '../assets/photos/3.png'
import photo4 from '../assets/photos/4.jpg'
import photo5 from '../assets/photos/5.jpg'
import photo6 from '../assets/photos/6.jpg'
import photo7 from '../assets/photos/7.jpg'
import photo8 from '../assets/photos/8.jpg'

const PARTICLES_PER_ORB = 400

// Enhanced shader material for orb particles with luxurious glow
const OrbParticleMaterial = shaderMaterial(
    {
        uMorphProgress: 0,
        uTime: 0,
        uColor: new THREE.Color('#ff6b6b'),
    },
    // Vertex Shader
    /*glsl*/ `
        attribute vec3 spherePosition;
        attribute vec3 scatterPosition;

        uniform float uMorphProgress;
        uniform float uTime;

        varying float vAlpha;
        varying float vGlowIntensity;

        void main() {
            // Interpolate between sphere and scattered positions
            vec3 pos = mix(scatterPosition, spherePosition, uMorphProgress);

            // Pulsing animation for formed state
            float pulsePhase = uTime * 3.0 + float(gl_VertexID) * 0.05;
            float pulse = 1.0 + sin(pulsePhase) * 0.08 * uMorphProgress;
            pos *= pulse;

            // Add floating animation
            float floatOffset = sin(uTime * 1.5 + float(gl_VertexID) * 0.08) * 0.04;
            pos.y += floatOffset;

            // Orbit around center when scattered
            if (uMorphProgress < 0.5) {
                float angle = uTime * 0.8 + float(gl_VertexID) * 0.015;
                float orbitRadius = 0.15 * (1.0 - uMorphProgress * 2.0);
                pos.x += cos(angle) * orbitRadius;
                pos.z += sin(angle) * orbitRadius;
            }

            // Alpha and glow based on state
            vAlpha = 0.7 + 0.3 * uMorphProgress;
            vGlowIntensity = 0.8 + 0.5 * uMorphProgress; // Brighter when formed

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            // Larger particles when formed for more solid orb look
            gl_PointSize = (50.0 + 35.0 * uMorphProgress) / -mvPosition.z;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    // Fragment Shader with enhanced glow
    /*glsl*/ `
        uniform vec3 uColor;
        uniform float uMorphProgress;
        varying float vAlpha;
        varying float vGlowIntensity;

        void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float dist = length(uv);
            if (dist > 0.5) discard;

            // Soft radial gradient with bright core
            float core = 1.0 - smoothstep(0.0, 0.2, dist);
            float glow = 1.0 - smoothstep(0.0, 0.5, dist);
            
            // Color with white-hot core
            vec3 coreColor = vec3(1.0, 1.0, 0.95);
            vec3 glowColor = uColor * 1.4;
            vec3 finalColor = mix(glowColor, coreColor, core * 0.6);
            finalColor *= vGlowIntensity;

            gl_FragColor = vec4(finalColor, glow * vAlpha);
        }
    `
)

extend({ OrbParticleMaterial })

interface OrbData {
    id: number
    orbitRadius: number
    orbitHeight: number
    orbitPhase: number  // Starting angle (radians)
    orbitSpeed: number  // Radians per second
    color: string
    photoUrl: string | null
}

// 8 photo orbs orbiting at different heights with 45° spacing
// Heights evenly distributed from 2.4 to -2.4 to prevent overlap
export const orbs: OrbData[] = [
    { id: 1, orbitRadius: 2.2, orbitHeight: 2.4, orbitPhase: 0, orbitSpeed: 0.25, color: '#ff6b9d', photoUrl: photo1 },
    { id: 2, orbitRadius: 2.0, orbitHeight: 1.7, orbitPhase: Math.PI / 4, orbitSpeed: 0.22, color: '#ffd93d', photoUrl: photo2 },
    { id: 3, orbitRadius: 2.3, orbitHeight: 1.0, orbitPhase: Math.PI / 2, orbitSpeed: 0.28, color: '#6bcbff', photoUrl: photo3 },
    { id: 4, orbitRadius: 2.1, orbitHeight: 0.3, orbitPhase: Math.PI * 3 / 4, orbitSpeed: 0.24, color: '#a78bfa', photoUrl: photo4 },
    { id: 5, orbitRadius: 2.2, orbitHeight: -0.4, orbitPhase: Math.PI, orbitSpeed: 0.26, color: '#ff9f43', photoUrl: photo5 },
    { id: 6, orbitRadius: 2.0, orbitHeight: -1.1, orbitPhase: Math.PI * 5 / 4, orbitSpeed: 0.23, color: '#34e89e', photoUrl: photo6 },
    { id: 7, orbitRadius: 2.3, orbitHeight: -1.8, orbitPhase: Math.PI * 3 / 2, orbitSpeed: 0.27, color: '#ee5a5a', photoUrl: photo7 },
    { id: 8, orbitRadius: 2.1, orbitHeight: -2.5, orbitPhase: Math.PI * 7 / 4, orbitSpeed: 0.21, color: '#54a0ff', photoUrl: photo8 },
]

// Store for photo focus state
export const photoFocusStore = {
    focusedPhotoId: null as number | null,
    photoPositions: {} as Record<number, THREE.Vector3>,
    photoNormals: {} as Record<number, THREE.Vector3>,
    setFocusedPhoto: (id: number | null) => {
        photoFocusStore.focusedPhotoId = id
    },
    updatePosition: (id: number, position: THREE.Vector3) => {
        photoFocusStore.photoPositions[id] = position.clone()
    },
    updateNormal: (id: number, normal: THREE.Vector3) => {
        photoFocusStore.photoNormals[id] = normal.clone()
    },
}

// Threshold for photo visibility (photos only show when morphProgress < this value)
const PHOTO_SHOW_THRESHOLD = 0.6  // Increased from 0.35 for easier interaction
const PHOTO_FADE_START = 0.6

interface PhotoOrbProps {
    data: OrbData
    onSelect: (id: number) => void
}

function PhotoOrb({ data, onSelect }: PhotoOrbProps) {
    const groupRef = useRef<THREE.Group>(null)
    const pointsRef = useRef<THREE.Points>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const photoRef = useRef<THREE.Mesh>(null)
    const bgRef = useRef<THREE.Mesh>(null)
    const frameRef = useRef<THREE.Mesh>(null)
    const morphProgress = useRef(1)
    const outwardRef = useRef(new THREE.Vector3())
    const lookAtRef = useRef(new THREE.Vector3())
    const [hovered, setHovered] = useState(false)
    useCursor(hovered && morphProgress.current < PHOTO_SHOW_THRESHOLD)

    // Load photo texture
    const texture = data.photoUrl ? useTexture(data.photoUrl) : null

    // Calculate aspect ratio and dimensions
    const MAX_WIDTH = 1.2
    const MAX_HEIGHT = 0.9

    let photoWidth = MAX_WIDTH
    let photoHeight = MAX_HEIGHT

    if (texture?.image) {
        const img = texture.image as HTMLImageElement
        const aspect = img.width / img.height
        // Try fitting by width
        photoHeight = MAX_WIDTH / aspect
        if (photoHeight > MAX_HEIGHT) {
            // Fit by height
            photoHeight = MAX_HEIGHT
            photoWidth = photoHeight * aspect
        }
    }

    // Generate particle positions
    const { spherePositions, scatterPositions } = useMemo(() => {
        const spherePos = new Float32Array(PARTICLES_PER_ORB * 3)
        const scatterPos = new Float32Array(PARTICLES_PER_ORB * 3)

        for (let i = 0; i < PARTICLES_PER_ORB; i++) {
            const i3 = i * 3

            // Sphere positions (tight ball, radius ~0.28)
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 0.22 + Math.random() * 0.1
            spherePos[i3] = r * Math.sin(phi) * Math.cos(theta)
            spherePos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            spherePos[i3 + 2] = r * Math.cos(phi)

            // Scatter positions (ring/halo around photo)
            const scatterAngle = Math.random() * Math.PI * 2
            const scatterR = 0.5 + Math.random() * 0.6
            const scatterY = (Math.random() - 0.5) * 0.4
            scatterPos[i3] = scatterR * Math.cos(scatterAngle)
            scatterPos[i3 + 1] = scatterY
            scatterPos[i3 + 2] = scatterR * Math.sin(scatterAngle) * 0.3 // Flatter in Z
        }

        return { spherePositions: spherePos, scatterPositions: scatterPos }
    }, [])

    useFrame((state, delta) => {
        if (!materialRef.current || !groupRef.current) return

        // Sync with tree state
        const targetProgress = handTrackingStore.isTreeFormed ? 1 : 0
        morphProgress.current += (targetProgress - morphProgress.current) * Math.min(delta * 2.5, 1)

        // Update particle shader
        materialRef.current.uniforms.uMorphProgress.value = morphProgress.current
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime

        // ORBITAL ANIMATION
        const time = state.clock.elapsedTime
        const angle = time * data.orbitSpeed + data.orbitPhase

        // When formed: orbit around tree
        // When scattered: fly outward
        const orbitFactor = morphProgress.current
        const scatterFactor = 1 - morphProgress.current

        // Orbit position
        const orbitX = Math.cos(angle) * data.orbitRadius
        const orbitZ = Math.sin(angle) * data.orbitRadius
        const orbitY = data.orbitHeight + Math.sin(time * 0.8 + data.id * 2) * 0.15

        // Scatter position (fly outward from orbit position)
        const scatterRadius = data.orbitRadius + scatterFactor * 3
        const scatterX = Math.cos(angle) * scatterRadius
        const scatterZ = Math.sin(angle) * scatterRadius
        const scatterY = data.orbitHeight * 0.5

        // Interpolate between orbit and scatter
        groupRef.current.position.x = orbitX * orbitFactor + scatterX * scatterFactor
        groupRef.current.position.y = orbitY * orbitFactor + scatterY * scatterFactor
        groupRef.current.position.z = orbitZ * orbitFactor + scatterZ * scatterFactor

        // Report position to focus store
        photoFocusStore.updatePosition(data.id, groupRef.current.position)

        // Keep photo plane facing outward so "front" matches radial direction
        if (photoRef.current && frameRef.current && bgRef.current) {
            outwardRef.current.set(groupRef.current.position.x, 0, groupRef.current.position.z)
            if (outwardRef.current.lengthSq() < 1e-6) {
                outwardRef.current.set(0, 0, 1)
            } else {
                outwardRef.current.normalize()
            }
            lookAtRef.current.copy(groupRef.current.position).add(outwardRef.current)
            photoRef.current.lookAt(lookAtRef.current)
            frameRef.current.lookAt(lookAtRef.current)
            bgRef.current.lookAt(lookAtRef.current)
            photoFocusStore.updateNormal(data.id, outwardRef.current)
        }

        // Photo plane visibility - ONLY show when scattered enough
        if (photoRef.current && frameRef.current && bgRef.current) {
            const photoMaterial = photoRef.current.material as THREE.MeshBasicMaterial
            const frameMaterial = frameRef.current.material as THREE.MeshBasicMaterial
            const bgMaterial = bgRef.current.material as THREE.MeshBasicMaterial

            // Calculate photo opacity with threshold
            let photoOpacity = 0
            if (morphProgress.current < PHOTO_FADE_START) {
                // Smooth fade in as morphProgress goes from PHOTO_FADE_START to 0
                photoOpacity = 1 - (morphProgress.current / PHOTO_FADE_START)
                photoOpacity = Math.pow(photoOpacity, 1.5) // Ease-in curve
            }

            photoMaterial.opacity = photoOpacity
            bgMaterial.opacity = photoOpacity
            frameMaterial.opacity = photoOpacity * 0.3

            // Scale animation - grow from center
            const scale = 0.3 + photoOpacity * 0.7
            photoRef.current.scale.setScalar(scale)
            bgRef.current.scale.setScalar(scale)
            frameRef.current.scale.set(scale * 1.15, scale * 1.15, 1)

            // Hide mesh entirely when formed
            photoRef.current.visible = morphProgress.current < PHOTO_FADE_START + 0.1
            bgRef.current.visible = morphProgress.current < PHOTO_FADE_START + 0.1
            frameRef.current.visible = morphProgress.current < PHOTO_FADE_START + 0.1
        }

        // Keep particles visible (don't hide them)

        // Subtle rotation when formed
        if (pointsRef.current && morphProgress.current > 0.5) {
            pointsRef.current.rotation.y += delta * 0.3
        }
    })

    const canInteract = morphProgress.current < PHOTO_SHOW_THRESHOLD

    return (
        <group ref={groupRef}>
            {/* Particle system */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={PARTICLES_PER_ORB}
                        args={[spherePositions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-spherePosition"
                        count={PARTICLES_PER_ORB}
                        args={[spherePositions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-scatterPosition"
                        count={PARTICLES_PER_ORB}
                        args={[scatterPositions, 3]}
                    />
                </bufferGeometry>
                <orbParticleMaterial
                    ref={materialRef}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    uColor={new THREE.Color(data.color)}
                />
            </points>

            {/* Glowing frame border (appears first, positioned BEHIND photo to prevent z-fighting) */}
            <mesh ref={frameRef} visible={false} position={[0, 0, -0.05]}>
                <planeGeometry args={[1.4, 1.05]} />
                <meshBasicMaterial
                    color={data.color}
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Solid Background (fills the 4:3 box) */}
            <mesh ref={bgRef} visible={false} position={[0, 0, -0.01]}>
                <planeGeometry args={[1.2, 0.9]} />
                <meshBasicMaterial
                    color={data.color}
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Photo plane (rectangular) - clickable when scattered */}
            <mesh
                ref={photoRef}
                visible={false}
                position={[0, 0, 0.01]} // Slightly in front of bg
                onClick={(e) => {
                    e.stopPropagation()
                    if (morphProgress.current < PHOTO_SHOW_THRESHOLD) {
                        onSelect(data.id)
                    }
                }}
                onPointerOver={(e) => {
                    e.stopPropagation()
                    if (morphProgress.current < PHOTO_SHOW_THRESHOLD) setHovered(true)
                }}
                onPointerOut={() => setHovered(false)}
            >
                <planeGeometry args={[photoWidth, photoHeight]} />
                <meshBasicMaterial
                    map={texture}
                    color="#ffffff"
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Hover label - only when photo is visible */}
            {hovered && canInteract && (
                <Html center position={[0, 0.55, 0]}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(30, 30, 40, 0.95))',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        border: `2px solid ${data.color}`,
                        boxShadow: `0 0 25px ${data.color}, 0 4px 15px rgba(0,0,0,0.5)`,
                        transform: 'translateY(-10px)',
                    }}>
                        ✨ 点击查看回忆
                    </div>
                </Html>
            )}
        </group>
    )
}

interface PhotoOrnamentsProps {
    onSelectOrnament: (id: number) => void
}

export function PhotoOrnaments({ onSelectOrnament }: PhotoOrnamentsProps) {
    return (
        <group>
            {orbs.map((orb) => (
                <PhotoOrb key={orb.id} data={orb} onSelect={onSelectOrnament} />
            ))}
        </group>
    )
}
