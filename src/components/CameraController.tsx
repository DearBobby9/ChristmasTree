import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { photoFocusStore } from './PhotoOrnaments'
import { handTrackingStore } from './ArixTree'

export function CameraController() {
    const { camera } = useThree()
    const targetPosition = useRef(new THREE.Vector3(0, 2, 12))
    const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
    const tempNormal = useRef(new THREE.Vector3(0, 0, 1))

    useFrame((_, delta) => {
        const focusedId = photoFocusStore.focusedPhotoId
        const isFormed = handTrackingStore.isTreeFormed

        // Only follow photo when scattered (not formed)
        if (focusedId !== null && !isFormed) {
            // Get the focused photo's position
            const photoPos = photoFocusStore.photoPositions[focusedId]
            if (photoPos) {
                const storedNormal = photoFocusStore.photoNormals[focusedId]
                if (storedNormal) {
                    tempNormal.current.copy(storedNormal)
                } else {
                    tempNormal.current.set(photoPos.x, 0, photoPos.z)
                    if (tempNormal.current.lengthSq() < 1e-6) {
                        tempNormal.current.set(0, 0, 1)
                    } else {
                        tempNormal.current.normalize()
                    }
                }
                const cameraDistance = 4

                // Camera is positioned further out along the same radial direction
                targetPosition.current.copy(photoPos).addScaledVector(tempNormal.current, cameraDistance)
                targetLookAt.current.copy(photoPos)
            }
        } else {
            // Default camera position when not focused or when formed
            targetPosition.current.set(0, 2, 12)
            targetLookAt.current.set(0, 0, 0)
        }

        // Smooth camera movement
        const lerpFactor = Math.min(delta * 2, 1)
        camera.position.lerp(targetPosition.current, lerpFactor)

        // Smooth look-at (using a dummy object to interpolate rotation)
        const currentLookAt = new THREE.Vector3()
        camera.getWorldDirection(currentLookAt)
        currentLookAt.multiplyScalar(10).add(camera.position)
        currentLookAt.lerp(targetLookAt.current, lerpFactor)
        camera.lookAt(currentLookAt)
    })

    return null
}
