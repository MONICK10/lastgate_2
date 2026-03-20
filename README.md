# Hawkins Protocol - Network Restoration Mission

A comprehensive interactive network simulation game built with React that teaches real-world network troubleshooting through hands-on problem solving.

## 🎮 Game Overview

**Network Restoration Mission** is an educational simulation where players:
1. Boot a data center network
2. Identify and fix misconfigured devices
3. Add missing routing rules
4. Verify network connectivity
5. Send test messages through the network

### Key Learning Outcomes
- Network configuration (IP addresses, gateways, subnets)
- Routing concepts and static routes
- Network troubleshooting methodology
- CLI command usage (ping, traceroute, route)
- Packet flow visualization
- Real-world network administration tasks

## ✨ Features

### 🚀 Complete Game Features
- **Boot Infrastructure**: Realistic system startup with visual feedback
- **Fault Detection**: Identify misconfigured devices with color-coded indicators
- **Debug & Fix**: Fix issues via GUI or terminal CLI
- **Network Verification**: Run comprehensive connectivity diagnostics
- **Message Transmission**: Send test messages with packet animation
- **Packet Animation System**: Visual representation of data flow
- **Boot Logs**: Real-time system startup monitoring
- **Device Dashboard**: Monitor network status and device health

### 🎨 Visual Features
- Interactive network diagram with device positioning
- Smooth animations for state transitions
- Color-coded zones (office/core/datacenter)
- Glowing packet animations along network paths
- Real-time validation feedback
- Responsive UI with resizable panels

### 🛠️ Technical Features
- Real-time validation engine
- Path-finding algorithm for routing
- Command history tracking
- Routing table management
- Network topology visualization
- Multi-device configuration support

## 📖 Documentation

- **[NETWORKING_SIMULATION_GUIDE.md](NETWORKING_SIMULATION_GUIDE.md)** - Complete user guide with workflows
- **[DEVELOPER_REFERENCE.md](DEVELOPER_REFERENCE.md)** - Technical documentation for developers
- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** - Feature checklist and implementation summary

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5174`

## 🎯 How to Play

### Step 1: Boot the System
Click "⚡ Boot System" to power on all devices and see the network come online.

### Step 2: Identify Problems
Review the left panel showing detected issues:
- PC-1 has wrong gateway configuration
- Router-1 missing route to database subnet

### Step 3: Fix Devices
Use either method:
- **GUI**: Click devices in diagram, edit fields in right panel
- **CLI**: Type commands in terminal (e.g., `route add 10.0.1.0/24 via 10.0.0.1`)

### Step 4: Verify Connectivity
Click "🔍 Diagnose" to run connectivity tests between all device pairs.

### Step 5: Send Test Messages
Click "📨 Messages" to send network packets and verify message delivery.

## 🌐 Network Architecture

```
DATACENTER: Core-Server, App-Server, DB-Server, Switch
CORE: Router-1, Router-2
OFFICE: PC-1, PC-2
```

All devices connect through routers and switches. Users must configure correct routes.

## 💻 Terminal Commands

| Command | Purpose |
|---------|---------|
| `show config` | Display device configuration |
| `ip addr set <IP>` | Set IP address |
| `ip route add default via <GW>` | Set default gateway |
| `show routes` | Display routing table |
| `route add <NET> via <GW>` | Add static route |
| `ping <IP>` | Test connectivity |
| `traceroute <IP>` | Show path to device |
| `device <name>` | Switch active device |

## 🎓 Problem Set

### Mission: Restore Network Connectivity

**Current State**: Network is degraded with 2 critical misconfigurations.

**Problems**:
1. ❌ PC-1 Gateway: Configured as `192.168.1.99` → Should be `192.168.1.254`
2. ❌ Router-1 Missing Route: Database subnet `10.0.1.0/24` not in routing table

**Success Criteria**:
- ✅ PC-1 gateway corrected
- ✅ Router-1 route added
- ✅ All connectivity tests pass (6/6)
- ✅ Successfully send messages between devices

**Guided Steps**:
- Follow the "Investigation Steps" on the left panel
- Each step includes detailed instructions
- Steps unlock as you complete prerequisites

## 🏗️ Technology Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Styling**: Inline CSS (easy to customize)
- **Graphics**: SVG for network visualization
- **Routing**: React Router 7.13.0
- **3D (optional)**: Three.js + React Three Fiber (for other sections)

## 📁 Project Structure

```
src/
├── pages/
│   ├── NetworkingScreen.jsx      # Main simulation component
│   ├── Task1.jsx                 # Supporting pages
│   ├── Task2.jsx
│   └── ...other pages
├── components/
│   ├── Character.jsx
│   ├── CipherDecoder.jsx
│   └── ...other components
├── context/
│   └── GameContext.jsx
├── lib/
│   ├── gameEngine.js
│   ├── puzzles.js
│   └── ...utilities
└── styles/
    └── PixelTown.css
```

## 🎮 Game Modes

### Main Mode: Network Restoration Mission
- Guided troubleshooting with hints
- Progressive difficulty
- Multiple problem types
- Comprehensive diagnostics

### Could Include:
- Sandbox mode (freeform network building)
- Timed challenges (fix network in X seconds)
- Network design mode (build custom topologies)
- Multiplayer mode (collaborative troubleshooting)

## 🐛 Known Limitations

- Limited to synchronous validation (real networks have async)
- Simplified routing (no OSPF/BGP)
- No actual packet loss simulation
- Each device/route is hardcoded (no dynamic setup)

## 🔮 Future Enhancements

Potential improvements:
- Add network switch port configuration
- VLAN support
- More complex routing protocols
- Real-time packet monitoring
- Network performance metrics
- Custom scenario creation
- Multiplayer support
- Mobile-responsive design
- Accessibility improvements

## 📝 License

This project is part of the Hawkins Protocol educational series.

## 👨‍💻 Contributing

To extend the simulation:

1. **Add Commands**: Update `executeCommand()` in NetworkingScreen.jsx
2. **Add Devices**: Modify `devices` state object
3. **Change Routes**: Update `connections` array
4. **Custom Problems**: Create new problem sets in problem panel
5. **Visual Updates**: Modify rendering sections for new features

See [DEVELOPER_REFERENCE.md](DEVELOPER_REFERENCE.md) for detailed extension guide.

## 📞 Support

For questions or issues:
1. Check [NETWORKING_SIMULATION_GUIDE.md](NETWORKING_SIMULATION_GUIDE.md) for user help
2. See [DEVELOPER_REFERENCE.md](DEVELOPER_REFERENCE.md) for technical questions
3. Review [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) for feature details

## ✅ Implementation Status

**network Restoration Mission**: ✅ COMPLETE

All PRD requirements implemented plus bonus features:
- ✅ Boot infrastructure with logs
- ✅ Fault detection and visualization  
- ✅ Debug & fix with dual interfaces
- ✅ Network creation and validation
- ✅ Network verification with diagnostics
- ✅ Message transmission with animation
- ✅ Packet animation system (bonus)
- ✅ Enhanced terminal (bonus)
- ✅ Visual polish and animations (bonus)

---

**Last Updated**: March 2026  
**Status**: Production Ready  
**Version**: 1.0.0

