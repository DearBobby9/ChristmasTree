import { SceneContainer } from './components/SceneContainer'
import { ArixTree, handTrackingStore } from './components/ArixTree'
import { Sparkles } from './components/Sparkles'
import { Snowfall } from './components/Snowfall'
import { HandTracker } from './components/HandTracker'

function App() {
  // No more useState for rotation/isTreeFormed!
  // ArixTree now reads directly from the mutable handTrackingStore.
  // This prevents React re-renders on every frame.

  const handleFormTree = () => {
    handTrackingStore.isTreeFormed = true
  }

  const handleScatterTree = () => {
    handTrackingStore.isTreeFormed = false
  }

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  }

  return (
    <>
      <HandTracker />

      {/* Title Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}>
        <h1 style={{ color: 'gold', fontFamily: 'serif', margin: 0, fontSize: '2rem' }}>ARIX SIGNATURE</h1>
        <p style={{ color: 'white', opacity: 0.6, margin: 0 }}>Interactive Christmas Tree</p>
      </div>

      {/* Manual Control Buttons */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        gap: '20px',
      }}>
        <button
          onClick={handleFormTree}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, rgba(34, 139, 34, 0.8), rgba(0, 100, 0, 0.9))',
            color: 'white',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🎄 凝聚
        </button>
        <button
          onClick={handleScatterTree}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.8), rgba(184, 134, 11, 0.9))',
            color: 'white',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✨ 展开
        </button>
      </div>

      <SceneContainer>
        <ArixTree />
        <Sparkles />
        <Snowfall />
      </SceneContainer>
    </>
  )
}

export default App
