import { useEffect, useRef, useState } from "react"
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"
import { handTrackingStore } from "./ArixTree"
import { photoFocusStore } from "./PhotoOrnaments"

interface HandTrackerProps { }

export function HandTracker({ }: HandTrackerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        let handLandmarker: HandLandmarker | null = null
        let animationFrameId: number
        let lastDetectionTime = 0
        const DETECTION_INTERVAL = 100 // Only detect every 100ms (10 FPS) instead of 60 FPS

        const setupMediaPipe = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            )

            handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            })

            setLoaded(true)
            startWebcam()
        }

        const startWebcam = async () => {
            if (!videoRef.current) return
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240 } // Lower resolution for faster processing
                })
                videoRef.current.srcObject = stream
                videoRef.current.addEventListener('loadeddata', predictWebcam)
            } catch (err) {
                console.error("Error accessing webcam:", err)
            }
        }

        let lastVideoTime = -1
        const predictWebcam = () => {
            if (!handLandmarker || !videoRef.current) return

            const now = performance.now()

            // THROTTLE: Only run detection every DETECTION_INTERVAL ms
            if (now - lastDetectionTime >= DETECTION_INTERVAL) {
                lastDetectionTime = now

                if (videoRef.current.currentTime !== lastVideoTime) {
                    lastVideoTime = videoRef.current.currentTime
                    const results = handLandmarker.detectForVideo(videoRef.current, now)

                    if (results.landmarks.length > 0) {
                        const landmarks = results.landmarks[0]

                        // Gesture Detection
                        const wrist = landmarks[0]
                        const tips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]]

                        let avgDist = 0
                        for (const tip of tips) {
                            const dx = tip.x - wrist.x
                            const dy = tip.y - wrist.y
                            const dz = tip.z - wrist.z
                            avgDist += Math.sqrt(dx * dx + dy * dy + dz * dz)
                        }
                        avgDist /= 4

                        // SKIP if manual override is active 
                        // ALSO check Lock: 
                        // If locked, we ONLY allow updates if the tree is currently FORMED (so we can scatter it?)
                        // User requirement: "In condensed (formed) state, should NOT be affected by lock. Only in scattered state."
                        // So:
                        // If Formed: Lock ignored (always update) -> OK
                        // If Scattered: Lock respected (if locked, don't update) -> OK

                        // Condition: !override && (!locked || isTreeFormed)

                        if (!handTrackingStore.isManualOverrideActive() && (!handTrackingStore.isLocked || handTrackingStore.isTreeFormed)) {
                            // DIRECTLY MUTATE the store (no React re-render!)
                            if (avgDist < 0.3) {
                                handTrackingStore.isTreeFormed = true
                            } else if (avgDist > 0.45) {
                                handTrackingStore.isTreeFormed = false
                            }
                        }

                        // Rotation (always update, even during override)
                        // Skip only if a photo is focused AND tree is not formed
                        const focusedId = photoFocusStore.focusedPhotoId
                        if (focusedId === null || handTrackingStore.isTreeFormed) {
                            const x = (wrist.x - 0.5) * 2
                            const y = (wrist.y - 0.5) * 2
                            handTrackingStore.rotation = [x * 5, y * 5]
                        }
                    }
                }
            }

            animationFrameId = requestAnimationFrame(predictWebcam)
        }

        setupMediaPipe()

        return () => {
            cancelAnimationFrame(animationFrameId)
            if (handLandmarker) handLandmarker.close()
        }
    }, [])

    return (
        <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, opacity: 0.8 }}>
            {!loaded && <div style={{ color: 'gold' }}>Loading AI...</div>}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '160px', height: '120px', borderRadius: '12px', border: '2px solid gold', transform: 'scaleX(-1)' }}
            />
            <div style={{ color: '#0f0', fontSize: '10px', textAlign: 'center' }}>
                Fist = Tree | Palm = Scatter
            </div>
        </div>
    )
}
