import { SceneContainer } from './components/SceneContainer'
import { ArixTree } from './components/ArixTree'
import { Sparkles } from './components/Sparkles'
import { Snowfall } from './components/Snowfall'
import { HandTracker } from './components/HandTracker'

function App() {
  // No more useState for rotation/isTreeFormed!
  // ArixTree now reads directly from the mutable handTrackingStore.
  // This prevents React re-renders on every frame.

  return (
    <>
      <HandTracker />

      {/* Title Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}>
        <h1 style={{ color: 'gold', fontFamily: 'serif', margin: 0, fontSize: '2rem' }}>ARIX SIGNATURE</h1>
        <p style={{ color: 'white', opacity: 0.6, margin: 0 }}>Interactive Christmas Tree</p>
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
