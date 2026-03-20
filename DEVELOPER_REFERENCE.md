# NetworkingScreen Component - Developer Reference

## Component Location
`src/pages/NetworkingScreen.jsx`

## State Management Structure

### Lifecycle States
```javascript
currentStage: "boot" | "booting" | "terminal" | "debug" | "expand" | "complete"
networkStatus: "offline" | "booting" | "online" | "degraded" | "healthy"
bootProgress: 0-100 // Percentage
storyProgress: 0-3 // 0: boot, 1: debug, 2: expand, 3: complete
```

### Device State Structure
```javascript
devices = {
  [deviceKey]: {
    name: string,           // Display name (e.g., "PC-1")
    zone: string,           // "datacenter" | "core" | "office"
    powerState: "on"|"off", // Current power state
    ip: string,             // IP address (e.g., "192.168.1.10")
    gateway: string|null,   // Gateway router IP
    subnet: string,         // Network subnet (e.g., "192.168.1.0/24")
    x: number,              // Pixel position X
    y: number               // Pixel position Y
  }
}
```

### Connection State
```javascript
connections = [
  {
    from: string,      // Source device key
    to: string,        // Destination device key
    active: boolean    // Is connection online?
  }
]
```

### Packet Animation State
```javascript
packets = [
  {
    id: string,        // Unique ID
    from: string,      // Source device
    to: string,        // Next hop device
    progress: 0-1,     // Animation progress (0% to 100%)
    status: string     // "sending" | "success" | "failed"
  }
]
```

### Messages State
```javascript
messages = [
  {
    id: number,
    from: string,           // Source device
    to: string,             // Destination device
    message: string,        // Message content or error
    status: "success"|"failed",
    timestamp: string       // HH:MM:SS format
  }
]
```

### Routing Table State
```javascript
routingTables = {
  [routerKey]: {
    [network]: {            // e.g., "10.0.0.0/24"
      nextHop: string,      // e.g., "10.0.0.1" or "direct"
      interface: string     // e.g., "eth0"
    }
  }
}
```

## Key Functions

### Boot Sequence
**Function**: `startBootSequence()`
- Initializes boot logs
- Powers on devices with staggered delays (800ms between each)
- Updates boot progress percentage
- Activates connections as devices come online
- Shows boot alert modal
- Opens terminal when complete

**Duration**: ~4000ms total

### Network Connectivity Check
**Function**: `canPing(source, destination)`
**Returns**: `{ success: boolean, reason: string, log: string[] }`

**Logic**:
1. Check if source is powered on
2. Check if source has IP configured
3. Check if destination is powered on
4. Check if destination has IP configured
5. If same subnet → direct connection
6. If different subnet → check gateway, find route, verify links
7. Return success or failure reason

### Route Finding
**Function**: `findRoutePath(source, destination)`
**Returns**: `{ success: boolean, route: string[], reason: string }`

**Algorithm**: BFS (Breadth-First Search)
- Traverses active connections to find path
- Returns full route (e.g., ["pc1", "router2", "router1", "appServer"])
- Returns failure if no path exists

### Network Diagnostics
**Function**: `runNetworkDiagnostics()`
**Tests**: 6 connectivity pairs over 600ms (100ms per test)
- PC-1 → App-Server
- PC-1 → DB-Server
- PC-2 → App-Server
- PC-2 → Core-Server
- App-Server → DB-Server
- App-Server → Core-Server

**Result**: Sets `diagnosticsResults` with summary and individual results

### Message Transmission
**Function**: `sendMessage(sourceDevice, destDevice)`
**Process**:
1. Check if connectivity exists
2. Find complete path
3. Create animation packets for each hop
4. Animate packets (5% per 50ms frame)
5. After animation, mark as success/failure
6. Log message in history

### CLI Command Execution
**Function**: `executeCommand(device, cmd)`
**Supported Commands**:

| Command | Action |
|---------|--------|
| `device [name]` | Switch to another device |
| `show config` | Display device configuration |
| `ip addr set [IP]` | Set IP address |
| `ip route add default via [IP]` | Set default gateway |
| `show routes` | Display routing table |
| `route add [NETWORK] via [IP]` | Add static route |
| `ping [IP]` | Test connectivity |
| `traceroute [IP]` | Show path to device |

**Output**: Adds to command history with success/failure

## Validation System

### Device Validation
**Function**: `validateDevice(deviceKey)`
**Returns**: `{ status: "ok"|"error"|"unknown", errors: string[], current: {}, expected: {} }`

**Logic**:
- Compares current config with hardcoded "correct" config
- Lists any mismatches in IP, gateway, or subnet
- Used to determine device border color

