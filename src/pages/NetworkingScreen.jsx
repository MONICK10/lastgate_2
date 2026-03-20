import { useState, useRef, useEffect } from "react";
import "./Task1.css";
import NetworkCanvas from "../components/NetworkCanvas";
import TerminalPanel from "../components/TerminalPanel";
import DevicePalette from "../components/DevicePalette";
import DeviceConfigPanel from "../components/DeviceConfigPanel";
import ProblemPanel from "../components/ProblemPanel";

export default function NetworkingScreen({ close, onTaskComplete }) {
  // ============ STAGE & LIFECYCLE ============
  const [currentStage, setCurrentStage] = useState("boot"); // boot, booting, terminal, debug, expand, complete
  const [networkStatus, setNetworkStatus] = useState("offline"); // offline, booting, online, degraded, healthy
  const [bootProgress, setBootProgress] = useState(0); // 0-100 for animation

  // ============ UI PANELS ============
  const [problemPanelOpen, setProblePanelOpen] = useState(true);
  const [selectedDeviceForConfig, setSelectedDeviceForConfig] = useState(null);
  const [configEdits, setConfigEdits] = useState({}); // Track user edits
  const [validationStatus, setValidationStatus] = useState({}); // Track validation results
  const [storyProgress, setStoryProgress] = useState(0); // 0: boot, 1: debug, 2: expand, 3: complete
  const [showBootModal, setShowBootModal] = useState(false); // Boot alert modal
  const [pendingConfigSave, setPendingConfigSave] = useState(null); // Track unsaved config edits

  // ============ DEVICE STATE ============
  const [devices, setDevices] = useState({
    // Data Center
    coreServer: { name: "Core-Server", zone: "datacenter", powerState: "off", ip: "10.0.0.1", gateway: null, subnet: "10.0.0.0/24", x: 500, y: 100 },
    
    // Switches
    dcSwitch: { name: "Switch-DC", zone: "datacenter", powerState: "off", ip: null, gateway: null, subnet: null, x: 700, y: 100 },
    
    // Routers
    router1: { name: "Router-1", zone: "core", powerState: "off", ip: "10.0.0.254", gateway: null, subnet: "10.0.0.0/24", x: 500, y: 250 },
    router2: { name: "Router-2", zone: "core", powerState: "off", ip: "192.168.1.254", gateway: null, subnet: "192.168.1.0/24", x: 700, y: 250 },
    
    // Office Devices
    pc1: { name: "PC-1", zone: "office", powerState: "off", ip: "192.168.1.10", gateway: "192.168.1.99", subnet: "192.168.1.0/24", x: 300, y: 400 }, // WRONG GATEWAY
    pc2: { name: "PC-2", zone: "office", powerState: "off", ip: "192.168.1.20", gateway: "192.168.1.254", subnet: "192.168.1.0/24", x: 450, y: 400 },
    
    // App Servers
    appServer: { name: "App-Server", zone: "datacenter", powerState: "off", ip: "10.0.0.10", gateway: "10.0.0.1", subnet: "10.0.0.0/24", x: 900, y: 100 },
    dbServer: { name: "DB-Server", zone: "datacenter", powerState: "off", ip: "10.0.1.10", gateway: "10.0.1.1", subnet: "10.0.1.0/24", x: 900, y: 200 },
  });

  // ============ CONNECTIONS ============
  const [connections, setConnections] = useState([
    { from: "coreServer", to: "dcSwitch", active: false },
    { from: "dcSwitch", to: "appServer", active: false },
    { from: "dcSwitch", to: "dbServer", active: false },
    { from: "dcSwitch", to: "router1", active: false },
    { from: "router1", to: "router2", active: false },
    { from: "router2", to: "pc1", active: false },
    { from: "router2", to: "pc2", active: false },
  ]);

  // ============ ROUTING TABLES ============
  const [routingTables, setRoutingTables] = useState({
    router1: {
      "10.0.0.0/24": { nextHop: "direct", interface: "eth0" },
      // MISSING: "10.0.1.0/24" - Database subnet (debug task)
    },
    router2: {
      "192.168.1.0/24": { nextHop: "direct", interface: "eth0" },
      "10.0.0.0/24": { nextHop: "10.0.0.254", interface: "eth1" },
    },
  });

  // ============ TERMINAL STATE ============
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("pc1");
  const [commandHistory, setCommandHistory] = useState({});

  // ============ DIAGNOSTIC LOG ============
  const [diagnosticLog, setDiagnosticLog] = useState([]);

  // ============ PACKET ANIMATION STATE ============
  const [packets, setPackets] = useState([]); // { id, from, to, progress: 0-1, status: sending|success|failed }
  const [messages, setMessages] = useState([]); // Message history
  const [messageSourceDevice, setMessageSourceDevice] = useState("pc1");
  const [messageDestDevice, setMessageDestDevice] = useState("appServer");
  const [showMessagePanel, setShowMessagePanel] = useState(false);

  // ============ NETWORK DIAGNOSTICS STATE ============
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsResults, setDiagnosticsResults] = useState(null);
  const [showDiagnosticsPanel, setShowDiagnosticsPanel] = useState(false);

  // ============ BOOT LOGS ============
  const [bootLogs, setBootLogs] = useState([]);

  // ============ REFS ============
  const packetAnimationRef = useRef(null);

  // ============ EFFECT: Packet Animation Loop ============
  useEffect(() => {
    if (packets.length === 0) return;

    const animationFrame = setInterval(() => {
      setPackets(prev => {
        return prev.map(packet => {
          if (packet.progress >= 1) {
            return null; // Remove completed packet
          }
          return {
            ...packet,
            progress: packet.progress + 0.05 // Animate at 5% per frame
          };
        }).filter(p => p !== null);
      });
    }, 50);

    return () => clearInterval(animationFrame);
  }, [packets]);

  // ============ EFFECT: Terminal Resize ============
  const problemStatement = {
    title: "🔴 Network Connectivity Failure",
    description: "PC-1 cannot reach the Application Server (10.0.0.10). There are 2 critical misconfigurations blocking connectivity.",
    objective: "Find and fix BOTH configuration errors, then verify connectivity",
    affectedDevices: ["PC-1", "Router-1", "App-Server"],
    symptoms: [
      "❌ PC-1 Gateway WRONG: shows 192.168.1.99 but should be 192.168.1.254",
      "❌ Router-1 missing route to Database Server subnet (10.0.1.0/24)",
      "❌ Ping from PC-1 to App Server (10.0.0.10) FAILS"
    ],
    guidedSteps: [
      { 
        num: 1, 
        title: "STEP 1: Start the Network", 
        action: "Click the '⚡ Boot System' button at the top right to power on all devices.",
        details: "Wait for the progress bar to reach 100%. You'll see all devices turn green in the network diagram when boot is complete.",
        status: "pending",
        cmd: "Click: ⚡ Boot System button"
      },
      { 
        num: 2, 
        title: "STEP 2: Find Problem #1 - PC-1 Gateway Wrong", 
        action: "Click on PC-1 (bottom-left of the network diagram) to open its configuration panel on the right side.",
        details: "Look at the Gateway field in the right panel. It shows 192.168.1.99 (WRONG). The 'Expected' box shows 192.168.1.254 (CORRECT).",
        problem: "🔴 ISSUE: PC-1's gateway is misconfigured. It cannot reach servers through the router with this wrong gateway!",
        status: "pending",
        cmd: "Click on: PC-1 device in network diagram"
      },
      { 
        num: 3, 
        title: "STEP 3: Fix Problem #1 - Edit Gateway Field", 
        action: "In the right panel under 'Gateway', click in the text input field where it shows: 192.168.1.99",
        details: "The input field has a green border. Click inside it to start editing.",
        status: "pending",
        cmd: "Click in: Gateway input field"
      },
      { 
        num: 4, 
        title: "STEP 4: Clear Old Gateway and Type New One", 
        action: "Delete the old value and type the correct gateway: 192.168.1.254",
        details: "Steps: (1) Select all text with Ctrl+A, (2) Type the new value 192.168.1.254",
        fix: "FROM: 192.168.1.99 → TO: 192.168.1.254",
        status: "pending",
        cmd: "Ctrl+A, then type: 192.168.1.254"
      },
      { 
        num: 5, 
        title: "STEP 5: Close PC-1 Config Panel", 
        action: "Click the '✕ Close' button at the bottom of the right config panel.",
        details: "This saves the change and closes the panel.",
        status: "pending",
        cmd: "Click: ✕ Close button"
      },
      { 
        num: 6, 
        title: "STEP 6: Find Problem #2 - Check Router Routes", 
        action: "Look at the TERMINAL at the bottom of the screen. Click on the 'Router-1' device button to connect to it.",
        details: "The terminal shows which device you're connected to. Click the 'Router-1' tab to switch to that device.",
        status: "pending",
        cmd: "Click on: Router-1 tab in terminal"
      },
      { 
        num: 7, 
        title: "STEP 7: View Router Routing Table", 
        action: "In the terminal (bottom), type this command and press Enter: show routes",
        details: "This displays Router-1's routing table. You will see it has a route to 10.0.0.0/24 but is MISSING a route to 10.0.1.0/24 (Database subnet).",
        missing: "🔴 MISSING: route to 10.0.1.0/24 (Database Server subnet)",
        status: "pending",
        cmd: "show routes",
        expected: "Output should show:\n  10.0.0.0/24 via direct\n  (10.0.1.0/24 is NOT listed - THIS IS THE PROBLEM!)"
      },
      { 
        num: 8, 
        title: "STEP 8: Fix Problem #2 - Add Missing Route", 
        action: "In the terminal, type this EXACT command and press Enter:",
        details: "This adds a new route to the Database Server subnet (10.0.1.0/24). The route says: 'Send traffic destined for 10.0.1.0/24 through the gateway at 10.0.0.1'",
        fix: "Adding route to Database Server subnet",
        status: "pending",
        cmd: "route add 10.0.1.0/24 via 10.0.0.1"
      },
      { 
        num: 9, 
        title: "STEP 9: Verify Route Was Added", 
        action: "Type 'show routes' again in the terminal to confirm the new route is now present.",
        details: "You should now see BOTH routes:\n  - 10.0.0.0/24 via direct\n  - 10.0.1.0/24 via 10.0.0.1",
        status: "pending",
        cmd: "show routes",
        expected: "Both routes now visible!"
      },
      { 
        num: 10, 
        title: "STEP 10: Switch to PC-1 for Final Test", 
        action: "In the terminal, click on 'PC-1' tab to switch back to PC-1 device.",
        details: "You need to run the final connectivity test from PC-1.",
        status: "pending",
        cmd: "Click on: PC-1 tab in terminal"
      },
      { 
        num: 11, 
        title: "STEP 11: Final Test - Ping Application Server", 
        action: "In the terminal, type this command and press Enter: ping 10.0.0.10",
        details: "This tests if PC-1 can now reach the Application Server at 10.0.0.10. If you see '✓ REPLY' then BOTH problems are fixed!",
        success: "✓ SUCCESS if you see: ✓ REPLY from 10.0.0.10 - Connection successful!",
        status: "pending",
        cmd: "ping 10.0.0.10"
      },
      { 
        num: 12, 
        title: "🎉 Complete - Network is Healthy!", 
        action: "If the ping succeeded, the network connectivity is RESTORED. All misconfigurations have been fixed.",
        details: "PC-1 can now communicate with the Application Server (10.0.0.10). The two problems were: (1) Wrong gateway on PC-1, (2) Missing route on Router-1.",
        status: "locked",
        locked: true,
        hint: "New challenges and tasks will unlock when you complete this"
      },
    ]
  };

  // ============ UTILITY: Validate Network Fix ============
  const validateNetworkFixed = () => {
    // Check if PC-1 gateway is fixed
    const pc1Config = configEdits.pc1 || devices.pc1;
    if (pc1Config.gateway !== "192.168.1.254") {
      return { fixed: false, reason: "PC-1 gateway not fixed" };
    }

    // Check if Router-1 has route to 10.0.1.0/24
    const router1Routes = routingTables.router1 || {};
    if (!router1Routes["10.0.1.0/24"]) {
      return { fixed: false, reason: "Router-1 missing Database subnet route" };
    }

    return { fixed: true, reason: "Network fully configured!" };
  };

  // ============ UTILITY: Check Ping Validity ============
  const canPingNow = (source, destination) => {
    const sourceConfig = configEdits[source] || devices[source];
    const destConfig = devices[destination];

    // PC-1 must have correct gateway
    if (source === "pc1" && sourceConfig.gateway !== "192.168.1.254") {
      return { success: false, reason: "PC-1 gateway incorrect" };
    }

    // Router-1 must have route to destination subnet
    if (source === "pc1" && destConfig.subnet === "10.0.0.0/24") {
      const routes = routingTables.router1 || {};
      if (!routes["10.0.0.0/24"]) {
        return { success: false, reason: "Router-1 missing route to 10.0.0.0/24" };
      }
    }

    // Check all links active
    const path = findRoutePath(source, destination);
    if (!path.success) {
      return { success: false, reason: path.reason };
    }

    return { success: true, reason: "Connection OK" };
  };

  // ============ UTILITY: Get Zone Color ============
  const getZoneColor = (zone) => {
    const colors = {
      datacenter: "#00ff00",
      core: "#00aaff",
      office: "#ffaa00",
    };
    return colors[zone] || "#aaa";
  };

  // ============ UTILITY: Validate Device Configuration ============
  const validateDevice = (deviceKey) => {
    const device = devices[deviceKey];
    const edited = configEdits[deviceKey];
    
    // Get current values
    const ip = edited?.ip !== undefined ? edited.ip : device.ip;
    const gateway = edited?.gateway !== undefined ? edited.gateway : device.gateway;
    const subnet = edited?.subnet !== undefined ? edited.subnet : device.subnet;

    // Define correct configs
    const correctConfigs = {
      pc1: { ip: "192.168.1.10", gateway: "192.168.1.254", subnet: "192.168.1.0/24" },
      pc2: { ip: "192.168.1.20", gateway: "192.168.1.254", subnet: "192.168.1.0/24" },
      router1: { ip: "10.0.0.254", gateway: null, subnet: "10.0.0.0/24" },
      router2: { ip: "192.168.1.254", gateway: null, subnet: "192.168.1.0/24" },
      coreServer: { ip: "10.0.0.1", gateway: null, subnet: "10.0.0.0/24" },
      appServer: { ip: "10.0.0.10", gateway: "10.0.0.1", subnet: "10.0.0.0/24" },
      dbServer: { ip: "10.0.1.10", gateway: "10.0.1.1", subnet: "10.0.1.0/24" },
      dcSwitch: { ip: null, gateway: null, subnet: null },
    };

    const correct = correctConfigs[deviceKey];
    if (!correct) return { status: "unknown", errors: [] };

    let errors = [];
    if (ip !== correct.ip) errors.push("IP mismatch");
    if (gateway !== correct.gateway) errors.push("Gateway mismatch");
    if (subnet !== correct.subnet) errors.push("Subnet mismatch");

    if (errors.length > 0) return { status: "error", errors, current: { ip, gateway, subnet }, expected: correct };
    return { status: "ok", errors: [], current: { ip, gateway, subnet }, expected: correct };
  };

  // ============ UTILITY: Run Network Diagnostics ============
  const runNetworkDiagnostics = () => {
    setDiagnosticsRunning(true);
    addDiagnosticLog("SYSTEM: Running network diagnostics...");

    const results = [];
    const testPairs = [
      { from: "pc1", to: "appServer", name: "PC-1 → App-Server" },
      { from: "pc1", to: "dbServer", name: "PC-1 → DB-Server" },
      { from: "pc2", to: "appServer", name: "PC-2 → App-Server" },
      { from: "pc2", to: "coreServer", name: "PC-2 → Core-Server" },
      { from: "appServer", to: "dbServer", name: "App-Server → DB-Server" },
      { from: "appServer", to: "coreServer", name: "App-Server → Core-Server" },
    ];

    testPairs.forEach((pair, idx) => {
      setTimeout(() => {
        const result = canPing(pair.from, pair.to);
        results.push({
          name: pair.name,
          success: result.success,
          reason: result.reason
        });

        addDiagnosticLog(`DIAG: ${pair.name} ${result.success ? "✓ OK" : "✗ " + result.reason}`);

        if (idx === testPairs.length - 1) {
          const successCount = results.filter(r => r.success).length;
          const totalCount = results.length;
          
          setTimeout(() => {
            setDiagnosticsResults({
              timestamp: new Date().toLocaleTimeString(),
              results,
              summary: `${successCount}/${totalCount} connections OK`,
              healthy: successCount === totalCount
            });
            setDiagnosticsRunning(false);
            addDiagnosticLog(`DIAG: Summary: ${successCount}/${totalCount} connections healthy`);
          }, 200);
        }
      }, idx * 300);
    });
  };

  // ============ UTILITY: Send Message ============
  const sendMessage = (sourceDevice, destDevice) => {
    const result = canPing(sourceDevice, destDevice);
    
    if (result.success) {
      // Find path
      const path = findRoutePath(sourceDevice, destDevice);
      
      if (path.success) {
        // Create packet animation
        const packetId = Date.now();
        
        // Animate packet along entire path
        for (let i = 0; i < path.route.length - 1; i++) {
          const from = path.route[i];
          const to = path.route[i + 1];
          
          setPackets(prev => [...prev, {
            id: `${packetId}-${i}`,
            from,
            to,
            progress: 0,
            status: "sending"
          }]);
        }

        // After animation, mark as success
        const animationDuration = (path.route.length - 1) * 1000 / 20;
        setTimeout(() => {
          setPackets(prev => prev.filter(p => !p.id.startsWith(String(packetId))));
          setMessages(prev => [...prev, {
            id: packetId,
            from: sourceDevice,
            to: destDevice,
            message: `Data packet from ${devices[sourceDevice]?.name} to ${devices[destDevice]?.name}`,
            status: "success",
            timestamp: new Date().toLocaleTimeString()
          }]);
          
          addDiagnosticLog(`SYSTEM: ✓ Message delivered from ${sourceDevice} to ${destDevice}`);
        }, animationDuration);
      }
    } else {
      setMessages(prev => [...prev, {
        id: Date.now(),
        from: sourceDevice,
        to: destDevice,
        message: `Failed: ${result.reason}`,
        status: "failed",
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      addDiagnosticLog(`SYSTEM: ✗ Message failed from ${sourceDevice}: ${result.reason}`);
    }
  };
  const activateConnectionsForDevices = (devicesState) => {
    return connections.map(conn => ({
      ...conn,
      active:
        devicesState[conn.from]?.powerState === "on" &&
        devicesState[conn.to]?.powerState === "on"
    }));
  };

  // ============ UTILITY: Boot Sequence ============
  const startBootSequence = () => {
    setNetworkStatus("booting");
    setBootProgress(0);
    setCurrentStage("booting");
    setShowBootModal(true); // Show alert modal on boot
    
    // Initialize boot logs
    const logs = [
      "[SYSTEM] Initializing Data Center...",
      "[SYSTEM] Power sequencer: STANDBY",
      "[SYSTEM] Loading BIOS..."
    ];
    setBootLogs(logs);

    const bootSequence = [
      { device: "coreServer", delay: 0, log: "Starting Core-Server... OK" },
      { device: "dcSwitch", delay: 800, log: "Starting Switch-DC... OK" },
      { device: "appServer", delay: 1200, log: "Starting App-Server... OK" },
      { device: "dbServer", delay: 1600, log: "Starting DB-Server... OK" },
      { device: "router1", delay: 2000, log: "Starting Router-1... OK" },
      { device: "router2", delay: 2400, log: "Starting Router-2... OK" },
      { device: "pc1", delay: 2800, log: "Starting PC-1... OK" },
      { device: "pc2", delay: 3200, log: "Starting PC-2... OK" }
    ];

    bootSequence.forEach(({ device, delay, log }) => {
      setTimeout(() => {
        setDevices(prev => {
          const updated = {
            ...prev,
            [device]: { ...prev[device], powerState: "on" }
          };
          // Activate connections with properly updated device state
          setConnections(activateConnectionsForDevices(updated));
          return updated;
        });

        setBootProgress(prev => Math.min(prev + 12, 95));
        setBootLogs(prev => [...prev, log]);
      }, delay);
    });

    // Complete boot - ensure ALL connections are active
    setTimeout(() => {
      // Force all connections active to ensure full connectivity
      setConnections(prev => prev.map(conn => ({ ...conn, active: true })));
      setNetworkStatus("online");
      setBootProgress(100);
      setCurrentStage("debug");
      setTerminalOpen(true);
      setStoryProgress(1); // Move to debug stage
      
      setBootLogs(prev => [
        ...prev,
        "",
        "⚠ ALERT: Misconfigurations detected",
        "⚠ Router-1: Missing routes to database subnet",
        "⚠ PC-1: Gateway configuration incorrect",
        "",
        "[SYSTEM] Boot sequence complete. Network online but degraded.",
        "[SYSTEM] Connectivity issues detected. Begin diagnosis."
      ]);
      
      addDiagnosticLog("SYSTEM: Boot sequence complete. Network online but degraded.");
      addDiagnosticLog("SYSTEM: Connectivity issues detected. Begin diagnosis.");
    }, 4000);
  };

  // ============ UTILITY: Add Diagnostic Log ============
  const addDiagnosticLog = (msg) => {
    setDiagnosticLog(prev => [...prev, msg]);
  };

  // ============ CORE: canPing ============
  const canPing = (source, destination) => {
    const log = [];

    // Check source device
    if (devices[source]?.powerState !== "on") {
      return { success: false, reason: "Source offline", log: ["Source device is powered off"] };
    }
    log.push(`[1] ${source} is online`);

    // PROPERLY MERGE: configEdits overrides devices values
    const sourceConfig = { ...devices[source], ...(configEdits[source] || {}) };
    if (!sourceConfig.ip) {
      return { success: false, reason: "Source not configured", log };
    }
    log.push(`[2] Source IP: ${sourceConfig.ip}`);

    // Check destination device
    if (devices[destination]?.powerState !== "on") {
      return { success: false, reason: "Destination offline", log: [...log, "Destination device is powered off"] };
    }
    log.push(`[3] ${destination} is online`);

    // PROPERLY MERGE: destination config as well
    const destConfig = { ...devices[destination], ...(configEdits[destination] || {}) };
    if (!destConfig.ip) {
      return { success: false, reason: "Destination not configured", log };
    }
    log.push(`[4] Destination IP: ${destConfig.ip}`);

    // Check if same subnet
    if (sourceConfig.subnet === destConfig.subnet) {
      log.push(`[5] Same subnet - direct connection`);
      return { success: true, reason: "reachable", log };
    }

    // Check gateway
    if (!sourceConfig.gateway) {
      return { success: false, reason: "No gateway", log: [...log, "[5] ERROR: No gateway configured"] };
    }
    log.push(`[5] Gateway: ${sourceConfig.gateway}`);

    // Check routing path
    const path = findRoutePath(source, destination);
    if (!path.success) {
      return { success: false, reason: path.reason, log: [...log, `[6] ${path.reason}`] };
    }
    log.push(`[6] Path: ${path.route.join(" → ")}`);

    // Check all links in path
    for (let i = 0; i < path.route.length - 1; i++) {
      const from = path.route[i];
      const to = path.route[i + 1];
      const link = connections.find(c => (c.from === from && c.to === to) || (c.from === to && c.to === from));
      if (!link || !link.active) {
        return { success: false, reason: "Link down", log: [...log, `[7] ERROR: Link ${from}→${to} is inactive`] };
      }
    }
    log.push(`[7] All links active`);

    return { success: true, reason: "reachable", log };
  };

  // ============ UTILITY: Find Route Path ============
  const findRoutePath = (source, destination) => {
    const visited = new Set();
    const queue = [[source, [source]]];

    while (queue.length > 0) {
      const [current, path] = queue.shift();
      if (current === destination) {
        return { success: true, route: path };
      }

      if (visited.has(current)) continue;
      visited.add(current);

      for (const conn of connections) {
        let next = null;
        if (conn.from === current && conn.active) next = conn.to;
        else if (conn.to === current && conn.active) next = conn.from;

        if (next && !visited.has(next)) {
          queue.push([next, [...path, next]]);
        }
      }
    }

    return { success: false, reason: "No route to host" };
  };

  // ============ CLI: Execute Command ============
  const executeCommand = (device, cmd) => {
    const trimmed = cmd.trim();
    let output = "";
    let success = false;

    if (!trimmed) return;

    // Device switching
    if (trimmed.startsWith("device ")) {
      const newDevice = trimmed.split(" ")[1];
      if (devices[newDevice]) {
        setSelectedDevice(newDevice);
        output = `Connected to ${devices[newDevice].name}`;
        success = true;
      } else {
        output = `ERROR: Device '${newDevice}' not found`;
      }
    }
    // Show config
    else if (trimmed === "show config") {
      const cfg = devices[device];
      const cfg_edit = configEdits[device];
      output = `Device: ${cfg.name}
IP: ${cfg_edit?.ip || cfg.ip || "not configured"}
Gateway: ${cfg_edit?.gateway || cfg.gateway || "not configured"}
Subnet: ${cfg_edit?.subnet || cfg.subnet || "not configured"}
PowerState: ${cfg.powerState}`;
      success = true;
    }
    // IP address set
    else if (trimmed.startsWith("ip addr set")) {
      const ip = trimmed.split(" ")[3];
      setConfigEdits(prev => ({
        ...prev,
        [device]: { ...(prev[device] || {}), ip }
      }));
      setDevices(prev => ({
        ...prev,
        [device]: { ...prev[device], ip }
      }));
      output = `✓ IP set to ${ip}`;
      success = true;
      addDiagnosticLog(`${device}: IP updated to ${ip}`);
    }
    // Gateway set
    else if (trimmed.startsWith("ip route add default via")) {
      const gateway = trimmed.split(" ")[4];
      setConfigEdits(prev => ({
        ...prev,
        [device]: { ...(prev[device] || {}), gateway }
      }));
      setDevices(prev => ({
        ...prev,
        [device]: { ...prev[device], gateway }
      }));
      output = `✓ Default gateway set to ${gateway}`;
      success = true;
      addDiagnosticLog(`${device}: Gateway updated to ${gateway}`);

      // Check if network is fixed
      const validation = validateNetworkFixed();
      if (validation.fixed && storyProgress === 1) {
        addDiagnosticLog("SYSTEM: ✓ Network connectivity restored!");
        setNetworkStatus("healthy");
        setStoryProgress(2);
      }
    }
    // Show routes
    else if (trimmed === "show routes") {
      const routes = routingTables[device] || {};
      output = "Routing Table:\n";
      for (const [network, route] of Object.entries(routes)) {
        output += `  ${network} via ${route.nextHop}\n`;
      }
      if (Object.keys(routes).length === 0) output += "  (none)";
      success = true;
    }
    // Route add
    else if (trimmed.startsWith("route add")) {
      const parts = trimmed.split(" ");
      const network = parts[2];
      const via = parts[4];
      setRoutingTables(prev => ({
        ...prev,
        [device]: {
          ...(prev[device] || {}),
          [network]: { nextHop: via, interface: "eth0" }
        }
      }));
      output = `✓ Route added: ${network} via ${via}`;
      success = true;
      addDiagnosticLog(`${device}: Route added ${network} via ${via}`);

      // Check if network is fixed
      const validation = validateNetworkFixed();
      if (validation.fixed && storyProgress === 1) {
        addDiagnosticLog("SYSTEM: ✓ Network connectivity restored!");
        setNetworkStatus("healthy");
        setStoryProgress(2);
      }
    }
    // Ping
    else if (trimmed.startsWith("ping")) {
      const destIp = trimmed.split(" ")[1];
      let destDevice = null;

      for (const devName in devices) {
        if (devices[devName].ip === destIp) {
          destDevice = devName;
          break;
        }
      }

      if (!destDevice) {
        output = `✗ Cannot resolve ${destIp}`;
      } else {
        const result = canPing(device, destDevice);
        output = result.log.join("\n");
        if (result.success) {
          output += `\n✓ REPLY from ${destIp} - Connection successful!`;
          success = true;
          
          // CHECK IF NETWORK IS FIXED
          const validation = validateNetworkFixed();
          if (validation.fixed && storyProgress === 1) {
            addDiagnosticLog("SYSTEM: ✅ Network connectivity RESTORED! All misconfigurations fixed!");
            setNetworkStatus("healthy");
            setStoryProgress(2); // UNLOCK NEXT STEP
          }
        } else {
          output += `\n✗ ${result.reason}`;
        }
      }
    }
    // Traceroute
    else if (trimmed.startsWith("traceroute")) {
      const destIp = trimmed.split(" ")[1];
      let destDevice = null;

      for (const devName in devices) {
        if (devices[devName].ip === destIp) {
          destDevice = devName;
          break;
        }
      }

      if (!destDevice) {
        output = `✗ Cannot resolve ${destIp}`;
      } else {
        const path = findRoutePath(device, destDevice);
        if (path.success) {
          output = path.route.map((d, i) => `${i + 1}) ${d} (${devices[d].ip})`).join("\n");
          success = true;
        } else {
          output = `✗ ${path.reason}`;
        }
      }
    }
    // Unknown
    else {
      output = `✗ Unknown command: ${trimmed}`;
    }

    addToHistory(device, trimmed, output, success);
  };

  const addToHistory = (device, input, output, success) => {
    setCommandHistory(prev => ({
      ...prev,
      [device]: [...(prev[device] || []), { input, output, success }]
    }));
    setTimeout(() => {
      if (cliOutputRef.current) {
        cliOutputRef.current.scrollTop = cliOutputRef.current.scrollHeight;
      }
    }, 0);
  };

  // ============ CONFIG PANEL: Save Edits ============
  const saveDeviceConfig = () => {
    if (!selectedDeviceForConfig || !configEdits[selectedDeviceForConfig]) {
      setSelectedDeviceForConfig(null);
      return;
    }

    // Apply the edits to devices state
    setDevices(prev => ({
      ...prev,
      [selectedDeviceForConfig]: {
        ...prev[selectedDeviceForConfig],
        ...configEdits[selectedDeviceForConfig]
      }
    }));

    // Validate the device
    const validator = validateDevice(selectedDeviceForConfig);
    setValidationStatus(prev => ({
      ...prev,
      [selectedDeviceForConfig]: {
        isValid: validator.status === "ok",
        message: validator.message,
      }
    }));

    // Check if network is fixed
    const validation = validateNetworkFixed();
    if (validation.fixed && storyProgress === 1) {
      setNetworkStatus("healthy");
      setStoryProgress(2);
      addDiagnosticLog("SYSTEM: ✓ Network configuration fixed!");
    }

    setSelectedDeviceForConfig(null);
  };

  // ============ CONFIG PANEL: Handle Config Changes ============
  const handleConfigChange = (deviceId, edits) => {
    setConfigEdits(prev => ({
      ...prev,
      [deviceId]: edits
    }));
  };

  // ============ DEVICE PALETTE: Add New Device ============
  const handleAddDevice = (deviceTemplate, dropPos) => {
    const newDeviceId = `${deviceTemplate.id}-${Date.now()}`;
    setDevices(prev => ({
      ...prev,
      [newDeviceId]: {
        name: `${deviceTemplate.label}-${Object.keys(devices).length}`,
        zone: "user-added",
        powerState: "off",
        ip: null,
        gateway: null,
        subnet: null,
        x: dropPos.x,
        y: dropPos.y,
      }
    }));
  };

  // ============ RENDER ============
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#0a0e1a",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          backgroundColor: "rgba(0, 20, 40, 0.9)",
          borderBottom: "2px solid #00aaff",
          flex: "0 0 auto",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#00ff00" }}>
            🖥️ Data Center Boot Lab
          </h3>
          <p style={{ margin: "0", fontSize: "12px", color: "#aaa" }}>
            Status: {networkStatus.toUpperCase()} | Stage: {currentStage.toUpperCase()} | Messages: {messages.length}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {networkStatus === "offline" && (
            <button
              onClick={startBootSequence}
              style={{
                padding: "10px 24px",
                backgroundColor: "#00ff00",
                color: "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                boxShadow: "0 0 15px rgba(0, 255, 0, 0.4)",
              }}
            >
              ⚡ Boot System
            </button>
          )}
          {networkStatus !== "offline" && (
            <>
              <button
                onClick={() => setShowBootModal(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ffaa00",
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                📜 Boot Logs
              </button>
              <button
                onClick={() => {
                  runNetworkDiagnostics();
                  setShowDiagnosticsPanel(true);
                }}
                disabled={diagnosticsRunning}
                style={{
                  padding: "8px 16px",
                  backgroundColor: diagnosticsRunning ? "#666" : "#00aaff",
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: diagnosticsRunning ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  opacity: diagnosticsRunning ? 0.6 : 1,
                }}
              >
                {diagnosticsRunning ? "⏳ Running..." : "🔍 Diagnose"}
              </button>
              <button
                onClick={() => setShowMessagePanel(!showMessagePanel)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ff6600",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                📨 Messages ({messages.length})
              </button>
            </>
          )}
          {networkStatus === "booting" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ fontSize: "12px", color: "#ffaa00" }}>Booting({bootProgress}%)</div>
              <div style={{ width: "120px", height: "4px", backgroundColor: "rgba(255, 170, 0, 0.2)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${bootProgress}%`, height: "100%", backgroundColor: "#ffaa00", transition: "width 0.1s" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* LEFT PANEL - PROBLEM STATEMENT & GUIDED STEPS */}
        <div
          style={{
            width: problemPanelOpen ? "340px" : "0px",
            backgroundColor: "rgba(20, 40, 60, 0.95)",
            borderRight: problemPanelOpen ? "2px solid #ff6600" : "none",
            overflow: "hidden",
            transition: "width 0.3s ease",
            display: "flex",
            flexDirection: "column",
            boxShadow: problemPanelOpen ? "-5px 0 15px rgba(255, 102, 0, 0.15)" : "none",
          }}
        >
          <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
            {/* PROBLEM TITLE */}
            <h3 style={{ margin: "0 0 12px 0", color: "#ff6600", fontSize: "14px", borderBottom: "2px solid #ff6600", paddingBottom: "8px" }}>
              {problemStatement.title}
            </h3>

            {/* PROBLEM DESCRIPTION */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", color: "#00ffff", fontWeight: "bold", marginBottom: "4px" }}>
                Description
              </div>
              <div style={{ fontSize: "10px", color: "#ccc", lineHeight: "1.5" }}>
                {problemStatement.description}
              </div>
            </div>

            {/* OBJECTIVE */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", color: "#00ff00", fontWeight: "bold", marginBottom: "4px" }}>
                🎯 Objective
              </div>
              <div style={{ fontSize: "10px", color: "#ccc", lineHeight: "1.5" }}>
                {problemStatement.objective}
              </div>
            </div>

            {/* SYMPTOMS */}
            <div style={{ marginBottom: "14px", padding: "8px", backgroundColor: "rgba(255, 102, 0, 0.1)", borderLeft: "3px solid #ff6600", borderRadius: "2px" }}>
              <div style={{ fontSize: "11px", color: "#ffaa00", fontWeight: "bold", marginBottom: "4px" }}>
                ⚠️ Symptoms
              </div>
              {problemStatement.symptoms.map((sym, idx) => (
                <div key={idx} style={{ fontSize: "9px", color: "#ccc", marginBottom: "3px" }}>
                  {sym}
                </div>
              ))}
            </div>

            {/* GUIDED STEPS */}
            <div>
              <div style={{ fontSize: "11px", color: "#00ff00", fontWeight: "bold", marginBottom: "8px", borderBottom: "2px solid #00ff00", paddingBottom: "6px" }}>
                📋 Investigation Steps
              </div>
              {problemStatement.guidedSteps.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "10px",
                    borderRadius: "4px",
                    backgroundColor: step.locked ? "rgba(100, 100, 100, 0.1)" : "rgba(0, 255, 0, 0.08)",
                    border: `1px solid ${step.locked ? "#666" : "#00ff00"}`,
                    marginBottom: "8px",
                    fontSize: "9px",
                    lineHeight: "1.4",
                    color: step.locked ? "#666" : "#ccc",
                    opacity: step.locked ? 0.6 : 1,
                  }}
                >
                  <div style={{ color: step.locked ? "#666" : "#ffff00", fontWeight: "bold", marginBottom: "4px", fontSize: "10px" }}>
                    {step.title}
                  </div>
                  <div style={{ marginBottom: "4px", color: step.locked ? "#666" : "#00ffff" }}>
                    ➤ {step.action}
                  </div>
                  {step.details && (
                    <div style={{ marginBottom: "4px", color: step.locked ? "#666" : "#aaa", fontSize: "8px", lineHeight: "1.3" }}>
                      💬 {step.details}
                    </div>
                  )}
                  {step.problem && (
                    <div style={{ marginBottom: "4px", padding: "4px", backgroundColor: "rgba(255, 102, 0, 0.15)", borderLeft: "2px solid #ff6600", color: "#ff8844", fontSize: "8px", fontWeight: "bold" }}>
                      {step.problem}
                    </div>
                  )}
                  {step.missing && (
                    <div style={{ marginBottom: "4px", padding: "4px", backgroundColor: "rgba(255, 102, 0, 0.15)", borderLeft: "2px solid #ff6600", color: "#ff8844", fontSize: "8px", fontWeight: "bold" }}>
                      {step.missing}
                    </div>
                  )}
                  {step.fix && (
                    <div style={{ marginBottom: "4px", padding: "4px", backgroundColor: "rgba(0, 255, 0, 0.1)", borderLeft: "2px solid #00ff00", color: "#00ff00", fontSize: "8px", fontWeight: "bold" }}>
                      ✓ {step.fix}
                    </div>
                  )}
                  {step.success && (
                    <div style={{ marginBottom: "4px", padding: "4px", backgroundColor: "rgba(0, 255, 0, 0.15)", borderLeft: "2px solid #00ff00", color: "#00ff00", fontSize: "8px", fontWeight: "bold" }}>
                      {step.success}
                    </div>
                  )}
                  {step.expected && (
                    <div style={{ marginBottom: "4px", padding: "4px", backgroundColor: "rgba(0, 200, 255, 0.1)", borderLeft: "2px solid #00aaff", color: "#00ffff", fontSize: "8px", fontFamily: "Courier New", whiteSpace: "pre-wrap" }}>
                      Expected Output:\n{step.expected}
                    </div>
                  )}
                  {step.hint && (
                    <div style={{ fontSize: "8px", color: step.locked ? "#666" : "#ffaa00", marginBottom: "3px", fontStyle: "italic" }}>
                      💡 {step.hint}
                    </div>
                  )}
                  {step.cmd && (
                    <div style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", padding: "6px", borderRadius: "2px", fontFamily: "Courier New", fontSize: "8px", color: step.locked ? "#666" : "#00ff00", marginTop: "4px", border: "1px solid rgba(0, 255, 0, 0.3)" }}>
                      $ {step.cmd}
                    </div>
                  )}
                  {step.locked && (
                    <div style={{ fontSize: "8px", color: "#ff6600", marginTop: "4px", fontWeight: "bold" }}>
                      🔒 Locked - Complete all steps above first
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setProblePanelOpen(!problemPanelOpen)}
          style={{
            position: "absolute",
            left: problemPanelOpen ? "340px" : "0px",
            top: "70px",
            width: "28px",
            height: "50px",
            backgroundColor: "#ff6600",
            border: "none",
            borderRadius: "0 6px 6px 0",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            fontSize: "16px",
          }}
        >
          {problemPanelOpen ? "◀" : "▶"}
        </button>

        {/* CENTER - NETWORK DIAGRAM */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              padding: "12px 16px",
              fontSize: "12px",
              color: "#aaa",
              borderBottom: "1px solid #333",
              backgroundColor: "rgba(0, 20, 40, 0.5)",
            }}
          >
            Network Topology — Device Status: {Object.values(devices).filter(d => d.powerState === "on").length}/{Object.keys(devices).length} Online | Status: {networkStatus.toUpperCase()}
          </div>

          {/* NETWORK CONTAINER WITH REACT FLOW */}
          <NetworkCanvas
            devices={Object.entries(devices).reduce((acc, [key, dev]) => {
              acc[key] = {
                ...dev,
                misconfigured: validateDevice(key).status === "error",
              };
              return acc;
            }, {})}
            connections={connections}
            packets={packets}
            selectedDeviceForConfig={selectedDeviceForConfig}
            onNodeClick={(deviceId) => setSelectedDeviceForConfig(deviceId)}
            onAddDevice={handleAddDevice}
            onAddConnection={(connection) => setConnections(prev => [...prev, connection])}
          />
        </div>

        {/* RIGHT PANEL - DEVICE CONFIG */}
        {selectedDeviceForConfig && (
          <div
            style={{
              width: "280px",
              backgroundColor: "rgba(20, 40, 60, 0.95)",
              borderLeft: "2px solid #00ff00",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-5px 0 15px rgba(0, 255, 0, 0.15)",
            }}
          >
            <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
              <h4 style={{ margin: "0 0 12px 0", color: "#00ff00", fontSize: "13px", borderBottom: "2px solid #00ff00", paddingBottom: "8px" }}>
                ⚙️ {devices[selectedDeviceForConfig].name}
              </h4>

              {/* CONFIG FIELDS */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", color: "#aaa", marginBottom: "4px", fontWeight: "bold" }}>
                  IP Address
                </div>
                <div style={{ fontSize: "10px", color: "#ffaa00", marginBottom: "6px", padding: "4px", backgroundColor: "rgba(255, 170, 0, 0.1)", borderRadius: "2px" }}>
                  Expected: {devices[selectedDeviceForConfig].ip}
                </div>
                <input
                  type="text"
                  value={configEdits[selectedDeviceForConfig]?.ip || devices[selectedDeviceForConfig].ip || ""}
                  onChange={(e) => {
                    setConfigEdits(prev => ({
                      ...prev,
                      [selectedDeviceForConfig]: { ...(prev[selectedDeviceForConfig] || {}), ip: e.target.value }
                    }));
                  }}
                  style={{
                    width: "100%",
                    padding: "6px",
                    backgroundColor: "rgba(0, 255, 0, 0.05)",
                    border: "1px solid #00ff00",
                    borderRadius: "3px",
                    color: "#00ff00",
                    fontFamily: "Courier New",
                    fontSize: "9px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", color: "#aaa", marginBottom: "4px", fontWeight: "bold" }}>
                  Gateway
                </div>
                <div style={{ fontSize: "10px", color: "#ffaa00", marginBottom: "6px", padding: "4px", backgroundColor: "rgba(255, 170, 0, 0.1)", borderRadius: "2px" }}>
                  Expected: {devices[selectedDeviceForConfig].gateway || "(not set)"}
                </div>
                {devices[selectedDeviceForConfig].gateway !== (configEdits[selectedDeviceForConfig]?.gateway || devices[selectedDeviceForConfig].gateway) && (
                  <div style={{ fontSize: "9px", color: "#ff6600", marginBottom: "6px", padding: "4px", backgroundColor: "rgba(255, 102, 0, 0.1)", borderRadius: "2px", fontWeight: "bold" }}>
                    ⚠️ Current: {configEdits[selectedDeviceForConfig]?.gateway || devices[selectedDeviceForConfig].gateway}
                  </div>
                )}
                <input
                  type="text"
                  value={configEdits[selectedDeviceForConfig]?.gateway || devices[selectedDeviceForConfig].gateway || ""}
                  onChange={(e) => {
                    setConfigEdits(prev => ({
                      ...prev,
                      [selectedDeviceForConfig]: { ...(prev[selectedDeviceForConfig] || {}), gateway: e.target.value }
                    }));
                  }}
                  style={{
                    width: "100%",
                    padding: "6px",
                    backgroundColor: "rgba(0, 255, 0, 0.05)",
                    border: "1px solid #00ff00",
                    borderRadius: "3px",
                    color: "#00ff00",
                    fontFamily: "Courier New",
                    fontSize: "9px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", color: "#aaa", marginBottom: "4px", fontWeight: "bold" }}>
                  Subnet
                </div>
                <div style={{ fontSize: "10px", color: "#00ffff", padding: "6px", backgroundColor: "rgba(0, 255, 255, 0.05)", borderRadius: "2px", fontFamily: "Courier New" }}>
                  {devices[selectedDeviceForConfig].subnet}
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", color: "#aaa", marginBottom: "4px", fontWeight: "bold" }}>
                  Power State
                </div>
                <div style={{ fontSize: "10px", color: devices[selectedDeviceForConfig].powerState === "on" ? "#00ff00" : "#999", padding: "6px" }}>
                  {devices[selectedDeviceForConfig].powerState === "on" ? "🟢 Online" : "🔴 Offline"}
                </div>
              </div>

              {/* PROBLEM HINT */}
              {selectedDeviceForConfig === "pc1" && (
                <div style={{ padding: "8px", backgroundColor: "rgba(255, 102, 0, 0.1)", border: "1px solid #ff6600", borderRadius: "3px", marginTop: "12px" }}>
                  <div style={{ fontSize: "9px", color: "#ffaa00", fontWeight: "bold", marginBottom: "4px" }}>
                    ⚠️ Issue Detected
                  </div>
                  <div style={{ fontSize: "8px", color: "#ff8844", lineHeight: "1.3" }}>
                    PC-1 has an incorrect gateway configured. It cannot reach the datacenter servers with this setting. Update to the correct router gateway IP.
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #333" }}>
              <button
                onClick={saveDeviceConfig}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#00ff00",
                  color: "#000",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  borderRadius: "3px",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#00dd00"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#00ff00"}
              >
                ✓ Save Changes
              </button>
              <button
                onClick={() => {
                  setConfigEdits(prev => {
                    const updated = { ...prev };
                    delete updated[selectedDeviceForConfig];
                    return updated;
                  });
                  setSelectedDeviceForConfig(null);
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#666",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  borderRadius: "3px",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#888"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#666"}
              >
                ✕ Discard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOOT ALERT MODAL */}
      {showBootModal && bootProgress < 100 && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
        }}>
          <div style={{
            backgroundColor: "rgba(10, 20, 40, 0.95)",
            border: "2px solid #ff6600",
            borderRadius: "8px",
            padding: "32px",
            maxWidth: "500px",
            textAlign: "center",
            boxShadow: "0 0 40px rgba(255, 102, 0, 0.4)",
          }}>
            <h2 style={{ color: "#ff6600", fontSize: "22px", margin: "0 0 16px 0" }}>
              ⚠️ Network Alert
            </h2>
            <p style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px 0" }}>
              <strong>System is booting... Multiple misconfigurations detected.</strong>
            </p>
            <div style={{ backgroundColor: "rgba(255, 102, 0, 0.1)", border: "1px solid #ff6600", borderRadius: "4px", padding: "12px", marginBottom: "16px" }}>
              <div style={{ color: "#ffaa00", fontSize: "13px", marginBottom: "8px", fontWeight: "bold" }}>
                Problems Detected:
              </div>
              <div style={{ color: "#aaa", fontSize: "12px", textAlign: "left", lineHeight: "1.6" }}>
                • Some devices have incorrect network configurations<br/>
                • Critical routing information is missing<br/>
                • Gateway settings are misconfigured<br/>
              </div>
            </div>
            <p style={{ color: "#ffaa00", fontSize: "13px", fontWeight: "bold", margin: "0 0 16px 0" }}>
              🎯 Your Task:
            </p>
            <p style={{ color: "#ccc", fontSize: "13px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
              Identify all misconfigured devices and fix them one by one. Then restore full network connectivity by adding missing routes. Follow the Investigation Steps on the left panel for guidance.
            </p>
            <button
              onClick={() => setShowBootModal(false)}
              style={{
                padding: "12px 32px",
                backgroundColor: "#00ff00",
                color: "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#00dd00"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#00ff00"}
            >
              Understood - Let's Start! 
            </button>
          </div>
        </div>
      )}

      {/* BOOT LOGS MODAL */}
      {showBootModal && bootProgress >= 100 && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
        }}>
          <div style={{
            backgroundColor: "rgba(10, 20, 40, 0.95)",
            border: "2px solid #ffaa00",
            borderRadius: "8px",
            padding: "20px",
            maxWidth: "600px",
            maxHeight: "500px",
            overflowY: "auto",
            boxShadow: "0 0 40px rgba(255, 170, 0, 0.4)",
          }}>
            <h2 style={{ color: "#ffaa00", fontSize: "18px", margin: "0 0 12px 0" }}>
              📜 Boot Logs
            </h2>
            <div style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: "12px",
              borderRadius: "4px",
              fontFamily: "Courier New",
              fontSize: "11px",
              color: "#00ff00",
              lineHeight: "1.6",
              maxHeight: "350px",
              overflowY: "auto",
              border: "1px solid #ffaa00"
            }}>
              {bootLogs.length === 0 ? (
                <div style={{ color: "#666" }}>No boot logs yet. Click "⚡ Boot System" to start.</div>
              ) : (
                bootLogs.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: "2px" }}>
                    {log.includes("ALERT") || log.includes("ERROR") ? (
                      <span style={{ color: "#ff6600" }}>{log}</span>
                    ) : log.includes("✓") || log.includes("OK") ? (
                      <span style={{ color: "#00ff00" }}>{log}</span>
                    ) : log.includes("⚠") ? (
                      <span style={{ color: "#ffaa00" }}>{log}</span>
                    ) : (
                      <span style={{ color: "#00ff00" }}>{log}</span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowBootModal(false)}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#ffaa00",
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {showDiagnosticsPanel && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
        }}>
          <div style={{
            backgroundColor: "rgba(10, 20, 40, 0.95)",
            border: "2px solid #00aaff",
            borderRadius: "8px",
            padding: "20px",
            maxWidth: "600px",
            maxHeight: "500px",
            boxShadow: "0 0 40px rgba(0, 170, 255, 0.4)",
          }}>
            <h2 style={{ color: "#00aaff", fontSize: "18px", margin: "0 0 12px 0" }}>
              🔍 Network Diagnostics
            </h2>
            {diagnosticsRunning ? (
              <div style={{ color: "#ffaa00", fontSize: "12px", padding: "20px", textAlign: "center" }}>
                <div style={{ marginBottom: "12px" }}>Running connectivity tests...</div>
                <div style={{ display: "inline-block", width: "30px", height: "30px", border: "3px solid #00aaff", borderRadius: "50%", borderTop: "3px solid transparent", animation: "spin 1s linear infinite" }} />
              </div>
            ) : diagnosticsResults ? (
              <div>
                <div style={{ marginBottom: "12px", padding: "12px", backgroundColor: diagnosticsResults.healthy ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 102, 0, 0.1)", border: `1px solid ${diagnosticsResults.healthy ? "#00ff00" : "#ff6600"}`, borderRadius: "4px" }}>
                  <div style={{ color: diagnosticsResults.healthy ? "#00ff00" : "#ff6600", fontWeight: "bold", marginBottom: "4px" }}>
                    {diagnosticsResults.healthy ? "✓ Network Healthy" : "⚠ Network Issues Detected"}
                  </div>
                  <div style={{ color: "#aaa", fontSize: "11px" }}>
                    {diagnosticsResults.summary}
                  </div>
                </div>

                <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "12px" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "6px", color: "#00ffff" }}>Connectivity Results:</div>
                  {diagnosticsResults.results.map((result, idx) => (
                    <div key={idx} style={{ padding: "4px 8px", marginBottom: "3px", backgroundColor: "rgba(0, 0, 0, 0.3)", borderRadius: "2px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{result.name}</span>
                      <span style={{ color: result.success ? "#00ff00" : "#ff6600", fontWeight: "bold" }}>
                        {result.success ? "✓ OK" : "✗ " + result.reason}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "10px", color: "#666", marginBottom: "12px" }}>
                  Last run: {diagnosticsResults.timestamp}
                </div>
              </div>
            ) : (
              <div style={{ color: "#aaa", fontSize: "12px", padding: "20px", textAlign: "center" }}>
                Click "Run Diagnostics" to test network connectivity
              </div>
            )}
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <button
                onClick={() => showDiagnosticsPanel && setShowDiagnosticsPanel(false)}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#00aaff",
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Close
              </button>
              {!diagnosticsRunning && (
                <button
                  onClick={() => runNetworkDiagnostics()}
                  style={{
                    flex: 1,
                    padding: "8px",
                    backgroundColor: "#00ff00",
                    color: "#000",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Run Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE TRANSMISSION PANEL */}
      {showMessagePanel && (
        <div style={{
          position: "fixed",
          top: 70,
          right: 20,
          width: "350px",
          maxHeight: "400px",
          backgroundColor: "rgba(10, 20, 40, 0.95)",
          border: "2px solid #ff6600",
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 0 20px rgba(255, 102, 0, 0.3)",
          overflowY: "auto",
          zIndex: 400
        }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#ff6600", fontSize: "14px" }}>
            📨 Message Transmission
          </h3>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px", fontWeight: "bold" }}>
              From Device:
            </label>
            <select
              value={messageSourceDevice}
              onChange={(e) => setMessageSourceDevice(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "rgba(0, 255, 0, 0.05)",
                border: "1px solid #00ff00",
                borderRadius: "3px",
                color: "#00ff00",
                fontSize: "10px",
                fontFamily: "Courier New",
                boxSizing: "border-box",
              }}
            >
              {Object.entries(devices).map(([key, dev]) => (
                <option key={key} value={key}>{dev.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px", fontWeight: "bold" }}>
              To Device:
            </label>
            <select
              value={messageDestDevice}
              onChange={(e) => setMessageDestDevice(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "rgba(0, 255, 0, 0.05)",
                border: "1px solid #00ff00",
                borderRadius: "3px",
                color: "#00ff00",
                fontSize: "10px",
                fontFamily: "Courier New",
                boxSizing: "border-box",
              }}
            >
              {Object.entries(devices).map(([key, dev]) => (
                <option key={key} value={key}>{dev.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => sendMessage(messageSourceDevice, messageDestDevice)}
            disabled={messageSourceDevice === messageDestDevice}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: messageSourceDevice === messageDestDevice ? "#666" : "#00ff00",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              cursor: messageSourceDevice === messageDestDevice ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "12px",
              opacity: messageSourceDevice === messageDestDevice ? 0.5 : 1,
            }}
          >
            🚀 Send Message
          </button>

          <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "8px", fontWeight: "bold", borderBottom: "1px solid #333", paddingBottom: "6px" }}>
            Recent Messages ({messages.length})
          </div>

          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {messages.length === 0 ? (
              <div style={{ fontSize: "10px", color: "#666", textAlign: "center", padding: "12px" }}>
                No messages sent yet
              </div>
            ) : (
              messages.slice().reverse().slice(0, 10).map((msg) => (
                <div key={msg.id} style={{
                  padding: "8px",
                  marginBottom: "6px",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderLeft: `3px solid ${msg.status === "success" ? "#00ff00" : "#ff6600"}`,
                  borderRadius: "2px",
                  fontSize: "9px"
                }}>
                  <div style={{ color: msg.status === "success" ? "#00ff00" : "#ff6600", fontWeight: "bold", marginBottom: "2px" }}>
                    {msg.status === "success" ? "✓" : "✗"} {devices[msg.from]?.name} → {devices[msg.to]?.name}
                  </div>
                  <div style={{ color: "#aaa", fontSize: "8px" }}>
                    {msg.message}
                  </div>
                  <div style={{ color: "#666", fontSize: "8px", marginTop: "2px" }}>
                    {msg.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TERMINAL PANEL WITH XTERM.JS */}
      <TerminalPanel
        terminalOpen={terminalOpen}
        selectedDevice={selectedDevice}
        devices={devices}
        onDeviceChange={setSelectedDevice}
        onCommandExecute={executeCommand}
        commandHistory={commandHistory}
        bootLogs={bootLogs}
      />

      {/* EXIT BUTTON */}
      <button
        onClick={close}
        style={{
          position: "fixed",
          bottom: terminalOpen ? "200px" : "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#ff6600",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold",
          zIndex: 200,
        }}
      >
        Exit
      </button>
    </div>
  );
}
