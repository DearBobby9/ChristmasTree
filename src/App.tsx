import { useRef, useEffect, useState } from 'react'
import { SceneContainer } from './components/SceneContainer'
import { ArixTree, handTrackingStore } from './components/ArixTree'
import { Sparkles } from './components/Sparkles'
import { Snowfall } from './components/Snowfall'
import { Countdown } from './components/Countdown'
import { HandTracker } from './components/HandTracker'
import { PhotoOrnaments, orbs, photoFocusStore } from './components/PhotoOrnaments'

function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [isFormed, setIsFormed] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [selectedOrnament, setSelectedOrnament] = useState<number | null>(null)
  const [focusedPhoto, setFocusedPhoto] = useState<number | null>(null)
  const touchRef = useRef<{ startX: number; startY: number; lastX: number; lastY: number } | null>(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Touch handlers for tree rotation
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchRef.current.lastX
    const deltaY = touch.clientY - touchRef.current.lastY

    // Update rotation based on touch movement
    // SKIP if focused on a photo
    if (photoFocusStore.focusedPhotoId === null || handTrackingStore.isTreeFormed) {
      handTrackingStore.rotation[0] += deltaX * 0.02
      handTrackingStore.rotation[1] += deltaY * 0.02
    }

    touchRef.current.lastX = touch.clientX
    touchRef.current.lastY = touch.clientY
  }

  const handleTouchEnd = () => {
    touchRef.current = null
  }

  // Sync with hand tracking store
  useEffect(() => {
    // Initial sync
    setIsFormed(handTrackingStore.isTreeFormed)

    // Subscribe to changes
    const unsubscribe = handTrackingStore.subscribe((newState) => {

      setIsFormed(newState)
      setIsLocked(handTrackingStore.isLocked)

      // Clear photo focus when tree forms
      if (newState === true) {
        setFocusedPhoto(null)
        photoFocusStore.setFocusedPhoto(null)
      }
    })
    return () => { unsubscribe() }
  }, [])

  // Toggle between formed and scattered
  const handleToggle = () => {
    // Set manual override to prevent hand tracking from immediately reversing
    handTrackingStore.setManualOverride(2000)

    // We only need to update the store, the subscription will update local state
    if (!isLocked) {
      const nextFormed = !handTrackingStore.isTreeFormed
      if (nextFormed) {
        setFocusedPhoto(null)
        photoFocusStore.setFocusedPhoto(null)
      }
      handTrackingStore.isTreeFormed = nextFormed
    }
  }

  // Reset to default view
  const handleReset = () => {
    handTrackingStore.rotation = [0, 0]
    setFocusedPhoto(null)
    photoFocusStore.setFocusedPhoto(null)
    if (!isLocked) {
      handTrackingStore.isTreeFormed = true
    }
    // No need to set isFormed manually, subscription handles it
  }

  const handleLock = () => {
    const newLockedState = handTrackingStore.toggleLock()
    setIsLocked(newLockedState)
  }
  const buttonStyle: React.CSSProperties = {
    padding: isMobile ? '14px 28px' : '12px 24px',
    fontSize: isMobile ? '1.1rem' : '1rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    WebkitTapHighlightColor: 'transparent',
    minWidth: isMobile ? '100px' : '90px',
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Only show hand tracker on desktop */}
      {!isMobile && <HandTracker />}

      {/* Title Overlay */}
      <div style={{
        position: 'absolute',
        top: isMobile ? 15 : 20,
        left: isMobile ? 15 : 20,
        zIndex: 20,
      }}>
        <h1 style={{
          color: 'gold',
          fontFamily: 'serif',
          margin: 0,
          fontSize: isMobile ? '1.5rem' : '2rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}>
          ARIX SIGNATURE
        </h1>
        <p style={{
          color: 'white',
          opacity: 0.6,
          margin: 0,
          fontSize: isMobile ? '0.8rem' : '1rem',
        }}>
          Interactive Christmas Tree
        </p>
      </div>

      {/* Christmas Countdown */}
      <Countdown isMobile={isMobile} />

      {/* Mobile hint */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 15,
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.9rem',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          👆 滑动旋转
        </div>
      )}

      {/* Control Buttons */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? 40 : 30,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        gap: isMobile ? '15px' : '20px',
      }}>
        <button
          onClick={handleToggle}
          style={{
            ...buttonStyle,
            background: isLocked
              ? 'linear-gradient(135deg, rgba(80, 80, 80, 0.85), rgba(40, 40, 40, 0.95))'
              : isFormed
                ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.85), rgba(184, 134, 11, 0.95))'
                : 'linear-gradient(135deg, rgba(34, 139, 34, 0.85), rgba(0, 100, 0, 0.95))',
            color: 'white',
            opacity: isLocked ? 0.6 : 1,
            cursor: isLocked ? 'not-allowed' : 'pointer',
          }}
        >
          {isLocked ? '🔒 锁定' : (isFormed ? '✨ 展开' : '🎄 凝聚')}
        </button>

        <button
          onClick={handleLock}
          style={{
            ...buttonStyle,
            background: isLocked
              ? 'linear-gradient(135deg, rgba(220, 50, 50, 0.85), rgba(180, 20, 20, 0.95))'
              : 'linear-gradient(135deg, rgba(100, 100, 100, 0.5), rgba(60, 60, 60, 0.6))',
            minWidth: '60px',
            padding: isMobile ? '14px' : '12px',
          }}
        >
          {isLocked ? '🔓' : '🔒'}
        </button>

        <button
          onClick={handleReset}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, rgba(100, 100, 120, 0.85), rgba(60, 60, 80, 0.95))',
            color: 'white',
          }}
        >
          🔄 复位
        </button>
      </div>

      {/* Photo Navigation - Right side, only when scattered */}
      {!isFormed && (
        <div style={{
          position: 'absolute',
          right: isMobile ? 15 : 25,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {orbs.map((orb) => (
            <button
              key={orb.id}
              onClick={() => {
                const newFocus = focusedPhoto === orb.id ? null : orb.id
                setFocusedPhoto(newFocus)
                photoFocusStore.setFocusedPhoto(newFocus)
              }}
              style={{
                width: isMobile ? '50px' : '56px',
                height: isMobile ? '50px' : '56px',
                borderRadius: '50%',
                border: focusedPhoto === orb.id ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                background: focusedPhoto === orb.id
                  ? `linear-gradient(135deg, ${orb.color}, ${orb.color}dd)`
                  : `linear-gradient(135deg, ${orb.color}80, ${orb.color}50)`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: focusedPhoto === orb.id
                  ? `0 0 20px ${orb.color}, 0 4px 15px rgba(0,0,0,0.4)`
                  : '0 4px 15px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                color: 'white',
                fontWeight: 'bold',
                transform: focusedPhoto === orb.id ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {orb.id}
            </button>
          ))}
          {focusedPhoto && (
            <button
              onClick={() => {
                setFocusedPhoto(null)
                photoFocusStore.setFocusedPhoto(null)
              }}
              style={{
                width: isMobile ? '50px' : '56px',
                height: isMobile ? '50px' : '56px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.5)',
                background: 'linear-gradient(135deg, rgba(100,100,100,0.8), rgba(60,60,60,0.9))',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '1rem' : '1.2rem',
                color: 'white',
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      <SceneContainer>
        <ArixTree />
        <PhotoOrnaments onSelectOrnament={setSelectedOrnament} />
        <Sparkles />
        <Snowfall />
      </SceneContainer>

      {/* Photo Modal Overlay */}
      {selectedOrnament && (() => {
        const selectedOrb = orbs.find(o => o.id === selectedOrnament)
        return (
          <div
            onClick={() => setSelectedOrnament(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(15px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.98))',
                borderRadius: '24px',
                padding: '24px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                textAlign: 'center',
                boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 50px ${selectedOrb?.color}40`,
                border: `2px solid ${selectedOrb?.color}60`,
              }}
            >
              {selectedOrb?.photoUrl ? (
                <img
                  src={selectedOrb.photoUrl}
                  alt={`Memory #${selectedOrnament}`}
                  style={{
                    maxWidth: '70vw',
                    maxHeight: '70vh',
                    borderRadius: '16px',
                    objectFit: 'contain',
                    boxShadow: `0 0 30px ${selectedOrb.color}50`,
                  }}
                />
              ) : (
                <div style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                }}>
                  📸
                </div>
              )}
              <h2 style={{
                color: selectedOrb?.color || 'gold',
                fontFamily: 'serif',
                fontSize: '1.5rem',
                margin: '16px 0 8px',
              }}>
                Memory #{selectedOrnament}
              </h2>
              <button
                onClick={() => setSelectedOrnament(null)}
                style={{
                  padding: '10px 28px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${selectedOrb?.color}cc, ${selectedOrb?.color})`,
                  color: 'white',
                  boxShadow: `0 4px 20px ${selectedOrb?.color}60`,
                  marginTop: '12px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default App
