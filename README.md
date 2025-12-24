# 🎄 Arix Signature Interactive Christmas Tree

A high-fidelity, luxury 3D interactive Christmas tree experience built with React Three Fiber and MediaPipe hand tracking.

![Christmas Tree](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-r169-black?style=flat-square&logo=three.js)

## ✨ Features

### 🌟 Cinematic Visuals
- **Deep Emerald & Gold Theme**: Luxurious color palette with post-processing Bloom effects
- **Particle System**: Thousands of particles form a stunning Christmas tree
- **Dynamic Star**: Animated star topper with golden glow
- **Snowfall Effect**: Gentle background snowflakes enhance the winter ambiance
- **Sparkle Effects**: Magical sparkles throughout the scene

### 🎄 Interactive Morphing
- Particles smoothly transition between a scattered cloud and a formed tree
- Cinematic camera movements during state transitions
- Smooth easing animations for natural feel

### 🖼️ Photo Ornaments
- **Orbital Animation**: Photo orbs orbit around the tree at different heights
- **Particle-Based Orbs**: Spherical particle formations that explode to reveal photos
- **Click to Enlarge**: Click any photo ornament to view it in a modal
- **Aspect Ratio Preservation**: Photos maintain their original proportions

### ⏰ Christmas Countdown
- **Live Timer**: Real-time countdown to Christmas Day
- **Glassmorphism Design**: Modern frosted glass aesthetic
- **Gold Gradients**: Luxurious golden text styling

### 🤚 Hand Tracking Controls
- **Fist Gesture**: Assemble the tree
- **Open Palm**: Scatter the particles
- **Hand Movement**: Rotate the tree in 3D space
- **Toggle Control**: Enable/disable hand tracking with a button
- **Lock Feature**: Lock the tree state to prevent accidental changes

## 🛠️ Prerequisites

- Node.js (v18 or higher recommended)
- A webcam for hand tracking features
- Modern browser with WebGL support

## 🚀 Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/DearBobby9/ChristmasTree.git
   cd ChristmasTree
   ```

2. **One-Click Start** ⚡:
   ```bash
   ./start.sh
   ```
   > This script will automatically install dependencies (if needed) and start the dev server with browser auto-open.

3. **Allow Camera Access**:
   The app requires camera access to track your hand gestures.

<details>
<summary>Manual Start (Alternative)</summary>

```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173`
</details>

## 🎮 Controls

| Action | Gesture/Input |
|--------|---------------|
| Scatter Tree | Show Open Palm |
| Assemble Tree | Clench Fist |
| Rotate View | Move Hand |
| View Photo | Click Photo Ornament |
| Toggle Hand Tracking | Click "Start/Stop Hand Gestures" button |
| Lock State | Click "Lock" button (prevents scattering) |

## 🧰 Technologies

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Three.js / React Three Fiber** - 3D Graphics
- **@react-three/drei** - R3F Helpers
- **@react-three/postprocessing** - Visual Effects
- **Maath** - Math Utilities
- **MediaPipe** - Computer Vision / Hand Tracking
- **Zustand** - State Management
- **Vite** - Build Tool

## 📁 Project Structure

```
src/
├── components/
│   ├── ArixTree.tsx        # Main particle tree component
│   ├── CameraController.tsx # Camera animations
│   ├── Countdown.tsx       # Christmas countdown timer
│   ├── HandTracker.tsx     # MediaPipe hand tracking
│   ├── PhotoOrnaments.tsx  # Photo orb system
│   ├── SceneContainer.tsx  # 3D scene wrapper
│   ├── Snowfall.tsx        # Background snow effect
│   ├── Sparkles.tsx        # Sparkle particles
│   └── TreeStar.tsx        # Animated tree topper
├── App.tsx                 # Main application
└── main.tsx               # Entry point
```

## 📜 License

MIT License

## 🎁 Happy Holidays!

Made with ❤️ for the Christmas season 🎅
