import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

// Custom shader for twinkling star effect
const TwinklingStarMaterial = shaderMaterial(
    { uTime: 0 },
    // Vertex Shader
    /*glsl*/ `
        attribute float seed;
        varying float vSeed;
        varying float vAlpha;
        uniform float uTime;

        void main() {
            vSeed = seed;
            
            // Twinkling alpha based on time and unique seed
            vAlpha = 0.4 + 0.6 * abs(sin(uTime * (1.5 + seed * 2.0) + seed * 6.28));
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = (40.0 + seed * 30.0) / -mvPosition.z;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    // Fragment Shader - 4-pointed star shape
    /*glsl*/ `
        varying float vSeed;
        varying float vAlpha;

        void main() {
            vec2 uv = gl_PointCoord - 0.5;
            
            // Create 4-pointed star shape
            float angle = atan(uv.y, uv.x);
            float dist = length(uv);
            
            // Star pattern with 4 points
            float star = abs(cos(angle * 2.0)) * 0.3 + 0.2;
            
            // Soft glow falloff
            float glow = 1.0 - smoothstep(0.0, star, dist);
            float core = 1.0 - smoothstep(0.0, 0.15, dist);
            
            // Gold color with white core
            vec3 goldColor = vec3(1.0, 0.84, 0.0);
            vec3 coreColor = vec3(1.0, 1.0, 0.9);
            vec3 color = mix(goldColor, coreColor, core * 0.7);
            
            float alpha = glow * vAlpha;
            if (alpha < 0.01) discard;
            
            gl_FragColor = vec4(color, alpha);
        }
    `
)

extend({ TwinklingStarMaterial })

export function Sparkles() {
    const count = 150
    const mesh = useRef<THREE.Points>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    const { positions, seeds } = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const seedArr = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20
            const y = (Math.random() - 0.5) * 20
            const z = (Math.random() - 0.5) * 20
            pos[i * 3] = x
            pos[i * 3 + 1] = y
            pos[i * 3 + 2] = z
            seedArr[i] = Math.random()
        }
        return { positions: pos, seeds: seedArr }
    }, [])

    useFrame((state) => {
        if (!mesh.current || !materialRef.current) return
        mesh.current.rotation.y = state.clock.elapsedTime * 0.03
        mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.1
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    })

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} args={[positions, 3]} />
                <bufferAttribute attach="attributes-seed" count={count} args={[seeds, 1]} />
            </bufferGeometry>
            <twinklingStarMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}
