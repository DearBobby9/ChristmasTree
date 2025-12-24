import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'

interface SceneContainerProps {
    children: React.ReactNode
}

export function SceneContainer({ children }: SceneContainerProps) {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#001a0f' }}>
            <Canvas
                camera={{ position: [0, 2, 12], fov: 45 }}
                dpr={[1, 2]} // Performance optimization for high DPI screens
                gl={{ antialias: false, alpha: false }} // Post-processing often works best with antialias false
            >
                <color attach="background" args={['#001a0f']} />

                {/* Lights */}
                <ambientLight intensity={0.4} color="#002815" />
                <pointLight position={[10, 10, 5]} intensity={2.5} color="#FFD700" />
                <pointLight position={[-10, 5, -5]} intensity={1.5} color="#C5B358" />

                {/* Core light - emanating from tree center */}
                <pointLight position={[0, 0, 0]} intensity={3} color="#FFE4B5" distance={8} decay={2} />
                <pointLight position={[0, -2, 0]} intensity={2} color="#DAA520" distance={6} decay={2} />

                {/* Environment - Cinematic / Luxury feel */}
                <Environment preset="city" />

                <Suspense fallback={null}>
                    {children}
                </Suspense>

                {/* Post Processing - Enhanced Cinematic Glow */}
                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.15}
                        mipmapBlur
                        intensity={2.8}
                        radius={0.75}
                    />
                    <ToneMapping />
                </EffectComposer>

                {/* Fallback controls until hand tracking is active, or for debugging */}
                <OrbitControls makeDefault enableZoom={true} enablePan={false} />
            </Canvas>
        </div>
    )
}