### Network Fixed Check
**Function**: `validateNetworkFixed()`
**Returns**: `{ fixed: boolean, reason: string }`

**Checks**:
- PC-1 gateway is 192.168.1.254
- Router-1 has route to 10.0.1.0/24

## Visual Rendering

### Device Rendering
- Position: `position: absolute; left: ${x}px; top: ${y}px`
- Border color: Based on `validateDevice()` result
- Size: 90px width, flex column layout
- Children: Name, IP, Gateway, Status indicator

### Connection Rendering
- Uses SVG lines
- Color: Green (#00ff00) if active, Gray (#666) if inactive
- Width: 2px stroke
- Glow: Blur effect for active connections

### Packet Animation (SVG)
- Circle element with gradient glow
- Position calculated: `x = x1 + (x2 - x1) * progress`
- Colors:
  - Blue (#00aaff): Transmitting
  - Yellow (#ffff00): Success
  - Red (#ff3333): Failed
- Trail shows previous path

## Styling Constants

### Colors
```javascript
ZONE_OFFICE = "#ffaa00"      // Orange
ZONE_CORE = "#00aaff"        // Cyan
ZONE_DATACENTER = "#00ff00"  // Green
COLOR_SUCCESS = "#00ff00"
COLOR_ERROR = "#ff3333"
COLOR_WARNING = "#ffaa00"
COLOR_INFO = "#00aaff"
```

### Dimensions
```javascript
DEVICE_WIDTH = 90
DEVICE_HEIGHT = "auto"
TERMINAL_DEFAULT_HEIGHT = 150
PROBLEM_PANEL_WIDTH = 340
CONFIG_PANEL_WIDTH = 280
PACKET_RADIUS = 3
```

## Event Handlers

### Device Click
```javascript
onClick={(e) => {
  e.stopPropagation();
  setSelectedDeviceForConfig(key);
}}
```
- Opens right config panel
- Allows editing IP/gateway/subnet
- Saves changes with validation

### Terminal Command Submit
```javascript
onKeyDown={(e) => {
  if (e.key === "Enter" && currentCommand.trim()) {
    executeCommand(selectedDevice, currentCommand);
    setCurrentCommand("");
  }
}}
```
- Captures Enter key
- Executes command
- Clears input for next command

### Packet Animation Loop
```javascript
useEffect(() => {
  if (packets.length === 0) return;
  const animationFrame = setInterval(() => {
    setPackets(prev => 
      prev.map(p => ({ ...p, progress: p.progress + 0.05 }))
                .filter(p => p.progress <= 1)
    );
  }, 50);
  return () => clearInterval(animationFrame);
}, [packets]);
```
- Updates packet progress every 50ms
- Removes completed packets
- Runs only when packets exist

## Extension Points

### Adding New Devices
1. Add to `devices` state with position (x, y)
2. Add to correct zone
3. Configure IP/gateway/subnet
4. Add connections to other devices
5. Update validation rules

### Adding New Commands
1. Add case to `executeCommand()` function
2. Parse arguments from `trimmed` string
3. Update state or perform action
4. Add output to command history
5. Check network validation if applicable

### Adding New Network Paths
1. Add connection to `connections` array
2. Connection automatically activates when both devices are on
3. `findRoutePath()` will automatically use new connection

### Custom Validations
1. Update `correctConfigs` in `validateDevice()`
2. Update `validateNetworkFixed()` if needed
3. Adjust validation messages in problem panel

## Performance Considerations

### Packet Animation
- Limited to max ~20 packets per hop
- Animation runs at 50ms intervals
- Cleaned up automatically when progress >= 1

### Diagnostic Tests
- 6 tests run sequentially (100ms apart)
- Each test calls `canPing()` which is O(n) path finding
- Total time: ~600ms for all tests

### Rendering Optimization
- SVG glow effect uses semi-transparent elements
- Device positions are absolute (no layout recalc)
- Terminal output auto-scrolls to bottom
- Command history filtered to last 10 entries per device

## Testing Checklist

- [ ] Boot sequence completes in 4 seconds
- [ ] All devices turn green when correctly configured
- [ ] Red devices show error indicators
- [ ] Terminal commands execute and show output
- [ ] Packet animations continue smoothly
- [ ] Diagnostics complete in ~600ms
- [ ] Message transmission animates packets
- [ ] Network status updates correctly
- [ ] Problem panel locks/unlocks appropriately
- [ ] Boot logs display correctly

---

**Component Complexity**: ~1,600 lines of JSX/logic
**Dependencies**: React hooks only (useState, useRef, useEffect)
**Props**: `{ close, onTaskComplete }` (callback functions)
**Accessibility**: Keyboard navigation supported in terminal
