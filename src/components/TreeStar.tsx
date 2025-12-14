import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { handTrackingStore } from './ArixTree'

const TREE_HEIGHT = 7

// Create a 5-pointed star shape
function createStarShape(outerRadius: number, innerRadius: number, points: number = 5) {
    const shape = new THREE.Shape()
    const step = Math.PI / points

    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = i * step - Math.PI / 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        if (i === 0) {
            shape.moveTo(x, y)
        } else {
            shape.lineTo(x, y)
        }
    }
    shape.closePath()
    return shape
}

export function TreeStar() {
    const groupRef = useRef<THREE.Group>(null)
    const glowRef = useRef<THREE.Mesh>(null)
    const starRef = useRef<THREE.Mesh>(null)

    // Create star geometry once
    const starGeometry = useMemo(() => {
        const shape = createStarShape(0.35, 0.15, 5)
        const extrudeSettings = {
            depth: 0.08,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 3,
        }
        return new THREE.ExtrudeGeometry(shape, extrudeSettings)
    }, [])

    // Glow effect geometry (larger, transparent star)
    const glowGeometry = useMemo(() => {
        const shape = createStarShape(0.5, 0.22, 5)
        const extrudeSettings = {
            depth: 0.02,
            bevelEnabled: false,
        }
        return new THREE.ExtrudeGeometry(shape, extrudeSettings)
    }, [])

    useFrame((state) => {
        if (!groupRef.current || !glowRef.current || !starRef.current) return

        const time = state.clock.elapsedTime

        // Smooth position based on tree formation
        const targetY = handTrackingStore.isTreeFormed ? TREE_HEIGHT / 2 + 0.3 : 0
        groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05

        // Rotation animation
        groupRef.current.rotation.y = time * 0.5

        // Pulsing glow effect
        const pulse = 0.8 + Math.sin(time * 3) * 0.2
        glowRef.current.scale.setScalar(pulse)

        // Shimmer effect on star material
        if (starRef.current.material instanceof THREE.MeshStandardMaterial) {
            starRef.current.material.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3
        }
    })

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Main star */}
            <mesh ref={starRef} geometry={starGeometry} rotation={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#FFD700"
                    emissive="#FFA500"
                    emissiveIntensity={0.6}
                    metalness={0.9}
                    roughness={0.2}
                />
            </mesh>

            {/* Outer glow layer */}
            <mesh ref={glowRef} geometry={glowGeometry} position={[0, 0, -0.05]}>
                <meshBasicMaterial
                    color="#FFD700"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Point light for glow effect */}
            <pointLight
                color="#FFD700"
                intensity={2}
                distance={5}
                decay={2}
            />

            {/* Additional sparkle particles around the star */}
            <StarSparkles />
        </group>
    )
}

// Small sparkle particles around the star
function StarSparkles() {
    const pointsRef = useRef<THREE.Points>(null)

    const positions = useMemo(() => {
        const count = 30
        const pos = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = 0.4 + Math.random() * 0.4
            pos[i * 3] = Math.cos(angle) * radius
            pos[i * 3 + 1] = Math.sin(angle) * radius
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3
        }

        return pos
    }, [])

    useFrame((state) => {
        if (!pointsRef.current) return
        pointsRef.current.rotation.z = state.clock.elapsedTime * 0.3
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={30} args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#FFFACD"
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}
