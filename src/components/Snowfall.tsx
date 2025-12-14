import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

const SNOW_COUNT = 500

// Custom Snow Shader for gentle falling animation
const SnowMaterial = shaderMaterial(
    { uTime: 0 },
  // Vertex Shader
  /*glsl*/ `
    attribute float size;
    attribute float speed;
    attribute float offset;
    
    uniform float uTime;
    
    varying float vAlpha;
    
    void main() {
      // Calculate falling position
      vec3 pos = position;
      
      // Falling animation with looping
      float fallDistance = 30.0; // Total fall distance
      float y = mod(pos.y - uTime * speed - offset, fallDistance) - fallDistance * 0.5;
      pos.y = y;
      
      // Gentle horizontal sway
      pos.x += sin(uTime * 0.5 + offset) * 0.3;
      pos.z += cos(uTime * 0.3 + offset * 1.5) * 0.3;
      
      // Fade based on depth (further = more transparent)
      vAlpha = smoothstep(20.0, 5.0, abs(pos.z));
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (80.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  /*glsl*/ `
    varying float vAlpha;
    
    void main() {
      // Soft circular snowflake
      vec2 uv = gl_PointCoord - 0.5;
      float dist = length(uv);
      if (dist > 0.5) discard;
      
      float alpha = (1.0 - smoothstep(0.2, 0.5, dist)) * vAlpha * 0.4;
      
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `
)

extend({ SnowMaterial })

// Type declaration
declare module '@react-three/fiber' {
    interface ThreeElements {
        snowMaterial: any
    }
}

export function Snowfall() {
    const pointsRef = useRef<THREE.Points>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    const { positions, sizes, speeds, offsets } = useMemo(() => {
        const pos = new Float32Array(SNOW_COUNT * 3)
        const size = new Float32Array(SNOW_COUNT)
        const speed = new Float32Array(SNOW_COUNT)
        const off = new Float32Array(SNOW_COUNT)

        for (let i = 0; i < SNOW_COUNT; i++) {
            // Spread across a wide area but keep away from center
            const x = (Math.random() - 0.5) * 40
            const y = (Math.random() - 0.5) * 30
            const z = (Math.random() - 0.5) * 30

            pos[i * 3] = x
            pos[i * 3 + 1] = y
            pos[i * 3 + 2] = z

            // Random sizes (small snowflakes)
            size[i] = 0.5 + Math.random() * 1.5

            // Random fall speeds (slow)
            speed[i] = 0.3 + Math.random() * 0.5

            // Random offset for variation
            off[i] = Math.random() * 30
        }

        return { positions: pos, sizes: size, speeds: speed, offsets: off }
    }, [])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
        }
    })

    return (
        <points ref={pointsRef} position={[0, 0, -5]}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={SNOW_COUNT} args={[positions, 3]} />
                <bufferAttribute attach="attributes-size" count={SNOW_COUNT} args={[sizes, 1]} />
                <bufferAttribute attach="attributes-speed" count={SNOW_COUNT} args={[speeds, 1]} />
                <bufferAttribute attach="attributes-offset" count={SNOW_COUNT} args={[offsets, 1]} />
            </bufferGeometry>
            <snowMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}
