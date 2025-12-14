# Arix Signature Interactive Christmas Tree

A high-fidelity, luxury 3D interactive Christmas tree experience built with React Three Fiber and MediaPipe.

## Features

- **Cinematic Visuals**: Deep Emerald & Gold theme with post-processing Bloom.
- **Interactive Morphing**: Particles smoothly transition between a scattered cloud and a formed tree.
- **Hand Tracking Controls**:
  - **Fist**: Assemble the tree.
  - **Open Palm**: Scatter the particles.
  - **Hand Movement**: Rotate the tree in 3D space.

## Prerequisites

- Node.js (v18 or higher recommended)
- A webcam for hand tracking features

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to the URL shown in the terminal (usually `http://localhost:5173`).

4. **Allow Camera Access**:
   The app requires camera access to track your hand gestures.

## Controls

- **Show Palm**: Explode/Scatter the tree.
- **Clench Fist**: Assemble the tree.
- **Move Hand**: Rotate the view.

## Technologies

- React 19
- TypeScript
- Three.js / React Three Fiber
- Maath (Math helpers)
- MediaPipe (Computer Vision)
- Vite
