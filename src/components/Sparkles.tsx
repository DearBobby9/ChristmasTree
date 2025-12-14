import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export function Sparkles() {
    const count = 200
    const mesh = useRef<THREE.Points>(null)

    const particles = useMemo(() => {
        const temp = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20
            const y = (Math.random() - 0.5) * 20
            const z = (Math.random() - 0.5) * 20
            temp[i * 3] = x
            temp[i * 3 + 1] = y
            temp[i * 3 + 2] = z
        }
        return temp
    }, [])

    useFrame((state) => {
        if (!mesh.current) return
        mesh.current.rotation.y = state.clock.elapsedTime * 0.05
        mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    })

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} args={[particles, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#FFD700" transparent opacity={0.4} sizeAttenuation />
        </points>
    )
}
