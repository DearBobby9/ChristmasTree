import { useRef, useEffect, useState } from 'react'
import { SceneContainer } from './components/SceneContainer'
import { ArixTree, handTrackingStore } from './components/ArixTree'
import { Sparkles } from './components/Sparkles'
import { Snowfall } from './components/Snowfall'
import { Countdown } from './components/Countdown'
import { HandTracker } from './components/HandTracker'

function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [isFormed, setIsFormed] = useState(false)
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
    handTrackingStore.rotation[0] += deltaX * 0.02
    handTrackingStore.rotation[1] += deltaY * 0.02

    touchRef.current.lastX = touch.clientX
    touchRef.current.lastY = touch.clientY
  }

  const handleTouchEnd = () => {
    touchRef.current = null
  }

  // Toggle between formed and scattered
  const handleToggle = () => {
    const newState = !isFormed
    setIsFormed(newState)
    handTrackingStore.isTreeFormed = newState
  }

  // Reset to default view
  const handleReset = () => {
    handTrackingStore.rotation = [0, 0]
    handTrackingStore.isTreeFormed = true
    setIsFormed(true)
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
            background: isFormed
              ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.85), rgba(184, 134, 11, 0.95))'
              : 'linear-gradient(135deg, rgba(34, 139, 34, 0.85), rgba(0, 100, 0, 0.95))',
            color: 'white',
          }}
        >
          {isFormed ? '✨ 展开' : '🎄 凝聚'}
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

      <SceneContainer>
        <ArixTree />
        <Sparkles />
        <Snowfall />
      </SceneContainer>
    </div>
  )
}

export default App

