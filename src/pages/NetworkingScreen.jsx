import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import "./NetworkingScreen.css";

 // ============================================
// GLOBAL NODE → PROBLEM MAP
// ============================================
// SINGLE SOURCE OF TRUTH - All problem IDs mapped by node ID
// Problem numbers remain consistent throughout the entire application
const NODE_PROBLEM_MAP = {
  // Problem 1: VLAN & Trunk Misconfiguration (affects all 4 switches)
  // Problem 9: Shutdown Interfaces (affects 3 access switches)
  "ho-access-switch-1": [1, 9],
  "ho-access-switch-2": [1, 9],
  "ho-access-switch-3": [1, 9],

  // Problem 3: Inter-VLAN Routing Disabled (affects core switch)
  // Problem 1: VLAN & Trunk Misconfiguration (affects core switch)
  "ho-core-switch": [1, 3],

  // Problem 2: Wrong Default Gateway on PCs
  "ho-pc-hr": [2],

  // Problem 8: Duplicate IP Addresses
  "ho-pc-it-2": [8],

  // Problem 4: Missing Static Routes
  "branch-a-router": [4],

  // Problem 5: OSPF Misconfiguration
  "branch-b-router": [5],

  // Problem 6: DNS Server Misconfiguration
  "dns-server": [6],

  // Problem 7: NAT Rules Incomplete
  "edge-router": [7],
};

// ============================================
// PROBLEM → MODE MAP (single source of truth)
// ============================================
const PROBLEM_MODE_MAP = {
  1: "vlan",
  2: "pc",
  3: "routing",
  4: "routing-static",
  5: "routing-ospf",
  6: "dns",
  7: "nat",
  8: "pc-ip",
  9: "interface-status",
};

// Helper function to get problems for a node
const getProblemsForNode = (nodeId) => {
  return NODE_PROBLEM_MAP[nodeId] || [];
};

// Device name labels for Hawkins-themed UI
const DEVICE_LABELS = {
  "ho-core-switch": "Hawkins School",
  "ho-access-switch-1": "Mike's House",
  "ho-access-switch-2": "Dustin's House",
  "ho-access-switch-3": "Lucas's House",
  "ho-pc-hr": "Mike's Room",
  "ho-pc-it-2": "Dustin's PC",
  "ho-pc-it-1": "Dustin's Setup",
  "dns-server": "Hawkins Lab",
  "edge-router": "Hawkins Gateway",
  "branch-a-router": "Military Base",
  "branch-b-router": "Military Compound",
};

// Helper: build initial terminal output per mode
function buildTerminalOutput(mode, deviceId = null, problemTitle = null) {
  switch (mode) {
    case "routing":
      return [
        "╔════════════════════════════════════════════════╗",
        "║   HO-Core-Switch – Layer 3 Routing Config     ║",
        "╚════════════════════════════════════════════════╝",
        "",
        "# PROBLEM 3: Inter-VLAN Routing Disabled",
        "# To solve, configure routing in the following order:",
        "#",
        "# 1. configure terminal",
        "# 2. ip routing",
        "# 3. interface vlan 10",
        "# 4. ip address 192.168.1.1 255.255.255.0",
        "# 5. interface vlan 20",
        "# 6. ip address 192.168.2.1 255.255.255.0",
        "# 7. interface vlan 30",
        "# 8. ip address 192.168.3.1 255.255.255.0",
        "# 9. show interfaces vlan",
        "",
        "HO-Core-Switch> ",
      ];
    case "routing-static": {
      const deviceName = deviceId ? (DEVICE_LABELS[deviceId] || deviceId) : "Remote Router";
      const problem = problemTitle || "Missing Static Routes";
      const headerText = `🛣️ ${deviceName} – ${problem}`.padEnd(50);
      return [
        "╔════════════════════════════════════════════════╗",
        `║ ${headerText.substring(0, 48)} ║`,
        "╚════════════════════════════════════════════════╝",
        "",
        `# 🚨 ${problem.toUpperCase()}`,
        "# Communication lost to Hawkins School",
        "# Eleven cannot reach her friends through this path",
        "# Restore the routing connection...",
        "#",
        "# To solve, configure static routes:",
        "#",
        "# 1. configure terminal",
        "# 2. ip route 192.168.1.0 255.255.255.0 203.0.113.1",
        "# 3. ip route 10.0.0.0 255.255.255.0 203.0.113.1",
        "# 4. ip route 172.17.0.0 255.255.255.0 203.0.113.1",
        "# 5. show ip route",
        "",
        "# NOTE: Routes can be added in any order after 'configure terminal'",
        "",
        `${deviceName}> `,
      ];
    }
    case "routing-ospf":
      return [
        "╔════════════════════════════════════════════════╗",
        "║   Military Compound – OSPF Routing Config       ║",
        "╚════════════════════════════════════════════════╝",
        "",
        "# PROBLEM 5: OSPF Misconfiguration (Branch B)",
        "# To solve, configure OSPF in the following order:",
        "#",
        "# 1. configure terminal",
        "# 2. router ospf 1",
        "# 3. network 172.17.0.0 0.0.0.255 area 0",
        "# 4. network 203.0.113.0 0.0.0.255 area 0",
        "# 5. show ip ospf neighbor",
        "",
        "# NOTE: Network commands can be in any order after 'router ospf 1'",
        "",
        "Branch-B-Router> ",
      ];
    case "nat":
      return [
        "╔════════════════════════════════════════════════╗",
        "║   Edge-Router – NAT Configuration             ║",
        "╚════════════════════════════════════════════════╝",
        "",
        "# PROBLEM 7: NAT Configuration Missing",
        "# To solve, configure NAT with the following steps:",
        "#",
        "# 1. configure terminal",
        "# 2. ip nat inside source list ACL_INTERNAL interface GigabitEthernet0 overload",
        "# 3. access-list 1 permit 192.168.0.0 0.0.255.255",
        "# 4. access-list 1 permit 172.16.0.0 0.0.15.255",
        "# 5. access-list 1 permit 10.0.0.0 0.0.255.255",
        "# 6. interface GigabitEthernet1",
        "# 7. ip nat inside",
        "# 8. interface GigabitEthernet0",
        "# 9. ip nat outside",
        "# 10. show ip nat statistics",
        "",
        "Edge-Router> ",
      ];
    case "pc":
      return [
        "╔════════════════════════════════════════════════╗",
        "║   PC Configuration Terminal                   ║",
        "╚════════════════════════════════════════════════╝",
        "",
        "# AVAILABLE COMMANDS:",
        "# ─────────────────────────────────────────────────",
        "#  set gateway <IP>     Configure default gateway",
        "#  ping <IP>            Test connectivity",
        "#  save                 Save configuration",
        "#  help                 Show this message",
        "#  exit                 Close terminal",
        "",
        "# STATUS: Ready to configure",
        "# ─────────────────────────────────────────────────",
        "",
      ];
    default:
      return [];
  }
}

// ============================================
// DEVICE CONFIGURATION PANEL COMPONENT
// ============================================


function DeviceConfigPanel({ device, config, onConfigChange, onClose, onApply, validationErrors, setValidationErrors, configMessage, setConfigMessage, terminalInput, setTerminalInput, terminalOutput, onTerminalCommand, selectedProblemForDevice, mode, dnsConfig, setDnsConfig, solvedProblems, setSolvedProblems, natState, setNatState, pcConfig, setPcConfig, interfaceState, setInterfaceState, problem, getDeviceLabel, addStoryPopup, setSignalStrength }) {
  // ============================================
  // SAFETY GUARDS (CRITICAL)
  // ============================================
  console.log(`📊 DeviceConfigPanel rendering - Device: ${device}, Mode: "${mode}", Problem: ${selectedProblemForDevice}`);
  
  // Guard 1: Check if mode exists
  if (!mode) {
    console.error("❌ ERROR: mode is undefined or null");
    return (
      <div className="device-config-panel" style={{ backgroundColor: '#1a1a1a', border: '2px solid #ff6600' }}>
        <div className="config-header">
          <h3 style={{ color: '#ff6600' }}>⚠️ Missing Configuration Mode</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>
        <div className="config-body" style={{ padding: '20px', color: '#ccc' }}>
          <p>❌ Error: No mode specified for this problem</p>
          <p>Device: {device}</p>
          <p>Mode: {mode ? mode : '(undefined)'}</p>
          <p>Problem: {selectedProblemForDevice ? selectedProblemForDevice : '(not set)'}</p>
        </div>
        <div className="config-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // Guard 2: Check if device exists
  if (!device) {
    console.error("❌ ERROR: device is undefined");
    return (
      <div className="device-config-panel" style={{ backgroundColor: '#1a1a1a', border: '2px solid #ff6600' }}>
        <div className="config-header">
          <h3 style={{ color: '#ff6600' }}>⚠️ No Device Selected</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>
        <div className="config-body" style={{ padding: '20px', color: '#ccc' }}>
          <p>❌ Error: No device specified</p>
        </div>
        <div className="config-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // ========================================
  // ROUTING MODE (PROBLEM 3 - TERMINAL CLI)
  // ========================================
  if (mode === "routing") {
    return (
      <div className="device-config-panel">
        <div className="config-header">
          <h3>🛣️ Layer 3 Routing Configuration - CLI Terminal</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        {solvedProblems?.has(3) && (
          <div className="success-message-banner">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">PROBLEM 3 SOLVED! ✅ Routing Enabled!</span>
          </div>
        )}

        <div className="terminal-container routing-terminal">
          <div className="terminal-output">
            {terminalOutput.map((line, idx) => (
              <div key={idx} className="terminal-line">{line === "" ? "\u00a0" : line}</div>
            ))}
          </div>
          <div className="terminal-input-line">
            <span className="terminal-prompt">{`>`}</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onTerminalCommand(terminalInput);
                }
              }}
              className="terminal-input"
              autoFocus
              placeholder="Enter command..."
            />
          </div>
        </div>

        <div className="config-footer">
          <button className="btn-cancel" onClick={onClose}>Close Terminal</button>
        </div>
      </div>
    );
  }

  // ========================================
  // STATIC ROUTING MODE (PROBLEM 4 - BRANCH A)
  // ========================================
  if (mode === "routing-static") {
    return (
      <div className="device-config-panel">
        <div className="config-header">
          <h3>🛣️ Static Routing Configuration - CLI Terminal</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        {solvedProblems?.has(4) && (
          <div className="success-message-banner">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">PROBLEM 4 SOLVED! ✅ Static Routes Configured!</span>
          </div>
        )}

        <div className="terminal-container routing-terminal">
          <div className="terminal-output">
            {terminalOutput.map((line, idx) => (
              <div key={idx} className="terminal-line">{line === "" ? "\u00a0" : line}</div>
            ))}
          </div>
          <div className="terminal-input-line">
            <span className="terminal-prompt">{`>`}</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onTerminalCommand(terminalInput);
                }
              }}
              className="terminal-input"
              autoFocus
              placeholder="Enter command..."
            />
          </div>
        </div>

        <div className="config-footer">
          <button className="btn-cancel" onClick={onClose}>Close Terminal</button>
        </div>
      </div>
    );
  }

  // ========================================
  // OSPF ROUTING MODE (PROBLEM 5 - BRANCH B)
  // ========================================
  if (mode === "routing-ospf") {
    return (
      <div className="device-config-panel">
        <div className="config-header">
          <h3>🛣️ OSPF Routing Configuration - CLI Terminal</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        {solvedProblems?.has(5) && (
          <div className="success-message-banner">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">PROBLEM 5 SOLVED! ✅ OSPF Configured!</span>
          </div>
        )}

        <div className="terminal-container routing-terminal">
          <div className="terminal-output">
            {terminalOutput.map((line, idx) => (
              <div key={idx} className="terminal-line">{line === "" ? "\u00a0" : line}</div>
            ))}
          </div>
          <div className="terminal-input-line">
            <span className="terminal-prompt">{`>`}</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onTerminalCommand(terminalInput);
                }
              }}
              className="terminal-input"
              autoFocus
              placeholder="Enter command..."
            />
          </div>
        </div>

        <div className="config-footer">
          <button className="btn-cancel" onClick={onClose}>Close Terminal</button>
        </div>
      </div>
    );
  }

  // ========================================
  // PC MODE (PROBLEM 2 - GATEWAY CONFIG)
  // ========================================
  if (mode === "pc") {
    return (
      <div className="device-config-panel">
        <div className="config-header">
          <h3>🖥️ PC Configuration Terminal</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        {solvedProblems?.has(2) && (
          <div className="success-message-banner">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">PROBLEM 2 SOLVED! ✅ Gateway Configuration Fixed!</span>
          </div>
        )}

        <div className="terminal-container">
          <div className="terminal-output">
            {terminalOutput.map((line, idx) => (
              <div key={idx} className="terminal-line">{line === "" ? "\u00a0" : line}</div>
            ))}
          </div>
          <div className="terminal-input-line">
            <span className="terminal-prompt">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onTerminalCommand(terminalInput);
                }
              }}
              className="terminal-input"
              autoFocus
              placeholder="Type 'help' for commands"
            />
          </div>
        </div>

        <div className="config-footer">
          <button className="btn-cancel" onClick={onClose}>Close Terminal</button>
        </div>
      </div>
    );
  }

  // ========================================
  // VLAN MODE (PROBLEM 1 - GUI SWITCHES)
  // ========================================
  if (mode === "vlan") {
    console.log("✅ VLAN MODE - Rendering interface configuration UI");
    console.log(`   Device: ${device}, isSwitchDevice: ${device.includes("switch")}`);
    console.log(`   Config:`, config);
    
    const isSwitchDevice = device.includes("switch");

    // VLAN VALIDATION FUNCTION
    const validateVLANConfig = (deviceId, deviceConfig) => {
      const errors = {};

      if (deviceId === "ho-access-switch-1") {
        if (deviceConfig.interfaces?.Gi0_1?.mode !== "trunk") {
          errors.Gi0_1 = "Must be set to Trunk Port";
        }
        if (deviceConfig.interfaces?.Gi0_2?.mode !== "access") {
          errors.Gi0_2 = "Must be set to Access Port";
        }
        if (deviceConfig.interfaces?.Gi0_2?.vlan !== "10") {
          errors.vlan = "Must be VLAN 10 (Mike's House)";
        }
      } else if (deviceId === "ho-access-switch-2") {
        if (deviceConfig.interfaces?.Gi0_1?.mode !== "trunk") {
          errors.Gi0_1 = "Must be set to Trunk Port";
        }
        if (deviceConfig.interfaces?.Gi0_2?.mode !== "access") {
          errors.Gi0_2 = "Must be set to Access Port";
        }
        if (deviceConfig.interfaces?.Gi0_2?.vlan !== "20") {
          errors.vlan = "Must be VLAN 20 (Dustin's House)";
        }
      } else if (deviceId === "ho-access-switch-3") {
        if (deviceConfig.interfaces?.Gi0_1?.mode !== "trunk") {
          errors.Gi0_1 = "Must be set to Trunk Port";
        }
        if (deviceConfig.interfaces?.Gi0_2?.mode !== "access") {
          errors.Gi0_2 = "Must be set to Access Port";
        }
        if (deviceConfig.interfaces?.Gi0_2?.vlan !== "30") {
          errors.vlan = "Must be VLAN 30 (Lucas's House)";
        }
      } else if (deviceId === "ho-core-switch") {
        if (deviceConfig.interfaces?.Gi0_1?.mode !== "trunk") {
          errors.Gi0_1 = "Must be set to Trunk Port";
        }
        if (deviceConfig.interfaces?.Gi0_2?.mode !== "trunk") {
          errors.Gi0_2 = "Must be set to Trunk Port";
        }
        if (deviceConfig.interfaces?.Gi0_3?.mode !== "trunk") {
          errors.Gi0_3 = "Must be set to Trunk Port";
        }
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    };

    // APPLY BUTTON HANDLER WITH VALIDATION
    const handleApplyClick = () => {
      console.log(`🔍 VALIDATING VLAN CONFIG for device: "${device}"`);
      console.log(`   Config:`, config);

      const validation = validateVLANConfig(device, config);
      console.log(`   Validation result:`, validation);

      if (!validation.isValid) {
        console.log(`❌ VALIDATION FAILED:`, validation.errors);
        setValidationErrors(validation.errors);
        setConfigMessage({ type: "error", text: `❌ Configuration has errors. Check requirements above.` });
        return;
      }

      console.log(`✅ VALIDATION PASSED! Calling onApply()`);
      setValidationErrors({});
      if (onApply) {
        onApply();
      }
    };

    return (
      <div className="device-config-panel">
        <div className="config-header">
          <h3>⚙️ Configure Device - VLAN & Trunk Settings</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>

        {/* SUCCESS MESSAGE BANNER FOR PROBLEM 1 */}
        {solvedProblems?.has(1) && (
          <div className="success-message-banner">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">PROBLEM 1 SOLVED! ✅ VLAN Configuration Complete!</span>
          </div>
        )}

        {/* CONFIGURATION MESSAGE (Success or Error) - DISPLAYED INSIDE PANEL */}
        {configMessage && (
          <>
            {/* SUCCESS MESSAGE */}
            {configMessage.type === "success" && (
              <div style={{backgroundColor: '#c8e6c9', padding: '15px', borderRadius: '5px', marginBottom: '15px', borderLeft: '4px solid #4caf50'}}>
                <h4 style={{margin: '0 0 8px 0', color: '#2e7d32', fontSize: '16px'}}>
                  ✅ {configMessage.text}
                </h4>
                <p style={{margin: '0', color: '#558b2f', fontSize: '14px'}}>
                  Device configuration applied successfully. Closing panel in 2 seconds...
                </p>
              </div>
            )}
            {/* ERROR MESSAGE */}
            {configMessage.type === "error" && (
              <div style={{backgroundColor: '#ffcdd2', padding: '15px', borderRadius: '5px', marginBottom: '15px', borderLeft: '4px solid #f44336'}}>
                <h4 style={{margin: '0', color: '#c62828', fontSize: '16px'}}>
                  ❌ {configMessage.text}
                </h4>
              </div>
            )}
          </>
        )}

        <div className="config-body">
          <div className="config-section">
            <label className="config-label">Device:</label>
            <p className="config-value">{getDeviceLabel(device)}</p>
          </div>

          {isSwitchDevice && (
            <div className="config-section">
              <h4>🔌 Interface Configuration</h4>
              
              {/* Gi0/1 - Uplink */}
              <div className="interface-config">
                <label>Gi0/1 (Uplink to Core)</label>
                <div className="control-group">
                  <select
                    value={config.interfaces?.Gi0_1?.mode || "access"}
                    onChange={(e) => {
                      setValidationErrors({});
                      setConfigMessage(null);
                      onConfigChange({
                        interfaces: {
                          ...config.interfaces,
                          Gi0_1: { ...config.interfaces?.Gi0_1, mode: e.target.value }
                        }
                      });
                    }}
                    className="config-select"
                  >
                    <option value="access">Access Port</option>
                    <option value="trunk">Trunk Port</option>
                  </select>
                </div>
                {validationErrors?.Gi0_1 && (
                  <p className="error-message">❌ {validationErrors.Gi0_1}</p>
                )}
              </div>

              {/* Gi0/2 - Access Port */}
              <div className="interface-config">
                <label>Gi0/2 (Access Port)</label>
                <div className="control-group">
                  <select
                    value={config.interfaces?.Gi0_2?.mode || "access"}
                    onChange={(e) => {
                      setValidationErrors({});
                      setConfigMessage(null);
                      onConfigChange({
                        interfaces: {
                          ...config.interfaces,
                          Gi0_2: { ...config.interfaces?.Gi0_2, mode: e.target.value }
                        }
                      });
                    }}
                    className="config-select"
                  >
                    <option value="access">Access Port</option>
                    <option value="trunk">Trunk Port</option>
                  </select>
                </div>

                {config.interfaces?.Gi0_2?.mode === "access" && (
                  <div className="control-group">
                    <label>VLAN ID:</label>
                    <select
                      value={config.interfaces?.Gi0_2?.vlan || ""}
                      onChange={(e) => {
                        setValidationErrors({});
                        setConfigMessage(null);
                        onConfigChange({
                          interfaces: {
                            ...config.interfaces,
                            Gi0_2: { ...config.interfaces?.Gi0_2, vlan: e.target.value }
                          }
                        });
                      }}
                      className="config-select"
                    >
                      <option value="">-- Select VLAN --</option>
                      <option value="10">VLAN 10 (Mike's House)</option>
                      <option value="20">VLAN 20 (Dustin's House)</option>
                      <option value="30">VLAN 30 (Lucas's House)</option>
                    </select>
                  </div>
                )}
                {validationErrors?.Gi0_2 && (
                  <p className="error-message">❌ {validationErrors.Gi0_2}</p>
                )}
                {validationErrors?.vlan && (
                  <p className="error-message">❌ {validationErrors.vlan}</p>
                )}
              </div>

              {/* Gi0/3 - For Core Switch */}
              {device === "ho-core-switch" && (
                <div className="interface-config">
                  <label>Gi0/3 (Uplink)</label>
                  <div className="control-group">
                    <select
                      value={config.interfaces?.Gi0_3?.mode || "access"}
                      onChange={(e) => {
                        setValidationErrors({});
                        setConfigMessage(null);
                        onConfigChange({
                          interfaces: {
                            ...config.interfaces,
                            Gi0_3: { ...config.interfaces?.Gi0_3, mode: e.target.value }
                          }
                        });
                      }}
                      className="config-select"
                    >
                      <option value="access">Access Port</option>
                      <option value="trunk">Trunk Port</option>
                    </select>
                  </div>
                  {validationErrors?.Gi0_3 && (
                    <p className="error-message">❌ {validationErrors.Gi0_3}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VLAN CONFIGURATION STATUS */}
          <div className="config-section" style={{backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '5px', marginTop: '15px', borderLeft: '4px solid #2196F3'}}>
            <h4 style={{margin: '0 0 10px 0', color: '#0277bd'}}>📊 Configuration Status</h4>
            <ul style={{margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#555'}}>
              <li>{config.interfaces?.Gi0_1?.mode ? '✅' : '⏳'} Gi0/1 (Uplink): {config.interfaces?.Gi0_1?.mode || 'Not configured'}</li>
              <li>{config.interfaces?.Gi0_2?.mode && (config.interfaces?.Gi0_2?.mode === 'trunk' || config.interfaces?.Gi0_2?.vlan) ? '✅' : '⏳'} Gi0/2 (Access): {config.interfaces?.Gi0_2?.mode || 'Not configured'} {config.interfaces?.Gi0_2?.vlan ? `[VLAN ${config.interfaces?.Gi0_2?.vlan}]` : ''}</li>
              {device === "ho-core-switch" && (
                <li>{config.interfaces?.Gi0_3?.mode ? '✅' : '⏳'} Gi0/3 (Uplink): {config.interfaces?.Gi0_3?.mode || 'Not configured'}</li>
              )}
            </ul>
          </div>

          {/* VALIDATION ERRORS DISPLAY */}
          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <div className="config-section" style={{backgroundColor: '#ffebee', padding: '15px', borderRadius: '5px', marginTop: '15px', borderLeft: '4px solid #f44336'}}>
              <h4 style={{margin: '0 0 10px 0', color: '#c62828'}}>❌ Configuration Errors</h4>
              <ul style={{margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#b71c1c'}}>
                {Object.entries(validationErrors).map(([key, error]) => (
                  <li key={key}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="config-footer">
          <button className="btn-apply" onClick={handleApplyClick}>✓ Apply Configuration</button>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  // ========================================
  // DNS MODE (PROBLEM 6 - DNS SERVER CONFIG)
  // ========================================
  if (mode === "dns") {
    const isConfigValid = 
      dnsConfig.zone === "technova.local" &&
      dnsConfig.records.webserver === "10.0.0.50" &&
      dnsConfig.records.db === "10.0.1.50" &&
      dnsConfig.serviceReloaded;

    return (
      <div className="device-config-panel">
        <div className="config-header">
          <h3>🔍 DNS Server Configuration</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        {solvedProblems?.has(6) && (
          <div className="success-message-banner">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">PROBLEM 6 SOLVED! ✅ DNS Configured Successfully!</span>
          </div>
        )}

        <div className="config-body">
          <div className="config-section">
            <label className="config-label">Device:</label>
            <p className="config-value">{getDeviceLabel(device)}</p>
          </div>

          {/* Zone Configuration */}
          <div className="config-section">
            <h4>📋 Zone Configuration</h4>
            
            <div className="control-group">
              <label>Zone Name:</label>
              <input
                type="text"
                value={dnsConfig.zone}
                onChange={(e) => setDnsConfig({ ...dnsConfig, zone: e.target.value })}
                placeholder="technova.local"
                className="config-input"
              />
              {dnsConfig.zone && dnsConfig.zone !== "technova.local" && (
                <p className="error-message">❌ Zone must be: technova.local</p>
              )}
            </div>
          </div>

          {/* DNS A Records */}
          <div className="config-section">
            <h4>🗂️ DNS Records (A Records)</h4>
            
            <div className="dns-record-row">
              <div className="record-hostname">
                <label>Hostname:</label>
                <span className="readonly-hostname">webserver</span>
              </div>
              <div className="record-ip">
                <label>IP Address:</label>
                <input
                  type="text"
                  value={dnsConfig.records.webserver}
                  onChange={(e) => setDnsConfig({
                    ...dnsConfig,
                    records: { ...dnsConfig.records, webserver: e.target.value }
                  })}
                  placeholder="10.0.0.50"
                  className="config-input"
                />
                {dnsConfig.records.webserver && dnsConfig.records.webserver !== "10.0.0.50" && (
                  <p className="error-message">❌ Expected: 10.0.0.50</p>
                )}
              </div>
            </div>

            <div className="dns-record-row">
              <div className="record-hostname">
                <label>Hostname:</label>
                <span className="readonly-hostname">db</span>
              </div>
              <div className="record-ip">
                <label>IP Address:</label>
                <input
                  type="text"
                  value={dnsConfig.records.db}
                  onChange={(e) => setDnsConfig({
                    ...dnsConfig,
                    records: { ...dnsConfig.records, db: e.target.value }
                  })}
                  placeholder="10.0.1.50"
                  className="config-input"
                />
                {dnsConfig.records.db && dnsConfig.records.db !== "10.0.1.50" && (
                  <p className="error-message">❌ Expected: 10.0.1.50</p>
                )}
              </div>
            </div>
          </div>

          {/* Service Control */}
          <div className="config-section">
            <h4>⚙️ Service Control</h4>
            
            <button
              className={`btn-service ${dnsConfig.serviceReloaded ? "success" : ""}`}
              onClick={() => {
                if (dnsConfig.zone === "technova.local" && 
                    dnsConfig.records.webserver === "10.0.0.50" && 
                    dnsConfig.records.db === "10.0.1.50") {
                  setDnsConfig({ ...dnsConfig, serviceReloaded: true });
                } else {
                  alert("❌ Please configure zone and records correctly first");
                }
              }}
            >
              {dnsConfig.serviceReloaded ? "✓ DNS Service Reloaded" : "🔄 Reload DNS Service"}
            </button>
          </div>

          {/* Test DNS */}
          {dnsConfig.serviceReloaded && (
            <div className="config-section">
              <h4>🧪 Test DNS Resolution</h4>
              
              <div className="control-group">
                <label>Domain Name to Resolve:</label>
                <input
                  type="text"
                  value={dnsConfig.testDomain}
                  onChange={(e) => setDnsConfig({ ...dnsConfig, testDomain: e.target.value })}
                  placeholder="webserver.technova.local"
                  className="config-input"
                />
              </div>

              <button
                className="btn-test"
                onClick={() => {
                  if (dnsConfig.testDomain === "webserver.technova.local") {
                    setDnsConfig({ ...dnsConfig, nslookupResult: "success" });
                    setSolvedProblems(new Set([...solvedProblems, 6]));
                    setSignalStrength(prev => Math.min(100, prev + 9));
                    addStoryPopup("🎉 DNS connection restored!", "left", "info");
                    addStoryPopup("Eleven: I hear the signal...", "right", "info");
                    setConfigMessage({ type: "success", text: "✅ Problem 6 solved! DNS configured successfully." });
                  } else {
                    setDnsConfig({ ...dnsConfig, nslookupResult: "failed" });
                  }
                }}
              >
                🔍 Run nslookup
              </button>

              {dnsConfig.nslookupResult && (
                <div className="nslookup-output">
                  {dnsConfig.nslookupResult === "success" ? (
                    <>
                      <div className="output-line">Server: 10.0.0.1</div>
                      <div className="output-line">Name: webserver.technova.local</div>
                      <div className="output-line">Address: 10.0.0.50</div>
                      <div className="output-line" style={{marginTop: '10px', fontWeight: 'bold', color: '#4caf50'}}>
                        ✅ DNS Configured Successfully!
                      </div>
                      <div className="output-line" style={{marginTop: '5px', fontWeight: 'bold', color: '#4caf50'}}>
                        ✅ PROBLEM 6 SOLVED!
                      </div>
                    </>
                  ) : (
                    <div className="output-line" style={{color: '#f44336', fontWeight: 'bold'}}>
                      ❌ DNS resolution failed. Check domain name and click 'Run nslookup' again.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="config-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // ========================================
  // NAT MODE (PROBLEM 7 - HYBRID UI)
  // ========================================
  if (mode === "nat") {
    const isFullyConfigured = 
      natState.natRuleAdded &&
      natState.insideInterfaces.length > 0 &&
      natState.outsideInterface !== null &&
      natState.aclNetworks.includes("192.168.0.0/16") &&
      natState.aclNetworks.includes("172.16.0.0/12") &&
      natState.aclNetworks.includes("10.0.0.0/8");

    return (
      <div className="device-config-panel">
        <div className="config-header">
          <h3>⚙️ NAT Configuration</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        {solvedProblems?.has(7) && (
          <div className="success-message-banner">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">PROBLEM 7 SOLVED! ✅ NAT Rules Configured!</span>
          </div>
        )}

        <div className="config-body">
          <div className="config-section">
            <label className="config-label">Device:</label>
            <p className="config-value">{getDeviceLabel(device)}</p>
          </div>

          {/* CLI TERMINAL */}
          <div className="config-section">
            <h4>💻 CLI Terminal – NAT Commands</h4>
            
            <div className="terminal-container routing-terminal" ref={(el) => {
              if (el) setTimeout(() => {
                const output = el.querySelector('.terminal-output');
                if (output) output.scrollTop = output.scrollHeight;
              }, 0);
            }}>
              <div className="terminal-output" style={{minHeight: '200px', maxHeight: '300px', overflowY: 'auto', backgroundColor: '#000', color: '#0f0', fontFamily: 'monospace', padding: '10px', borderRadius: '4px'}}>
                {terminalOutput.map((line, idx) => (
                  <div key={idx} className="terminal-line">{line === "" ? "\u00a0" : line}</div>
                ))}
              </div>
              <div className="terminal-input-line">
                <span className="terminal-prompt">{`>`}</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      onTerminalCommand(terminalInput);
                    }
                  }}
                  className="terminal-input"
                  autoFocus
                  placeholder="Enter command..."
                />
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="config-section" style={{backgroundColor: isFullyConfigured ? '#e8f5e9' : '#fff3e0', padding: '10px', borderRadius: '5px', marginTop: '15px'}}>
            <h4>✓ Configuration Checklist</h4>
            <ul style={{margin: '10px 0', fontSize: '13px', listStylePosition: 'inside'}}>
              <li>{natState.insideInterfaces.length > 0 ? '✓' : '✗'} Inside interfaces configured</li>
              <li>{natState.outsideInterface ? '✓' : '✗'} Outside interface configured</li>
              <li>{natState.natRuleAdded ? '✓' : '✗'} NAT rule added</li>
              <li>{natState.aclNetworks.includes("192.168.0.0/16") ? '✓' : '✗'} ACL: 192.168.0.0/16</li>
              <li>{natState.aclNetworks.includes("172.16.0.0/12") ? '✓' : '✗'} ACL: 172.16.0.0/12</li>
              <li>{natState.aclNetworks.includes("10.0.0.0/8") ? '✓' : '✗'} ACL: 10.0.0.0/8</li>
            </ul>
          </div>
        </div>

        <div className="config-footer">
          <p style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
            {isFullyConfigured ? '✅ All requirements met!' : '⚠️ Complete all steps in the CLI terminal'}
          </p>
          <button className="btn-cancel" onClick={onClose}>Close Terminal</button>
        </div>
      </div>
    );
  }

  // ========================================
  // PC IP CONFIGURATION MODE (PROBLEM 8 - GUI FORM)
  // ========================================
  if (mode === "pc-ip") {
    const isDuplicateIP = pcConfig.ip === "192.168.1.25";
    const isValidSubnet = pcConfig.subnet === "255.255.255.0";
    const isValidGateway = pcConfig.gateway === "192.168.1.1";
    const isCorrectIP = pcConfig.ip === "192.168.1.51";
    const isFullyConfigured = isCorrectIP && isValidSubnet && isValidGateway && pcConfig.networkRestarted;

    return (
      <div className="device-config-panel">
        <div className="config-header">
          <h3>🖥️ Network Configuration – IT Workstation 2</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        {solvedProblems?.has(8) && (
          <div className="success-message-banner">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">PROBLEM 8 SOLVED! ✅ IP Conflict Resolved!</span>
          </div>
        )}

        <div className="config-body">
          <div className="config-section">
            <label className="config-label">Device:</label>
            <p className="config-value">{getDeviceLabel(device)}</p>
          </div>

          {/* DUPLICATE IP WARNING */}
          {isDuplicateIP && (
            <div style={{
              backgroundColor: '#fff3e0',
              border: '2px solid #ff9800',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <p style={{margin: 0, color: '#e65100', fontWeight: 'bold', fontSize: '13px'}}>
                ⚠️ DUPLICATE IP DETECTED
              </p>
              <p style={{margin: '4px 0 0 0', color: '#ff6f00', fontSize: '12px'}}>
                IP 192.168.1.25 is already in use by IT-PC-1. Choose a different IP address.
              </p>
            </div>
          )}

          {/* IP ADDRESS CONFIGURATION FORM */}
          <div className="config-section">
            <h4>📋 Network Settings</h4>

            <div className="network-setting-row">
              <label className="setting-label">IP Address:</label>
              <input
                type="text"
                value={pcConfig.ip}
                onChange={(e) => setPcConfig({ ...pcConfig, ip: e.target.value })}
                placeholder="e.g., 192.168.1.51"
                className="setting-input"
              />
              {isDuplicateIP && (
                <p style={{color: '#d32f2f', fontSize: '12px', margin: '4px 0 0 0', fontWeight: 'bold'}}>
                  ❌ Duplicate IP: 192.168.1.25 is in use by IT-PC-1
                </p>
              )}
              {!isDuplicateIP && !isCorrectIP && pcConfig.ip && (
                <p style={{color: '#ff9800', fontSize: '12px', margin: '4px 0 0 0'}}>
                  💡 Suggested IP: 192.168.1.51
                </p>
              )}
              {isCorrectIP && (
                <p style={{color: '#4caf50', fontSize: '12px', margin: '4px 0 0 0', fontWeight: 'bold'}}>
                  ✓ Valid IP address selected
                </p>
              )}
            </div>

            <div className="network-setting-row">
              <label className="setting-label">Subnet Mask:</label>
              <input
                type="text"
                value={pcConfig.subnet}
                onChange={(e) => setPcConfig({ ...pcConfig, subnet: e.target.value })}
                placeholder="255.255.255.0"
                className="setting-input"
              />
              {isValidSubnet ? (
                <p style={{color: '#4caf50', fontSize: '12px', margin: '4px 0 0 0'}}>✓ Correct</p>
              ) : (
                <p style={{color: '#d32f2f', fontSize: '12px', margin: '4px 0 0 0'}}>❌ Expected: 255.255.255.0</p>
              )}
            </div>

            <div className="network-setting-row">
              <label className="setting-label">Default Gateway:</label>
              <input
                type="text"
                value={pcConfig.gateway}
                onChange={(e) => setPcConfig({ ...pcConfig, gateway: e.target.value })}
                placeholder="192.168.1.1"
                className="setting-input"
              />
              {isValidGateway ? (
                <p style={{color: '#4caf50', fontSize: '12px', margin: '4px 0 0 0'}}>✓ Correct</p>
              ) : (
                <p style={{color: '#d32f2f', fontSize: '12px', margin: '4px 0 0 0'}}>❌ Expected: 192.168.1.1</p>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="config-section">
            <h4>⚙️ Network Actions</h4>

            <button
              className="btn-network-action"
              onClick={() => {
                if (isDuplicateIP) {
                  setConfigMessage({ type: "error", text: "❌ Cannot save: Duplicate IP detected. Change IP to 192.168.1.51" });
                } else if (!isValidSubnet || !isValidGateway) {
                  setConfigMessage({ type: "error", text: "❌ Invalid network settings. Check subnet and gateway." });
                } else {
                  setConfigMessage({ type: "success", text: "✅ Network configuration saved" });
                }
              }}
              style={{marginBottom: '10px'}}
            >
              💾 Save Configuration
            </button>

            <button
              className="btn-network-action"
              onClick={() => {
                if (isDuplicateIP || !isValidSubnet || !isValidGateway) {
                  setConfigMessage({ type: "error", text: "❌ Cannot restart: Fix configuration errors first" });
                } else {
                  setPcConfig({ ...pcConfig, networkRestarted: true });
                  setConfigMessage({ type: "success", text: "🔄 Network restarted successfully" });
                }
              }}
              style={{marginBottom: '10px'}}
            >
              🔄 Restart Network
            </button>

            <button
              className="btn-network-action"
              onClick={() => {
                if (isDuplicateIP) {
                  setConfigMessage({ type: "error", text: "❌ Conflict detected: 192.168.1.25 used by multiple devices" });
                } else {
                  if (isFullyConfigured) {
                    setConfigMessage({ type: "success", text: "✅ ARP Table verified: No IP conflicts detected" });
                    setSolvedProblems(new Set([...solvedProblems, 8]));
                    setSignalStrength(prev => Math.min(100, prev + 9));
                    addStoryPopup("✅ IP conflict resolved!", "left", "info");
                    addStoryPopup("Eleven: Network stability restored...", "right", "info");
                    setConfigMessage({ type: "success", text: "✅ Problem 8 solved! Duplicate IP issue resolved." });
                  } else {
                    setConfigMessage({ type: "error", text: "⚠️ Complete all configuration steps first" });
                  }
                }
              }}
            >
              🔍 Check ARP Table
            </button>
          </div>

          {/* CONFIGURATION CHECKLIST */}
          <div className="config-section" style={{
            backgroundColor: isFullyConfigured ? '#e8f5e9' : '#fff3e0',
            padding: '10px',
            borderRadius: '5px',
            marginTop: '15px'
          }}>
            <h4>✓ Configuration Status</h4>
            <ul style={{margin: '10px 0', fontSize: '13px', listStylePosition: 'inside'}}>
              <li>{isDuplicateIP ? '✗' : '✓'} No duplicate IP detected</li>
              <li>{isCorrectIP ? '✓' : '✗'} IP set to 192.168.1.51</li>
              <li>{isValidSubnet ? '✓' : '✗'} Subnet mask correct (255.255.255.0)</li>
              <li>{isValidGateway ? '✓' : '✗'} Gateway correct (192.168.1.1)</li>
              <li>{pcConfig.networkRestarted ? '✓' : '✗'} Network restarted</li>
            </ul>
          </div>
        </div>

        <div className="config-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // ========================================
  // INTERFACE STATUS MODE (PROBLEM 9 - SIMPLE UI)
  // ========================================
  if (mode === "interface-status") {
    const deviceStatus = interfaceState[device] || { Gi0_1: "shutdown" };
    const isShutdown = deviceStatus.Gi0_1 === "shutdown";

    // Check if ALL switches have uplinks enabled
    const allEnabled = 
      interfaceState["ho-access-switch-1"]?.Gi0_1 === "no shutdown" &&
      interfaceState["ho-access-switch-2"]?.Gi0_1 === "no shutdown" &&
      interfaceState["ho-access-switch-3"]?.Gi0_1 === "no shutdown";

    return (
      <div className="device-config-panel">
        <div className="config-header">
          <h3>🔌 Interface Status Control</h3>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        {solvedProblems?.has(9) && (
          <div className="success-message-banner">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">PROBLEM 9 SOLVED! ✅ All Interfaces Enabled!</span>
          </div>
        )}

        <div className="config-body">
          <div className="config-section">
            <label className="config-label">Device:</label>
            <p className="config-value">{getDeviceLabel(device)}</p>
          </div>

          {/* INTERFACE CONTROL */}
          <div className="config-section">
            <h4>🔄 Uplink Interface Configuration</h4>

            <div className="interface-control-panel">
              <div className="interface-row">
                <div className="interface-info">
                  <span className="interface-name">GigabitEthernet 0/1</span>
                  <span className="interface-desc">Uplink to Core Switch</span>
                </div>

                <div className="interface-status-indicator">
                  {isShutdown ? (
                    <div className="status-badge shutdown">
                      🔴 Shutdown
                    </div>
                  ) : (
                    <div className="status-badge active">
                      🟢 Active
                    </div>
                  )}
                </div>

                <div className="interface-controls">
                  <button
                    className={`btn-interface ${!isShutdown ? 'active' : ''}`}
                    onClick={() => {
                      setInterfaceState({
                        ...interfaceState,
                        [device]: {
                          ...deviceStatus,
                          Gi0_1: "no shutdown"
                        }
                      });
                      setConfigMessage({ type: "success", text: "✓ Interface enabled" });
                    }}
                  >
                    ✓ No Shutdown
                  </button>
                  <button
                    className={`btn-interface ${isShutdown ? 'active' : ''}`}
                    onClick={() => {
                      setInterfaceState({
                        ...interfaceState,
                        [device]: {
                          ...deviceStatus,
                          Gi0_1: "shutdown"
                        }
                      });
                      setConfigMessage({ type: "warning", text: "⚠️ Interface disabled" });
                    }}
                  >
                    ✗ Shutdown
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* VERIFICATION SECTION */}
          <div className="config-section">
            <h4>✓ Verification</h4>

            <button
              className="btn-verify-interface"
              onClick={() => {
                if (isShutdown) {
                  setConfigMessage({ type: "error", text: "❌ Interface Gi0/1 is down" });
                } else {
                  if (allEnabled) {
                    setConfigMessage({ type: "success", text: "✅ All uplink interfaces are active" });
                    setSolvedProblems(new Set([...solvedProblems, 9]));
                    setSignalStrength(prev => Math.min(100, prev + 9));
                    addStoryPopup("🌟 All interfaces restored!", "left", "info");
                    addStoryPopup("Eleven: I can feel the connection...", "right", "info");
                  } else {
                    setConfigMessage({ 
                      type: "warning", 
                      text: "⚠️ This interface is active, but not all switches are configured yet" 
                    });
                  }
                }
              }}
            >
              Check Interface Status
            </button>
          </div>

          {/* STATUS SUMMARY */}
          <div className="status-card">
            <h4>📊 All Switches Status</h4>
            <div className="status-item">
              <span>Mike's House Switch (Gi0/1)</span>
              <span>{interfaceState["ho-access-switch-1"]?.Gi0_1 === "no shutdown" ? '🟢 Active' : '🔴 Shutdown'}</span>
            </div>
            <div className="status-item">
              <span>IT Switch (Gi0/1)</span>
              <span>{interfaceState["ho-access-switch-2"]?.Gi0_1 === "no shutdown" ? '🟢 Active' : '🔴 Shutdown'}</span>
            </div>
            <div className="status-item">
              <span>Sales Switch (Gi0/1)</span>
              <span>{interfaceState["ho-access-switch-3"]?.Gi0_1 === "no shutdown" ? '🟢 Active' : '🔴 Shutdown'}</span>
            </div>
            {allEnabled && (
              <div style={{marginTop: '12px', padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', textAlign: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '13px', borderLeft: '3px solid #10b981'}}>
                ✅ All uplinks are active
              </div>
            )}
          </div>
        </div>

        <div className="config-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // ========================================
  // DEFAULT/UNKNOWN MODE - SHOW HELPFUL MESSAGE
  // ========================================
  console.warn(`⚠️ Unknown configuration mode: "${mode}" for device: "${device}"`);
  console.warn(`Expected modes: "vlan", "pc", "routing", "routing-static", "routing-ospf", "dns", "nat", "pc-ip", "interface-status"`);
  console.warn(`SelectedProblem: ${selectedProblemForDevice}`);
  
  return (
    <div className="device-config-panel" style={{
      backgroundColor: '#1a1a1a',
      borderLeft: '4px solid #ff6600',
      minWidth: '500px'
    }}>
      <div className="config-header" style={{
        borderBottom: '2px solid #ff6600'
      }}>
        <h3 style={{color: '#ff6600'}}>⚠️ Configuration Loading Issue</h3>
        <button className="config-close" onClick={onClose}>✕</button>
      </div>

      <div className="config-body" style={{
        padding: '20px',
         minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div className="config-section" style={{
          backgroundColor: 'rgba(255, 102, 0, 0.1)',
          border: '1px solid #ff6600',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <p style={{
            color: '#ff9800',
            fontWeight: 'bold',
            margin: '0 0 12px 0',
            fontSize: '14px'
          }}>
            ⚠️ Troubleshooting Information
          </p>
          
          <div style={{
            fontSize: '12px',
            color: '#ccc',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '12px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <div><strong>Device:</strong> {device}</div>
            <div><strong>Mode:</strong> {mode || '(undefined)'}</div>
            <div><strong>Problem:</strong> {selectedProblemForDevice || '(not set)'}</div>
            <div style={{marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '8px'}}>
              <strong>Status:</strong> Configuration panel is initializing
            </div>
          </div>

          <p style={{
            color: '#aaa',
            margin: '0',
            fontSize: '12px',
            lineHeight: '1.6'
          }}>
            The configuration interface is loading. <strong>Please try these steps:</strong>
            <br/>1. Close this dialog (click X button)
            <br/>2. Click on the device again
            <br/>3. Select the problem you want to configure
            <br/><br/>If the issue persists, <strong>refresh the page</strong> and try again.
          </p>
        </div>

        <div className="config-section">
          <p style={{
            color: '#666',
            fontSize: '11px',
            margin: '0',
            fontStyle: 'italic'
          }}>
            Technical Details: Check browser console (F12) for error messages
          </p>
        </div>
      </div>

      <div className="config-footer" style={{
        borderTop: '1px solid #333',
        padding: '12px',
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button className="btn-cancel" onClick={onClose} style={{
          minWidth: '120px'
        }}>Close and Retry</button>
      </div>
    </div>
  );
}

// ============================================
// PROBLEM SELECTION MODAL COMPONENT
// ============================================
function ProblemSelectionModal({ deviceId, problems, onSelectProblem, onClose, problemsData, solvedProblems }) {
  if (!deviceId || !problems || problems.length === 0) return null;

  const getProblemTitle = (problemId) => {
    const problem = problems?.find(p => p.id === problemId);
    return problem?.title || `Problem ${problemId}`;
  };

  const isSolved = (problemId) => solvedProblems?.has(problemId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="problem-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Configuration Task</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            This device has {problems.length} associated problem{problems.length > 1 ? 's' : ''}. 
            Select one to configure:
          </p>

          <div className="problems-list">
            {problems.map((problem) => (
              <button
                key={problem.id}
                className={`problem-option ${isSolved(problem.id) ? 'solved' : ''}`}
                onClick={() => onSelectProblem(problem)}
              >
                <span className="problem-id">[{problem.id}]</span>
                <span className="problem-title">{problem.title}</span>
                {isSolved(problem.id) && <span style={{marginLeft: 'auto', color: '#4caf50', fontSize: '18px'}}>✅ SOLVED</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STORY POPUP COMPONENT (STRANGER THINGS THEME)
// ============================================
function StoryPopupContainer({ popups }) {
  return (
    <>
      {/* LEFT SIDE - HAWKINS FRIENDS */}
      <div className="story-popup-container left">
        {popups.filter(p => p.side === "left").map(popup => (
          <div key={popup.id} className={`story-popup ${popup.type}`}>
            {popup.text}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE - UPSIDE DOWN / ELEVEN */}
      <div className="story-popup-container right">
        {popups.filter(p => p.side === "right").map(popup => (
          <div key={popup.id} className={`story-popup ${popup.type} glitch`}>
            {popup.text}
          </div>
        ))}
      </div>
    </>
  );
}

function CustomNode({ data, selected }) {
  const problemBadges = data.problems || [];
  const highlighted = data.highlighted || false;
  const nodeType = data.nodeType || "default";
  const isGroup = data.isGroup || false;

  // Determine shape class based on device type
  const shapeClass = `node-${nodeType}`;
  const className = `custom-node ${shapeClass} ${selected ? "selected" : ""} ${highlighted ? "highlighted" : ""} ${isGroup ? "group-node" : ""}`;

  // Get icon emoji based on node type
  const getIcon = () => {
    switch (nodeType) {
      case "router": return "🛣️";
      case "switch": return "🔀";
      case "server": return "🖥️";
      case "database": return "🗄️";
      case "workstation": return "💻";
      case "internet": return "☁️";
      case "datacenter": return "📦";
      default: return "📡";
    }
  };

  const isConfigurable = data.isConfigurable;

  return (
    <div 
      className={className} 
      style={data.style}
      onClick={isConfigurable && data.onDeviceClick ? () => data.onDeviceClick(data.deviceId) : undefined}
      title={isConfigurable ? "Click to configure" : ""}
    >
      {!isGroup && <Handle position={Position.Top} type="target" />}
      <div className="node-icon">{getIcon()}</div>
      <div className="node-label">{data.label}</div>
      {data.sublabel && <div className="node-sublabel">{data.sublabel}</div>}
      {problemBadges.length > 0 && (
        <div className="problem-badges-container">
          {problemBadges.map((problemId) => (
            <button
              key={problemId}
              className="problem-badge"
              onClick={(e) => {
                e.stopPropagation();
                if (data.onBadgeClick) {
                  data.onBadgeClick(problemId, data.deviceId);
                }
              }}
              title={`Problem ${problemId}`}
            >
              {problemId}
            </button>
          ))}
        </div>
      )}
      {!isGroup && <Handle position={Position.Bottom} type="source" />}
    </div>
  );
}

export default function NetworkingScreen({ close = () => {}, onTaskComplete = () => {} }) {
  return (
    <ReactFlowProvider>
      <NetworkingScreenInner close={close} onTaskComplete={onTaskComplete} />
    </ReactFlowProvider>
  );
}

function NetworkingScreenInner({ close, onTaskComplete }) {
  const navigate = useNavigate();
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [configuredDevices, setConfiguredDevices] = useState({}); // Track configured devices per problem
  const [highlightedProblems, setHighlightedProblems] = useState(new Set());
  const [problemsPanel, setProblemsPanelOpen] = useState(false);

  // ============================================
  // UNIFIED ACTIVE CONFIG STATE (replaces selectedDevice + configMode + selectedProblem)
  // activeConfig = { deviceId, problem, mode } | null
  // ============================================
  const [activeConfig, setActiveConfig] = useState(null);

  // ============================================
  // PROBLEM SELECTOR MODAL
  // problemSelector = { deviceId, problems: [problemObj,...] } | null
  // ============================================
  const [problemSelector, setProblemSelector] = useState(null);

  const [deviceConfigs, setDeviceConfigs] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [configMessage, setConfigMessage] = useState(null);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [routingState, setRoutingState] = useState({
    routingEnabled: false,
    vlans: { 10: false, 20: false, 30: false }
  });
  const [routingStep, setRoutingStep] = useState(0);
  const [terminalMode, setTerminalMode] = useState("user");
  const [currentVlan, setCurrentVlan] = useState(null);

  // Problem 4: Static Routing State
  const [staticRoutes, setStaticRoutes] = useState({
    "192.168.1.0": false,
    "10.0.0.0": false,
    "172.17.0.0": false
  });
  const [staticRoutingConfigMode, setStaticRoutingConfigMode] = useState(false);

  // Problem 5: OSPF State
  const [ospfState, setOspfState] = useState({
    configMode: false,
    ospfEnabled: false,
    networks: {
      "172.17.0.0": false,
      "203.0.113.0": false
    }
  });

  // Problem 6: DNS Configuration State
  const [dnsConfig, setDnsConfig] = useState({
    zone: "",
    records: {
      webserver: "",
      db: ""
    },
    serviceReloaded: false,
    nslookupResult: null,
    testDomain: ""
  });

  // Problem 7: NAT Configuration State
  const [natState, setNatState] = useState({
    configMode: false,
    natRuleAdded: false,
    insideInterfaces: [],
    outsideInterface: null,
    aclNetworks: [],
    currentInterface: null
  });

  // Problem 8: PC IP Configuration State
  const [pcConfig, setPcConfig] = useState({
    ip: "192.168.1.25",
    subnet: "255.255.255.0",
    gateway: "192.168.1.1",
    networkRestarted: false
  });

  // Problem 9: Interface Status State
  const [interfaceState, setInterfaceState] = useState({
    "ho-access-switch-1": { Gi0_1: "shutdown" },
    "ho-access-switch-2": { Gi0_1: "shutdown" },
    "ho-access-switch-3": { Gi0_1: "shutdown" }
  });

  // ============================================
  // STRANGER THINGS THEME STATE
  // ============================================
  const [signalStrength, setSignalStrength] = useState(20);
  const [dangerLevel, setDangerLevel] = useState(0); // 0-4 scale
  const [storyPopups, setStoryPopups] = useState([]);
  let popupCounter = useState(0)[0]; // For generating unique IDs

  const addStoryPopup = (text, side = "left", type = "info") => {
    const id = Math.random();
    const newPopup = { id, text, side, type };
    setStoryPopups(prev => {
      const updated = [...prev, newPopup];
      return updated.length > 3 ? updated.slice(-3) : updated;
    });
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setStoryPopups(prev => prev.filter(p => p.id !== id));
    }, 5000);
  };

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // Create mapping of problems to affected devices
  const createProblemMapping = () => ({
    1: ["ho-core-switch", "ho-access-switch-1", "ho-access-switch-2", "ho-access-switch-3"],
    2: ["ho-pc-hr"],
    3: ["ho-core-switch"],
    4: ["branch-a-router"],
    5: ["branch-b-router"],
    6: ["dns-server"],
    7: ["edge-router"],
    8: ["ho-pc-it-2"],
    9: ["ho-access-switch-1", "ho-access-switch-2", "ho-access-switch-3"],
  });

  const problemMapping = createProblemMapping();

  // Helper function to add a configured device for a problem
  const addConfiguredDevice = (problemId, deviceId) => {
    setConfiguredDevices(prev => ({
      ...prev,
      [problemId]: new Set([...(prev[problemId] || []), deviceId])
    }));
  };

  // Helper function to check if a problem is fully solved (all devices configured)
  const isProblemFullySolved = (problemId) => {
    const affectedDevices = problemMapping[problemId] || [];
    const configured = configuredDevices[problemId] || new Set();
    return affectedDevices.length > 0 && affectedDevices.every(device => configured.has(device));
  };

  // Helper function to get progress text for a problem
  const getProblemProgress = (problemId) => {
    const affectedDevices = problemMapping[problemId] || [];
    const configured = configuredDevices[problemId] || new Set();
    return `${configured.size}/${affectedDevices.length}`;
  };

  // Helper to get device display name
  const getDeviceLabel = (deviceId) => {
    const labels = {
      "ho-core-switch": "Hawkins School",
      "ho-access-switch-1": "Mike's House",
      "ho-access-switch-2": "Dustin's House",
      "ho-access-switch-3": "Lucas's House",
      "ho-pc-hr": "Mike's Room",
      "ho-pc-it-2": "Dustin's House PC",
      "ho-pc-it-1": "Dustin's Setup",
      "dns-server": "Hawkins Lab",
      "edge-router": "Upside Down Gateway",
      "branch-a-router": "Byers House",
      "branch-b-router": "Hopper's Cabin"
    };
    return labels[deviceId] || deviceId;
  };

  const getDeviceDisplayName = getDeviceLabel;

  const problems = [
    {
      id: 1,
      title: "VLAN & Trunk Misconfiguration",
      location: "Hawkins School - Network Core",
      problem: "Trunk ports configured as access ports. VLAN traffic cannot cross switches between Mike's House, Dustin's House, and Lucas's House networks.",
      solution: "Configure trunk ports (802.1Q) on core and access switches. Set access ports to individual VLANs (10, 20, 30).",
      affectedDevices: ["ho-core-switch", "ho-access-switch-1", "ho-access-switch-2", "ho-access-switch-3"],
      steps: [
        "Open Core Switch config: interface range Gi0/1-3 → switchport mode trunk",
        "Configure Mike's House Switch: interface Gi0/1 → switchport mode trunk",
        "Configure Dustin's House Switch: interface Gi0/1 → switchport mode trunk",
        "Configure Lucas's House Switch: interface Gi0/1 → switchport mode trunk",
        "Verify: show interfaces trunk",
      ],
    },
    {
      id: 2,
      title: "Wrong Default Gateway on PCs",
      location: "Mike's House - Workstation",
      problem: "PC in Mike's House has gateway 192.168.1.99 but should be 192.168.1.254. Cannot reach servers.",
      solution: "Correct the default gateway on the PC in Mike's House to the Layer 3 switch IP address.",
      affectedDevices: ["ho-pc-hr"],
      steps: [
        "Open Network Settings on PC in Mike's House",
        "Modify IPv4 Settings: Gateway = 192.168.1.254",
        "Save and test with ping 10.0.0.50",
        "Verify connectivity to servers",
      ],
    },
    {
      id: 3,
      title: "Inter-VLAN Routing Disabled",
      location: "Hawkins School - Router Core",
      problem: "Layer 3 switch missing 'ip routing' command. VLANs isolated even with correct configurations.",
      solution: "Enable routing on the Layer 3 switch and configure VLAN interfaces.",
      affectedDevices: ["ho-core-switch"],
      steps: [
        "Enter config mode: School-Router# configure terminal",
        "Enable routing: ip routing",
        "Create VLAN interfaces: interface vlan 10 / ip address 192.168.1.1 255.255.255.0",
        "Repeat for VLANs 20 and 30",
        "Verify: show interfaces vlan 10/20/30",
      ],
    },
    {
      id: 4,
      title: "Missing Static Routes (Byers House)",
      location: "Byers House - Router",
      problem: "Byers House router has no static routes to Hawkins School. Byers House isolated from School and Hawkins Lab.",
      solution: "Add static routes on Byers House router pointing to School and Lab subnets via edge router.",
      affectedDevices: ["branch-a-router"],
      steps: [
        "Byers-Router# configure terminal",
        "Add route: ip route 192.168.1.0 255.255.255.0 203.0.113.1",
        "Add route: ip route 10.0.0.0 255.255.255.0 203.0.113.1",
        "Add route: ip route 172.17.0.0 255.255.255.0 203.0.113.1",
        "Verify: show ip route",
      ],
    },
    {
      id: 5,
      title: "OSPF Misconfiguration (Hopper's Cabin)",
      location: "Hopper's Cabin - Router",
      problem: "OSPF not advertising networks or missing neighbor relationships. Hopper's Cabin routes not converged.",
      solution: "Configure OSPF on Hopper's Cabin router to advertise all networks and establish neighbors.",
      affectedDevices: ["branch-b-router"],
      steps: [
        "Hopper-Router# configure terminal",
        "router ospf 1",
        "network 172.17.0.0 0.0.0.255 area 0",
        "network 203.0.113.0 0.0.0.255 area 0",
        "Verify: show ip ospf neighbor",
      ],
    },
    {
      id: 6,
      title: "DNS Server Misconfiguration",
      location: "Hawkins Lab - DNS Server",
      problem: "PCs can access resources by IP but cannot resolve domain names (e.g., webserver.hawkins.local).",
      solution: "Configure DNS zone files and verify DNS service is responding to queries.",
      affectedDevices: ["dns-server"],
      steps: [
        "DNS-Server# configure zone hawkins.local",
        "Add A records: webserver → 10.0.0.50, db → 10.0.1.50",
        "Reload DNS service",
        "Test: nslookup webserver.hawkins.local 10.0.0.1",
      ],
    },
    {
      id: 7,
      title: "NAT Rules Incomplete",
      location: "Upside Down Gateway - Edge Router",
      problem: "Some sites cannot access external networks. NAT rules only translate partial networks to public IPs.",
      solution: "Add complete NAT rules to translate all internal subnets to public IP.",
      affectedDevices: ["edge-router"],
      steps: [
        "Gateway-Router# configure terminal",
        "ip nat inside source list ACL_INTERNAL interface GigabitEthernet0 overload",
        "Add all internal networks to ACL (192.168.0.0/16, 172.16.0.0/12, 10.0.0.0/8)",
        "Verify: show ip nat statistics",
      ],
    },
    {
      id: 8,
      title: "Duplicate IP Addresses",
      location: "Dustin's House - Network",
      problem: "Two PCs in Dustin's House network have the same IP (192.168.1.25). Causes ARP conflicts and intermittent failures.",
      solution: "Assign unique IP addresses to each device. Change Dustin's House-2 from 192.168.1.25 to 192.168.1.51.",
      affectedDevices: ["ho-pc-it-2"],
      steps: [
        "PC (Dustin's House-2): Open Network Settings",
        "Change IP from 192.168.1.25 to 192.168.1.51",
        "Keep subnet 255.255.255.0, gateway 192.168.1.1",
        "Restart network connection",
        "Verify no ARP conflicts: arp -a",
      ],
    },
    {
      id: 9,
      title: "Shutdown Interfaces",
      location: "Hawkins School - Uplinks",
      problem: "Some switch uplinks are administratively shutdown. Entire VLANs go offline periodically.",
      solution: "Enable shutdown interfaces on access switches connecting to core switch.",
      affectedDevices: ["ho-access-switch-1", "ho-access-switch-2", "ho-access-switch-3"],
      steps: [
        "Mike's House Switch# configure terminal",
        "interface Gi0/1 (uplink to core)",
        "no shutdown",
        "Repeat for Dustin's House and Lucas's House switches",
        "Verify: show interfaces status | include connected",
      ],
    },
  ];

  const handleShowProblemDetails = (problemId) => {
    setHighlightedProblems(new Set([problemId]));
  };

  // ============================================
  // CORE openConfig — SINGLE ENTRY POINT FOR ALL CONFIG PANELS
  // ============================================
  const openConfig = (problem, deviceId) => {
    // SAFETY: prevent crash if problem or deviceId is undefined
    if (!problem || !deviceId) {
      console.error("❌ openConfig: problem or deviceId is missing", { problem, deviceId });
      return;
    }

    console.log(`🔧 openConfig() called: Problem ${problem.id}, Device ${deviceId}`);

    const mode = PROBLEM_MODE_MAP[problem.id];
    if (!mode) {
      console.error(`❌ No mode for problem ${problem.id}`);
      alert(`❌ Configuration error for problem ${problem.id}`);
      return;
    }

    console.log(`✅ openConfig: mode=${mode}, device=${deviceId}`);

    // Story popups
    const storyMessages = {
      1: { left: "Dustin: VLANs aren't talking to each other!", right: "Eleven: The networks are isolated..." },
      2: { left: "Lucas: PC can't reach the gateway!", right: "Eleven: I can't hear the router..." },
      3: { left: "Mike: Routing is broken!", right: "Eleven: No path between the worlds..." },
      4: { left: "Will: Static routes needed!", right: "Eleven: I need breadcrumbs..." },
      5: { left: "Max: OSPF isn't discovering neighbors!", right: "Eleven: The link-state is corrupted..." },
      6: { left: "Dustin: DNS lookups failing!", right: "Eleven: I don't know the address..." },
      7: { left: "Lucas: NAT translation is down!", right: "Eleven: I can't hide my location..." },
      8: { left: "Mike: IP address conflict!", right: "Eleven: My signal is duplicated..." },
      9: { left: "Will: Interfaces are down!", right: "Eleven: The barrier blocks my signal..." }
    };
    if (storyMessages[problem.id]) {
      addStoryPopup(storyMessages[problem.id].left, "left", "warning");
      addStoryPopup(storyMessages[problem.id].right, "right", "warning");
    }

    // Reset shared panel state
    setValidationErrors({});
    setConfigMessage(null);
    setTerminalInput("");
    setTerminalOutput(buildTerminalOutput(mode, deviceId, problem.title));

    // Mode-specific initialisation
    if (mode === "routing") {
      setRoutingStep(0);
      setRoutingState({ routingEnabled: false, vlans: { 10: false, 20: false, 30: false } });
      if (!deviceConfigs[deviceId]) {
        setDeviceConfigs(prev => ({
          ...prev,
          [deviceId]: { ipRouting: false, vlans: { 10: {}, 20: {}, 30: {} } }
        }));
      }
    } else if (mode === "vlan") {
      if (!deviceConfigs[deviceId]) {
        setDeviceConfigs(prev => ({
          ...prev,
          [deviceId]: {
            interfaces: {
              Gi0_1: { mode: "access", vlan: 10 },
              Gi0_2: { mode: "access", vlan: 10 },
              Gi0_3: { mode: "access", vlan: 10 }
            }
          }
        }));
      }
    } else if (mode === "pc") {
      if (!deviceConfigs[deviceId]) {
        setDeviceConfigs(prev => ({ ...prev, [deviceId]: { gateway: "" } }));
      }
      setTerminalMode("user");
      setCurrentVlan(null);
    } else if (mode === "routing-static") {
      setStaticRoutes({ "192.168.1.0": false, "10.0.0.0": false, "172.17.0.0": false });
      setStaticRoutingConfigMode(false);
    } else if (mode === "routing-ospf") {
      setOspfState({
        configMode: false,
        ospfEnabled: false,
        networks: { "172.17.0.0": false, "203.0.113.0": false }
      });
    } else if (mode === "dns") {
      setDnsConfig({
        zone: "",
        records: { webserver: "", db: "" },
        serviceReloaded: false,
        nslookupResult: null,
        testDomain: ""
      });
    } else if (mode === "nat") {
      setNatState({
        configMode: false,
        natRuleAdded: false,
        insideInterfaces: [],
        outsideInterface: null,
        aclNetworks: []
      });
    } else if (mode === "pc-ip") {
      setPcConfig({
        ip: "192.168.1.25",
        subnet: "255.255.255.0",
        gateway: "192.168.1.1",
        networkRestarted: false
      });
    }
    // interface-status: preserve existing state on re-open

    setActiveConfig({ deviceId, problem, mode });
  };

  // ============================================
  // HANDLE BADGE CLICK — directly open config
  // ============================================
  const handleProblemClick = (problemId, deviceId) => {
    console.log("🎯 Badge Clicked - Problem:", problemId, "Device:", deviceId);

    // SAFETY: ensure problems array exists
    if (!problems || !Array.isArray(problems)) {
      console.error(`❌ Problems array is not available`);
      return;
    }

    const matched = problems.find(p => p.id === problemId);
    if (!matched) {
      console.error(`❌ Problem not found: ${problemId}`);
      return;
    }

    openConfig(matched, deviceId);
  };

  // ============================================
  // HANDLE DEVICE NODE CLICK
  // ============================================
  const handleDeviceClick = (deviceId) => {
    console.log("🔧 Clicked device:", deviceId);

    // SAFETY: ensure problems array exists
    if (!problems || !Array.isArray(problems)) {
      console.error("❌ Problems array is not available");
      return;
    }

    const nodeProblems = NODE_PROBLEM_MAP[deviceId] || [];
    if (nodeProblems.length === 0) return;

    const problemObjects = nodeProblems
      .map(pid => problems.find(p => p.id === pid))
      .filter(Boolean);

    if (problemObjects.length === 1) {
      openConfig(problemObjects[0], deviceId);
    } else if (problemObjects.length > 1) {
      setProblemSelector({ deviceId, problems: problemObjects });
    }
  };

  const handleConfigChange = (updates) => {
    const device = activeConfig?.deviceId;
    if (!device) return;
    console.log(`📝 handleConfigChange: updating device "${device}"`, updates);
    setDeviceConfigs({
      ...deviceConfigs,
      [device]: {
        ...deviceConfigs[device],
        ...updates
      }
    });
    setValidationErrors({});
  };

  const handleApplyConfig = () => {
    const device = activeConfig?.deviceId;
    if (!device) return;
    console.log(`💾 handleApplyConfig: validating device "${device}"`);
    const { isValid, errors } = validateVLANConfig(device, deviceConfigs[device]);
    
    if (isValid) {
      setValidationErrors({});
      setConfigMessage({ type: "success", text: `✅ ${getDeviceDisplayName(device)} Configured! (${getProblemProgress(1)} devices)` });
      
      addConfiguredDevice(1, device);
      
      const affectedDevices = problemMapping[1];
      const newConfigured = new Set([...(configuredDevices[1] || []), device]);
      
      if (affectedDevices.every(d => newConfigured.has(d))) {
        setSolvedProblems(new Set([...solvedProblems, 1]));
        addStoryPopup("🎉 ALL VLAN Configuration Complete!", "left", "success");
        addStoryPopup("Eleven: Strong signal detected...", "right", "success");
      } else {
        setSignalStrength(prev => Math.min(100, prev + 3));
        addStoryPopup(`✅ ${getDeviceDisplayName(device)} configured!`, "left", "info");
      }
      
      setTimeout(() => {
        setActiveConfig(null);
        setConfigMessage(null);
      }, 2000);
    } else {
      setValidationErrors(errors);
      setConfigMessage({ type: "error", text: "❌ Configuration has errors. See details below." });
    }
  };

  // ============================================
  // VLAN VALIDATION (standalone, used by handleApplyConfig)
  // ============================================
  const validateVLANConfig = (deviceId, config) => {
    const errors = {};
    const interfaces = config?.interfaces || {};
    const vlanMap = {
      "ho-access-switch-1": "10",
      "ho-access-switch-2": "20",
      "ho-access-switch-3": "30",
    };

    if (deviceId === "ho-core-switch") {
      if (interfaces.Gi0_1?.mode !== "trunk") errors.Gi0_1 = "Gi0/1 must be configured as Trunk Port";
      if (interfaces.Gi0_2?.mode !== "trunk") errors.Gi0_2 = "Gi0/2 must be configured as Trunk Port";
      if (interfaces.Gi0_3?.mode !== "trunk") errors.Gi0_3 = "Gi0/3 must be configured as Trunk Port";
    } else if (vlanMap[deviceId]) {
      const expectedVLAN = vlanMap[deviceId];
      if (interfaces.Gi0_1?.mode !== "trunk") errors.Gi0_1 = "Gi0/1 (uplink to core) must be configured as Trunk Port";
      if (interfaces.Gi0_2?.mode !== "access") errors.Gi0_2 = "Gi0/2 must be configured as Access Port";
      if (interfaces.Gi0_2?.mode === "access" && interfaces.Gi0_2?.vlan !== expectedVLAN) {
        errors.vlan = `Gi0/2 must be assigned to VLAN ${expectedVLAN}`;
      }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // ============================================
  // TERMINAL COMMAND ROUTER — reads activeConfig.mode
  // ============================================
  const handleTerminalCommand = (command) => {
    const mode = activeConfig?.mode;
    if (mode === "routing") {
      handleRoutingCommand(command);
    } else if (mode === "routing-static") {
      handleStaticRoutingCommand(command);
    } else if (mode === "routing-ospf") {
      handleOspfCommand(command);
    } else if (mode === "pc") {
      handlePcTerminalCommand(command);
    } else if (mode === "nat") {
      handleNatCommand(command);
    }
  };

  const handleSwitchCliCommand = (command) => {
    const trimmed = command.trim().toLowerCase();
    if (!trimmed) return;

    const newOutput = [...terminalOutput];
    const config = deviceConfigs[activeConfig?.deviceId];

    if (trimmed === "enable") {
      if (terminalMode !== "user") {
        newOutput.push("# ✗ Already in privileged mode");
      } else {
        setTerminalMode("privileged");
        newOutput.push("# ✓ Entering privileged EXEC mode");
      }
    } else if (trimmed === "configure terminal" || trimmed === "conf t") {
      if (terminalMode !== "privileged") {
        newOutput.push("# ✗ Error: Must be in privileged EXEC mode");
      } else {
        setTerminalMode("config");
        newOutput.push("# ✓ Entering configuration mode");
      }
    } else if (trimmed === "ip routing") {
      if (terminalMode !== "config") {
        newOutput.push("# ✗ Error: Must be in configuration mode");
      } else {
        setDeviceConfigs({
          ...deviceConfigs,
          [activeConfig?.deviceId]: {
            ...config,
            ipRouting: true
          }
        });
        newOutput.push("# ✓ IP routing enabled");
      }
    } else if (trimmed.startsWith("interface vlan")) {
      if (terminalMode !== "config") {
        newOutput.push("# ✗ Error: Must be in configuration mode");
      } else {
        const parts = trimmed.split(" ");
        if (parts.length === 3 && ["10", "20", "30"].includes(parts[2])) {
          setCurrentVlan(parseInt(parts[2]));
          setTerminalMode("interface");
          newOutput.push(`# ✓ Entering interface configuration for VLAN ${parts[2]}`);
        } else {
          newOutput.push("# ✗ Error: Use 'interface vlan 10/20/30'");
        }
      }
    } else if (trimmed.startsWith("ip address")) {
      if (terminalMode !== "interface") {
        newOutput.push("# ✗ Error: Must be in interface configuration mode");
      } else {
        const parts = trimmed.split(" ");
        if (parts.length === 4) {
          const ip = parts[2];
          const mask = parts[3];
          setDeviceConfigs({
            ...deviceConfigs,
            [activeConfig?.deviceId]: {
              ...config,
              vlans: {
                ...config.vlans,
                [currentVlan]: { ip, mask }
              }
            }
          });
          newOutput.push(`# ✓ VLAN ${currentVlan} IP configured: ${ip} ${mask}`);
        } else {
          newOutput.push("# ✗ Error: Use 'ip address <IP> <MASK>'");
        }
      }
    } else if (trimmed === "exit") {
      if (terminalMode === "interface") {
        setTerminalMode("config");
        setCurrentVlan(null);
        newOutput.push("# ✓ Exiting interface configuration mode");
      } else if (terminalMode === "config") {
        setTerminalMode("privileged");
        newOutput.push("# ✓ Exiting configuration mode");
      } else if (terminalMode === "privileged") {
        setTerminalMode("user");
        newOutput.push("# ✓ Exiting privileged mode");
      } else {
        newOutput.push("# ✗ Cannot exit from user EXEC mode");
      }
    } else if (trimmed === "show interfaces vlan") {
      newOutput.push("# ═══════════════════════════════════════");
      newOutput.push("# VLAN INTERFACES CONFIGURATION");
      newOutput.push("# ─────────────────────────────────────");
      if (config.ipRouting) {
        newOutput.push("# IP Routing: ENABLED ✓");
      } else {
        newOutput.push("# IP Routing: DISABLED ✗");
      }
      newOutput.push("#");
      Object.entries(config.vlans).forEach(([vlanId, vlanConfig]) => {
        if (vlanConfig.ip) {
          newOutput.push(`# VLAN ${vlanId}: ${vlanConfig.ip} ${vlanConfig.mask}`);
        } else {
          newOutput.push(`# VLAN ${vlanId}: Not configured`);
        }
      });
      newOutput.push("# ═══════════════════════════════════════");
      
      const isProblem3Solved = 
        config.ipRouting &&
        config.vlans["10"]?.ip === "192.168.1.1" &&
        config.vlans["20"]?.ip === "192.168.2.1" &&
        config.vlans["30"]?.ip === "192.168.3.1" &&
        config.vlans["10"]?.mask === "255.255.255.0" &&
        config.vlans["20"]?.mask === "255.255.255.0" &&
        config.vlans["30"]?.mask === "255.255.255.0";

      if (isProblem3Solved) {
        newOutput.push("# ✅ ALL VLANS CONFIGURED CORRECTLY - PROBLEM 3 SOLVED!");
        setSolvedProblems(new Set([...solvedProblems, 3]));
        setSignalStrength(prev => Math.min(100, prev + 9));
        addStoryPopup("🔗 Routing path established!", "left", "info");
        addStoryPopup("Eleven: The channels are aligning...", "right", "info");
        setConfigMessage({ type: "success", text: "✅ Problem 3 solved! Inter-VLAN routing configured." });
      }
    } else if (trimmed === "help" || trimmed === "?") {
      newOutput.push("# ═══════════════════════════════════════");
      newOutput.push("# AVAILABLE COMMANDS");
      newOutput.push("# ─────────────────────────────────────");
      newOutput.push("# GLOBAL:");
      newOutput.push("#   enable                 Enter privileged EXEC mode");
      newOutput.push("#   configure terminal     Enter configuration mode");
      newOutput.push("#");
      newOutput.push("# CONFIG MODE:");
      newOutput.push("#   ip routing             Enable inter-VLAN routing");
      newOutput.push("#   interface vlan <id>    Configure VLAN interface (10/20/30)");
      newOutput.push("#");
      newOutput.push("# INTERFACE MODE:");
      newOutput.push("#   ip address <ip> <mask> Assign IP to VLAN");
      newOutput.push("#");
      newOutput.push("# ALL MODES:");
      newOutput.push("#   exit                   Exit current mode");
      newOutput.push("#   show interfaces vlan   Display VLAN interfaces");
      newOutput.push("# ═══════════════════════════════════════");
    } else {
      newOutput.push(`# ✗ Unknown command: ${command}`);
    }

    newOutput.push("");
    setTerminalOutput(newOutput);
    setTerminalInput("");
  };

  // ============================================
  // ROUTING MODE COMMAND HANDLER (PROBLEM 3)
  // ============================================
  const handleRoutingCommand = (command) => {
    const trimmed = command.trim().toLowerCase();
    if (!trimmed) return;

    const newOutput = [...terminalOutput, `HO-Core-Switch${routingStep > 0 ? '(config)' : ''}# ${trimmed}`];
    const expectedCommands = [
      "configure terminal",
      "ip routing",
      "interface vlan 10",
      "ip address 192.168.1.1 255.255.255.0",
      "interface vlan 20",
      "ip address 192.168.2.1 255.255.255.0",
      "interface vlan 30",
      "ip address 192.168.3.1 255.255.255.0",
      "show interfaces vlan"
    ];

    const isCorrect = trimmed === expectedCommands[routingStep];

    if (isCorrect) {
      newOutput.push("✓ OK");
      newOutput.push("");

      if (routingStep === 1) {
        setRoutingState({ ...routingState, routingEnabled: true });
      } else if (routingStep === 3) {
        setRoutingState({ 
          ...routingState, 
          vlans: { ...routingState.vlans, 10: true }
        });
      } else if (routingStep === 5) {
        setRoutingState({ 
          ...routingState, 
          vlans: { ...routingState.vlans, 20: true }
        });
      } else if (routingStep === 7) {
        setRoutingState({ 
          ...routingState, 
          vlans: { ...routingState.vlans, 30: true }
        });
      } else if (routingStep === 8) {
        newOutput.push("Vlan10 - 192.168.1.1/24 - UP");
        newOutput.push("Vlan20 - 192.168.2.1/24 - UP");
        newOutput.push("Vlan30 - 192.168.3.1/24 - UP");
        newOutput.push("");
        newOutput.push("✅ Inter-VLAN Routing Configured Successfully!");
        newOutput.push("");
        
        setSolvedProblems(new Set([...solvedProblems, 3]));
        setSignalStrength(prev => Math.min(100, prev + 9));
        addStoryPopup("🔗 Routing path established!", "left", "info");
        addStoryPopup("Eleven: The channels are aligning...", "right", "info");
        setConfigMessage({ 
          type: "success", 
          text: "✅ Problem 3 Solved! Inter-VLAN Routing is now enabled." 
        });
      }

      if (routingStep < expectedCommands.length - 1) {
        setRoutingStep(routingStep + 1);
        const nextPrompt = routingStep + 1 < expectedCommands.length - 1 ? "(config)# " : "# ";
        newOutput.push(`HO-Core-Switch${nextPrompt}`);
      }
    } else {
      newOutput.push(`❌ Invalid command. Expected: ${expectedCommands[routingStep]}`);
      newOutput.push(`HO-Core-Switch${routingStep > 0 ? '(config)' : ''}# `);
    }

    newOutput.push("");
    setTerminalOutput(newOutput);
    setTerminalInput("");
  };

  // ============================================
  // STATIC ROUTING COMMAND HANDLER (PROBLEM 4)
  // ============================================
  const handleStaticRoutingCommand = (command) => {
    const trimmed = command.trim().toLowerCase();
    if (!trimmed) return;

    const newOutput = [...terminalOutput, `Branch-A-Router${staticRoutingConfigMode ? '(config)' : ''}# ${trimmed}`];

    const requiredRoutes = {
      "192.168.1.0": "ip route 192.168.1.0 255.255.255.0 203.0.113.1",
      "10.0.0.0": "ip route 10.0.0.0 255.255.255.0 203.0.113.1",
      "172.17.0.0": "ip route 172.17.0.0 255.255.255.0 203.0.113.1"
    };

    if (trimmed === "configure terminal" || trimmed === "conf t") {
      if (staticRoutingConfigMode) {
        newOutput.push("❌ Error: Already in configuration mode");
      } else {
        setStaticRoutingConfigMode(true);
        newOutput.push("✓ Entering configuration mode");
      }
    } 
    else if (trimmed === "show ip route") {
      if (!staticRoutingConfigMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
        newOutput.push("Use: configure terminal");
      } else {
        newOutput.push("");
        newOutput.push("─────────────────────────────────────────────");
        newOutput.push("Codes: C - Connected, S - Static, D - EIGRP");
        newOutput.push("─────────────────────────────────────────────");
        newOutput.push("");
        
        newOutput.push("C 203.0.113.0/24 is directly connected, Serial0/0");
        newOutput.push("");
        
        let configuredCount = 0;
        Object.entries(staticRoutes).forEach(([network, isConfigured]) => {
          if (isConfigured) {
            const gateway = "203.0.113.1";
            newOutput.push(`S ${network}/24 [1/0] via ${gateway}`);
            configuredCount++;
          }
        });
        
        newOutput.push("");
        newOutput.push("─────────────────────────────────────────────");
        
        if (configuredCount === 3) {
          newOutput.push("✅ ALL STATIC ROUTES CONFIGURED!");
          newOutput.push("");
          newOutput.push("✅ PROBLEM 4 SOLVED – Static Routing is Complete!");
          
          setSolvedProblems(new Set([...solvedProblems, 4]));
          setSignalStrength(prev => Math.min(100, prev + 9));
          addStoryPopup("📍 Static routes mapped!", "left", "info");
          addStoryPopup("Eleven: I can navigate the gaps...", "right", "info");
          setConfigMessage({ 
            type: "success", 
            text: "✅ Problem 4 solved! Static routes configured successfully." 
          });
        } else {
          newOutput.push(`⏳ Routes configured: ${configuredCount}/3`);
        }
        newOutput.push("");
      }
    }
    else if (trimmed.startsWith("ip route")) {
      if (!staticRoutingConfigMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
        newOutput.push("Use: configure terminal");
      } else {
        let routeFound = false;
        let routeNetwork = null;

        for (const [network, requiredCommand] of Object.entries(requiredRoutes)) {
          if (trimmed === requiredCommand.toLowerCase()) {
            routeFound = true;
            routeNetwork = network;
            break;
          }
        }

        if (routeFound) {
          if (staticRoutes[routeNetwork]) {
            newOutput.push(`⚠️ Route already exists for ${routeNetwork}`);
          } else {
            setStaticRoutes({
              ...staticRoutes,
              [routeNetwork]: true
            });
            newOutput.push(`✓ Static route added: ${requiredRoutes[routeNetwork]}`);
            
            const updatedRoutes = {
              ...staticRoutes,
              [routeNetwork]: true
            };
            const allConfigured = Object.values(updatedRoutes).every(v => v === true);
            
            if (allConfigured) {
              newOutput.push("");
              newOutput.push("✅ ALL STATIC ROUTES CONFIGURED!");
              newOutput.push("Use: show ip route");
            }
          }
        } else {
          newOutput.push("❌ Invalid route. Expected format:");
          newOutput.push("   ip route 192.168.1.0 255.255.255.0 203.0.113.1");
          newOutput.push("   ip route 10.0.0.0 255.255.255.0 203.0.113.1");
          newOutput.push("   ip route 172.17.0.0 255.255.255.0 203.0.113.1");
        }
      }
    }
    else if (trimmed === "exit") {
      if (staticRoutingConfigMode) {
        setStaticRoutingConfigMode(false);
        newOutput.push("✓ Exiting configuration mode");
      } else {
        newOutput.push("❌ Error: Not in configuration mode");
      }
    }
    else if (trimmed === "help" || trimmed === "?") {
      newOutput.push("");
      newOutput.push("═════════════════════════════════════════════");
      newOutput.push("STATIC ROUTING CONFIGURATION - AVAILABLE COMMANDS");
      newOutput.push("═════════════════════════════════════════════");
      newOutput.push("");
      newOutput.push("GLOBAL:");
      newOutput.push("  configure terminal    Enter configuration mode");
      newOutput.push("");
      newOutput.push("CONFIG MODE:");
      newOutput.push("  ip route 192.168.1.0 255.255.255.0 203.0.113.1");
      newOutput.push("  ip route 10.0.0.0 255.255.255.0 203.0.113.1");
      newOutput.push("  ip route 172.17.0.0 255.255.255.0 203.0.113.1");
      newOutput.push("  show ip route          Display routing table");
      newOutput.push("  exit                   Exit configuration mode");
      newOutput.push("");
      newOutput.push("═════════════════════════════════════════════");
      newOutput.push("");
    }
    else {
      newOutput.push(`❌ Unknown command: ${command}`);
    }

    newOutput.push("");
    setTerminalOutput(newOutput);
    setTerminalInput("");
  };

  // ============================================
  // OSPF ROUTING COMMAND HANDLER (PROBLEM 5)
  // ============================================
  const handleOspfCommand = (command) => {
    const trimmed = command.trim().toLowerCase();
    if (!trimmed) return;

    const newOutput = [...terminalOutput, `Branch-B-Router${ospfState.configMode ? '(config)' : ''}# ${trimmed}`];

    const requiredNetworks = {
      "172.17.0.0": "network 172.17.0.0 0.0.0.255 area 0",
      "203.0.113.0": "network 203.0.113.0 0.0.0.255 area 0"
    };

    if (trimmed === "configure terminal" || trimmed === "conf t") {
      if (ospfState.configMode) {
        newOutput.push("❌ Error: Already in configuration mode");
      } else {
        setOspfState({ ...ospfState, configMode: true });
        newOutput.push("✓ Entering configuration mode");
      }
    }
    else if (trimmed === "router ospf 1") {
      if (!ospfState.configMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
        newOutput.push("Use: configure terminal");
      } else if (ospfState.ospfEnabled) {
        newOutput.push("⚠️ OSPF process already running");
      } else {
        setOspfState({ ...ospfState, ospfEnabled: true });
        newOutput.push("✓ OSPF process 1 initialized");
      }
    }
    else if (trimmed.startsWith("network")) {
      if (!ospfState.configMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
        newOutput.push("Use: configure terminal");
      } else if (!ospfState.ospfEnabled) {
        newOutput.push("❌ Error: Must enable OSPF first");
        newOutput.push("Use: router ospf 1");
      } else {
        let networkFound = false;
        let networkId = null;

        for (const [network, requiredCommand] of Object.entries(requiredNetworks)) {
          if (trimmed === requiredCommand.toLowerCase()) {
            networkFound = true;
            networkId = network;
            break;
          }
        }

        if (networkFound) {
          if (ospfState.networks[networkId]) {
            newOutput.push(`⚠️ Network already configured for ${networkId}`);
          } else {
            setOspfState({
              ...ospfState,
              networks: {
                ...ospfState.networks,
                [networkId]: true
              }
            });
            newOutput.push(`✓ Network added to OSPF: ${requiredNetworks[networkId]}`);
            
            const updatedNetworks = {
              ...ospfState.networks,
              [networkId]: true
            };
            const allConfigured = Object.values(updatedNetworks).every(v => v === true);
            
            if (allConfigured) {
              newOutput.push("");
              newOutput.push("✅ ALL OSPF NETWORKS CONFIGURED!");
              newOutput.push("Use: show ip ospf neighbor");
            }
          }
        } else {
          newOutput.push("❌ Invalid network command. Expected format:");
          newOutput.push("   network 172.17.0.0 0.0.0.255 area 0");
          newOutput.push("   network 203.0.113.0 0.0.0.255 area 0");
        }
      }
    }
    else if (trimmed === "show ip ospf neighbor") {
      if (!ospfState.ospfEnabled) {
        newOutput.push("❌ Error: OSPF not enabled or not configured");
      } else {
        newOutput.push("");
        newOutput.push("Neighbor ID     Pri   State           Dead Time   Address         Interface");
        
        if (ospfState.networks["172.17.0.0"] && ospfState.networks["203.0.113.0"]) {
          newOutput.push("10.0.0.1        1     FULL/DR         36s         203.0.113.2     Gig0/0");
          newOutput.push("");
          newOutput.push("─────────────────────────────────────────────────────────────────");
          newOutput.push("✅ OSPF Neighbor Established!");
          newOutput.push("✅ PROBLEM 5 SOLVED – OSPF Configuration Complete!");
          
          setSolvedProblems(new Set([...solvedProblems, 5]));
          setSignalStrength(prev => Math.min(100, prev + 9));
          addStoryPopup("🌐 Neighbor networks discovered!", "left", "info");
          addStoryPopup("Eleven: I found another signal...", "right", "info");
          setConfigMessage({ 
            type: "success", 
            text: "✅ Problem 5 solved! OSPF routing configured successfully." 
          });
        } else {
          newOutput.push("⚠️ No OSPF neighbors found");
          newOutput.push("");
          newOutput.push("Note: Ensure all networks are advertised first:");
          newOutput.push("  network 172.17.0.0 0.0.0.255 area 0");
          newOutput.push("  network 203.0.113.0 0.0.0.255 area 0");
        }
        newOutput.push("");
      }
    }
    else if (trimmed === "exit") {
      if (ospfState.configMode) {
        setOspfState({ ...ospfState, configMode: false });
        newOutput.push("✓ Exiting configuration mode");
      } else {
        newOutput.push("❌ Error: Not in configuration mode");
      }
    }
    else if (trimmed === "help" || trimmed === "?") {
      newOutput.push("");
      newOutput.push("═════════════════════════════════════════════");
      newOutput.push("OSPF ROUTING CONFIGURATION - AVAILABLE COMMANDS");
      newOutput.push("═════════════════════════════════════════════");
      newOutput.push("");
      newOutput.push("GLOBAL:");
      newOutput.push("  configure terminal    Enter configuration mode");
      newOutput.push("");
      newOutput.push("CONFIG MODE:");
      newOutput.push("  router ospf 1         Enable OSPF process 1");
      newOutput.push("  network 172.17.0.0 0.0.0.255 area 0");
      newOutput.push("  network 203.0.113.0 0.0.0.255 area 0");
      newOutput.push("  show ip ospf neighbor  Display OSPF neighbors");
      newOutput.push("  exit                  Exit configuration mode");
      newOutput.push("");
      newOutput.push("═════════════════════════════════════════════");
      newOutput.push("");
    }
    else {
      newOutput.push(`❌ Unknown command: ${command}`);
    }

    newOutput.push("");
    setTerminalOutput(newOutput);
    setTerminalInput("");
  };

  const handleNatCommand = (command) => {
    const trimmed = command.trim().toLowerCase();
    if (!trimmed) return;

    const newOutput = [...terminalOutput, `Edge-Router${natState.configMode ? '(config)' : ''}# ${trimmed}`];

    if (trimmed === "configure terminal" || trimmed === "conf t") {
      if (natState.configMode) {
        newOutput.push("❌ Error: Already in configuration mode");
      } else {
        setNatState({ ...natState, configMode: true });
        newOutput.push("✓ Entering configuration mode");
      }
    }
    else if (trimmed === "ip nat inside source list acl_internal interface gigabitethernet0 overload") {
      if (!natState.configMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
        newOutput.push("Use: configure terminal");
      } else if (natState.natRuleAdded) {
        newOutput.push("⚠️ NAT rule already configured");
      } else {
        setNatState({ ...natState, natRuleAdded: true });
        newOutput.push("✓ NAT rule applied: inside source list ACL_INTERNAL");
      }
    }
    else if (trimmed.startsWith("access-list 1 permit")) {
      if (!natState.configMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
        newOutput.push("Use: configure terminal");
      } else {
        const parts = trimmed.split(" ");
        if (parts.length >= 4) {
          const network = parts[3];
          const wildcard = parts.length > 4 ? parts[4] : "";

          let networkCIDR = null;
          if (network === "192.168.0.0" && wildcard === "0.0.255.255") {
            networkCIDR = "192.168.0.0/16";
          } else if (network === "172.16.0.0" && wildcard === "0.0.15.255") {
            networkCIDR = "172.16.0.0/12";
          } else if (network === "10.0.0.0" && wildcard === "0.0.255.255") {
            networkCIDR = "10.0.0.0/8";
          }

          if (networkCIDR && !natState.aclNetworks.includes(networkCIDR)) {
            setNatState({
              ...natState,
              aclNetworks: [...natState.aclNetworks, networkCIDR]
            });
            newOutput.push(`✓ Added ACL network: ${networkCIDR}`);

            const allNetworks = [...natState.aclNetworks, networkCIDR];
            const hasAllNetworks = 
              allNetworks.includes("192.168.0.0/16") &&
              allNetworks.includes("172.16.0.0/12") &&
              allNetworks.includes("10.0.0.0/8");

            if (hasAllNetworks) {
              newOutput.push("");
              newOutput.push("✅ ALL ACL NETWORKS CONFIGURED!");
            }
          } else if (natState.aclNetworks.includes(networkCIDR)) {
            newOutput.push(`⚠️ Network already in ACL: ${networkCIDR}`);
          } else {
            newOutput.push("❌ Invalid network format. Expected:");
            newOutput.push("   access-list 1 permit 192.168.0.0 0.0.255.255");
            newOutput.push("   access-list 1 permit 172.16.0.0 0.0.15.255");
            newOutput.push("   access-list 1 permit 10.0.0.0 0.0.255.255");
          }
        }
      }
    }
    else if (trimmed === "show ip nat statistics") {
      const allRequirements = {
        natRule: natState.natRuleAdded,
        insideInterface: natState.insideInterfaces.length > 0,
        outsideInterface: natState.outsideInterface !== null,
        allNetworks: 
          natState.aclNetworks.includes("192.168.0.0/16") &&
          natState.aclNetworks.includes("172.16.0.0/12") &&
          natState.aclNetworks.includes("10.0.0.0/8")
      };

      if (!allRequirements.natRule || !allRequirements.insideInterface || !allRequirements.outsideInterface || !allRequirements.allNetworks) {
        newOutput.push("");
        newOutput.push("⚠️ NAT NOT FULLY CONFIGURED");
        newOutput.push("");
        newOutput.push("Configuration Status:");
        newOutput.push(`  NAT Rule: ${allRequirements.natRule ? '✓' : '✗'}`);
        newOutput.push(`  Inside Interface: ${allRequirements.insideInterface ? '✓' : '✗'}`);
        newOutput.push(`  Outside Interface: ${allRequirements.outsideInterface ? '✓' : '✗'}`);
        newOutput.push(`  ACL Networks: ${allRequirements.allNetworks ? '✓' : '✗'}`);
        newOutput.push("");
      } else {
        newOutput.push("");
        newOutput.push("─────────────────────────────────────────────────");
        newOutput.push("NAT Statistics");
        newOutput.push("─────────────────────────────────────────────────");
        newOutput.push("Total translations: 25");
        newOutput.push(`Inside interfaces: ${natState.insideInterfaces.join(", ")}`);
        newOutput.push(`Outside interface: ${natState.outsideInterface}`);
        newOutput.push("ACL networks:");
        natState.aclNetworks.forEach(net => {
          newOutput.push(`  - ${net}`);
        });
        newOutput.push("");
        newOutput.push("✅ NAT FULLY CONFIGURED!");
        newOutput.push("✅ PROBLEM 7 SOLVED – NAT Configuration Complete!");
        
        setSolvedProblems(new Set([...solvedProblems, 7]));
        setSignalStrength(prev => Math.min(100, prev + 9));
        addStoryPopup("🔐 Network translation complete!", "left", "info");
        addStoryPopup("Eleven: My identity is shielded...", "right", "info");
        setConfigMessage({ 
          type: "success", 
          text: "✅ Problem 7 solved! NAT configuration completed successfully." 
        });
        newOutput.push("");
      }
    }
    else if (trimmed === "exit") {
      if (natState.configMode) {
        setNatState({ ...natState, configMode: false });
        newOutput.push("✓ Exiting configuration mode");
      } else {
        newOutput.push("❌ Error: Not in configuration mode");
      }
    }
    else if (trimmed.startsWith("interface gigabitethernet")) {
      if (!natState.configMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
        newOutput.push("Use: configure terminal");
      } else {
        const parts = trimmed.split(" ");
        if (parts.length === 2 && (parts[1] === "gigabitethernet0" || parts[1] === "gigabitethernet1")) {
          const interfaceName = parts[1] === "gigabitethernet0" ? "GigabitEthernet0" : "GigabitEthernet1";
          setNatState({ ...natState, currentInterface: interfaceName });
          newOutput.push(`✓ Entering interface configuration for ${interfaceName}`);
        } else {
          newOutput.push("❌ Error: Use 'interface GigabitEthernet0' or 'interface GigabitEthernet1'");
        }
      }
    }
    else if (trimmed === "ip nat inside") {
      if (!natState.configMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
      } else if (!natState.currentInterface) {
        newOutput.push("❌ Error: Must enter interface configuration mode first");
        newOutput.push("Use: interface GigabitEthernet0 or interface GigabitEthernet1");
      } else {
        const ifName = natState.currentInterface;
        if (!natState.insideInterfaces.includes(ifName)) {
          setNatState({
            ...natState,
            insideInterfaces: [...natState.insideInterfaces, ifName],
            outsideInterface: natState.outsideInterface === ifName ? null : natState.outsideInterface
          });
          newOutput.push(`✓ ${ifName} configured as NAT Inside (Private)`);
        } else {
          newOutput.push(`⚠️ ${ifName} is already NAT Inside`);
        }
      }
    }
    else if (trimmed === "ip nat outside") {
      if (!natState.configMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
      } else if (!natState.currentInterface) {
        newOutput.push("❌ Error: Must enter interface configuration mode first");
        newOutput.push("Use: interface GigabitEthernet0 or interface GigabitEthernet1");
      } else {
        const ifName = natState.currentInterface;
        setNatState({
          ...natState,
          outsideInterface: ifName,
          insideInterfaces: natState.insideInterfaces.filter(i => i !== ifName)
        });
        newOutput.push(`✓ ${ifName} configured as NAT Outside (Public)`);
      }
    }
    else if (trimmed === "no ip nat inside") {
      if (!natState.configMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
      } else if (!natState.currentInterface) {
        newOutput.push("❌ Error: Must enter interface configuration mode first");
      } else {
        const ifName = natState.currentInterface;
        setNatState({
          ...natState,
          insideInterfaces: natState.insideInterfaces.filter(i => i !== ifName)
        });
        newOutput.push(`✓ Removed ${ifName} from NAT Inside`);
      }
    }
    else if (trimmed === "no ip nat outside") {
      if (!natState.configMode) {
        newOutput.push("❌ Error: Must enter configuration mode first");
      } else if (!natState.currentInterface) {
        newOutput.push("❌ Error: Must enter interface configuration mode first");
      } else {
        const ifName = natState.currentInterface;
        if (natState.outsideInterface === ifName) {
          setNatState({ ...natState, outsideInterface: null });
          newOutput.push(`✓ Removed ${ifName} from NAT Outside`);
        } else {
          newOutput.push(`⚠️ ${ifName} is not NAT Outside`);
        }
      }
    }
    else if (trimmed === "help" || trimmed === "?") {
      newOutput.push("");
      newOutput.push("═════════════════════════════════════════════");
      newOutput.push("NAT CONFIGURATION - AVAILABLE COMMANDS");
      newOutput.push("═════════════════════════════════════════════");
      newOutput.push("");
      newOutput.push("GLOBAL:");
      newOutput.push("  configure terminal                         Enter configuration mode");
      newOutput.push("");
      newOutput.push("CONFIG MODE:");
      newOutput.push("  interface GigabitEthernet0                 Enter interface config");
      newOutput.push("  interface GigabitEthernet1                 Enter interface config");
      newOutput.push("  ip nat inside                              Set interface as NAT Inside");
      newOutput.push("  ip nat outside                             Set interface as NAT Outside");
      newOutput.push("  no ip nat inside|outside                   Remove interface role");
      newOutput.push("  ip nat inside source list ACL_INTERNAL interface GigabitEthernet0 overload");
      newOutput.push("  access-list 1 permit 192.168.0.0 0.0.255.255");
      newOutput.push("  access-list 1 permit 172.16.0.0 0.0.15.255");
      newOutput.push("  access-list 1 permit 10.0.0.0 0.0.255.255");
      newOutput.push("  show ip nat statistics                     Display NAT statistics");
      newOutput.push("  exit                                       Exit configuration mode");
      newOutput.push("");
      newOutput.push("═════════════════════════════════════════════");
      newOutput.push("");
    }
    else {
      newOutput.push(`❌ Unknown command: ${command}`);
    }

    newOutput.push("");
    setTerminalOutput(newOutput);
    setTerminalInput("");
  };

  const handlePcTerminalCommand = (command) => {
    const trimmed = command.trim();
    if (!trimmed) return;
    
    const deviceId = activeConfig?.deviceId;
    const newOutput = [...terminalOutput, `$ ${trimmed}`];
    
    if (trimmed === "help") {
      newOutput.push("");
      newOutput.push("# ═══════════════════════════════════════════");
      newOutput.push("#  AVAILABLE COMMANDS");
      newOutput.push("# ═══════════════════════════════════════════");
      newOutput.push("#");
      newOutput.push("#  set gateway <IP>");
      newOutput.push("#    Configure the default gateway");
      newOutput.push("#    Example: set gateway 192.168.1.254");
      newOutput.push("#");
      newOutput.push("#  ping <IP>");
      newOutput.push("#    Test connectivity to an IP address");
      newOutput.push("#    Example: ping 10.0.0.50");
      newOutput.push("#");
      newOutput.push("#  save");
      newOutput.push("#    Save the current configuration");
      newOutput.push("#");
      newOutput.push("#  exit / quit");
      newOutput.push("#    Close the terminal");
      newOutput.push("#");
      newOutput.push("# ═══════════════════════════════════════════");
      newOutput.push("");
    } else if (trimmed.startsWith("set gateway")) {
      const parts = trimmed.split(" ");
      if (parts.length === 3) {
        const ip = parts[2];
        setDeviceConfigs({
          ...deviceConfigs,
          [deviceId]: {
            ...deviceConfigs[deviceId],
            gateway: ip
          }
        });
        newOutput.push(`# Gateway configured: ${ip}`);
        newOutput.push("");
      } else {
        newOutput.push("# Error: Usage: set gateway <IP>");
        newOutput.push("# Example: set gateway 192.168.1.254");
        newOutput.push("");
      }
    } else if (trimmed.startsWith("ping")) {
      const parts = trimmed.split(" ");
      if (parts.length === 2) {
        const targetIP = parts[1];
        const currentGateway = deviceConfigs[deviceId]?.gateway;
        
        newOutput.push(`# PING ${targetIP} 32(60) bytes of data.`);
        
        if (currentGateway === "192.168.1.254") {
          newOutput.push("# 32 bytes from 10.0.0.50: icmp_seq=1 ttl=64 time=2.34 ms");
          newOutput.push("# 32 bytes from 10.0.0.50: icmp_seq=2 ttl=64 time=2.45 ms");
          newOutput.push("# 32 bytes from 10.0.0.50: icmp_seq=3 ttl=64 time=2.38 ms");
          newOutput.push("# ─────────────────────────────────────────");
          newOutput.push("# 3 packets transmitted, 3 received, 0% packet loss");
          newOutput.push("# ✅ CONNECTION SUCCESSFUL - PROBLEM 2 SOLVED!");
          newOutput.push("");
          
          setSolvedProblems(new Set([...solvedProblems, 2]));
          setSignalStrength(prev => Math.min(100, prev + 9));
          addStoryPopup("🚪 Gateway to Hawkins found!", "left", "info");
          addStoryPopup("Eleven: I hear the faintest echo...", "right", "info");
          setConfigMessage({ type: "success", text: "✅ Problem 2 solved! PC gateway configured correctly." });
        } else {
          newOutput.push("# ❌ Destination unreachable");
          newOutput.push("# Error: Cannot reach target (check gateway)");
          newOutput.push("");
        }
      } else {
        newOutput.push("# Error: Usage: ping <IP>");
        newOutput.push("# Example: ping 10.0.0.50");
        newOutput.push("");
      }
    } else if (trimmed === "save") {
      newOutput.push("# ✓ Configuration saved successfully");
      newOutput.push("");
    } else if (trimmed === "exit" || trimmed === "quit") {
      setActiveConfig(null);
      return;
    } else {
      newOutput.push(`# bash: ${trimmed}: command not found`);
      newOutput.push("# Type 'help' for available commands");
      newOutput.push("");
    }
    
    setTerminalOutput(newOutput);
    setTerminalInput("");
  };

  // Debug logging for configuration state
  useEffect(() => {
    if (activeConfig) {
      console.log(`🎯 Configuration State Update:`, activeConfig);
    }
  }, [activeConfig]);

  // Initialize nodes and edges with problem mapping
  useEffect(() => {
    const initialNodes = initializeNodes(NODE_PROBLEM_MAP, handleShowProblemDetails, handleDeviceClick);
    const updatedNodes = initialNodes.map(node => {
      const isHighlighted = highlightedProblems.size > 0 && 
        node.data.problems?.some(p => highlightedProblems.has(p));
      return {
        ...node,
        data: { ...node.data, highlighted: isHighlighted }
      };
    });
    const initialEdges = initializeEdges();
    setNodes(updatedNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges, highlightedProblems]);

  // Compute allSolved early so useEffect can use it
  const allSolved = solvedProblems.size === problems.length;

  // Trigger final message when all problems are solved
  useEffect(() => {
    if (allSolved && solvedProblems.size > 0) {
      addStoryPopup("🎉 WE DID IT! All connections restored!", "left", "info");
      setTimeout(() => {
        addStoryPopup("Eleven: I'm back… I found you…", "right", "info");
      }, 500);
      setSignalStrength(100);
    }
  }, [allSolved, solvedProblems.size]);

  const handleSolveProblem = (problemId) => {
    const newSolved = new Set(solvedProblems);
    if (newSolved.has(problemId)) {
      newSolved.delete(problemId);
    } else {
      newSolved.add(problemId);
    }
    setSolvedProblems(newSolved);
  };

  // SAFETY GUARD: Don't render if critical data is missing
  if (!nodes || !problems || problems.length === 0) {
    return <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <div style={{ color: "#fff", fontSize: "18px" }}>Loading network topology...</div>
    </div>;
  }

  return (
    <div className="networking-screen-v2">
      {/* HEADER */}
      <header className="networking-header-v2">
        <div className="header-content">
          <h1>📡 Stranger Things: Signal Recovery Mission</h1>
          <div className="header-stats">
            <span className={`stat-badge signal-${Math.floor(signalStrength / 20)}`}>
              📡 Signal Strength: {signalStrength}%
            </span>
            <span className="stat-badge">
              Problems Solved: {solvedProblems.size}/{problems.length}
            </span>
            {signalStrength === 100 && <span className="stat-badge success">✓ Eleven Connected!</span>}
            {dangerLevel >= 3 && <span className="stat-badge danger">⚠️ Vecna is Near!</span>}
          </div>
          <button className="close-button-header" onClick={close}>✕</button>
        </div>
      </header>

      {/* FINAL MISSION OVERLAY - Shows when all 9 problems solved */}
      {solvedProblems.size === 9 && !activeConfig && (
        <div className="final-mission-overlay">
          <div className="final-mission-card">
            <h1>📡 Network Restored!</h1>
            
            <p className="mission-text">
              All connections between Hawkins and the Upside Down are restored.
            </p>
            
            <p className="warning-text">
              ⚠️ Eleven is still losing signal...
              <br/>Vecna is getting stronger.
            </p>
            
            <p className="mission-subtext">
              🚪 Enter the Mission Door to Help Eleven Collect The Alphabet
            </p>

            <button
              className="mission-button"
              onClick={() => navigate("/missionnetworking")}
            >
              🚀 Go Help Eleven
            </button>
          </div>
        </div>
      )}

      <div className="networking-container-v2">
        {/* LEFT SIDE - COLLAPSIBLE PROBLEMS PANEL */}
        <aside className={`problem-story-panel ${problemsPanel ? 'open' : 'collapsed'}`}>
          <button className="panel-toggle" onClick={() => setProblemsPanelOpen(!problemsPanel)} title="Toggle problems panel">
            {problemsPanel ? '◀' : '▶'} 🧠
          </button>
          {problemsPanel && (
          <div>
          <div className="story-header">
            <h2>Network Problems</h2>
            <span className="story-progress">{solvedProblems.size}/{problems.length} Solved</span>
          </div>

          <div className="story-content">
            {problems.map((problem) => {
              const isSolved = isProblemFullySolved(problem.id) || solvedProblems.has(problem.id);
              const isInProgress = (configuredDevices[problem.id]?.size > 0) && !isSolved;
              const isHighlighted = highlightedProblems.has(problem.id);

              return (
                <div
                  key={problem.id}
                  className={`problem-card ${isSolved ? "solved" : ""} ${isInProgress ? "in-progress" : ""} ${isHighlighted ? "highlighted" : ""}`}
                  onClick={() => {
                    // Open config for this problem using its first affected device
                    const firstDevice = problemMapping[problem.id]?.[0];
                    if (firstDevice) openConfig(problem, firstDevice);
                  }}
                >
                  {/* Problem Title Section */}
                  <div className="problem-card-header">
                    <span className={`problem-badge-numbered ${isSolved ? "solved-badge" : ""}`}>
                      {problem.id}
                    </span>
                    <h3 className="problem-card-title">{problem.title}</h3>
                    {isSolved && <span className="problem-solved-icon">✓</span>}
                  </div>

                  {/* Progress Section */}
                  {isInProgress && (
                    <div className="progress-section">
                      <span className="progress-text">Progress: {getProblemProgress(problem.id)}</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${(configuredDevices[problem.id]?.size / problemMapping[problem.id].length) * 100}%`
                        }}></div>
                      </div>
                    </div>
                  )}

                  {/* Problem Details */}
                  <div className="problem-card-body">
                    <div className="card-section">
                      <span className="section-label">📍 Location:</span>
                      <p>{problem.location}</p>
                    </div>

                    <div className="card-section">
                      <span className="section-label">🔴 Problem:</span>
                      <p>{problem.problem}</p>
                    </div>

                    <div className="card-section">
                      <span className="section-label">✓ Solution:</span>
                      <p>{problem.solution}</p>
                    </div>

                    <div className="card-section">
                      <span className="section-label">📝 Steps:</span>
                      <ol className="steps-list">
                        {problem.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="problem-card-footer">
                    <button
                      className={`solve-button ${isSolved ? "unsolved-btn" : "solved-btn"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSolveProblem(problem.id);
                      }}
                    >
                      {isSolved ? "❌ Mark Unsolved" : "✓ Mark Solved"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
          )}
        </aside>

        {/* RIGHT SIDE - NETWORK DIAGRAM - DUAL WORLD LAYOUT */}
        <main className="diagram-container-v2">
          <div className="diagram-header-v2">
            <h2>🌐 Two Worlds Connected</h2>
            <p className="diagram-subtitle">LEFT: Upside Down | RIGHT: Hawkins | Fix network to restore signal</p>
          </div>

          {/* STATIC BACKGROUND */}
          <div className="world-container" />

          {/* REACT FLOW - DRAGGABLE LAYER */}
          <div className="react-flow-wrapper">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={{ custom: CustomNode }}
              panOnDrag={true}
              panOnScroll={true}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              translateExtent={[
                [-3000, -3000],
                [5000, 5000]
              ]}
              defaultViewport={{ x: 0, y: 0, zoom: 0.65 }}
            >
              <Background color="transparent" />
            </ReactFlow>
          </div>
        </main>
      </div>

      {/* CONFIGURATION MESSAGE */}
      {configMessage && (
        <div className={`config-message ${configMessage.type}`}>
          <p>{configMessage.text}</p>
        </div>
      )}

      {/* PROBLEM SELECTION MODAL */}
      {problemSelector && (
        <ProblemSelectionModal
          deviceId={problemSelector?.deviceId}
          problems={problemSelector?.problems}
          onSelectProblem={(problem) => {
            // SAFETY: Capture deviceId BEFORE clearing state to avoid undefined access
            const capturedDeviceId = problemSelector?.deviceId;
            setProblemSelector(null);
            if (capturedDeviceId && problem) {
              openConfig(problem, capturedDeviceId);
            }
          }}
          onClose={() => setProblemSelector(null)}
          problemsData={problemSelector?.problems}
          solvedProblems={solvedProblems}
        />
      )}

      {/* UNIFIED DEVICE CONFIGURATION PANEL — ALL 9 PROBLEMS */}
      {activeConfig && activeConfig.problem && activeConfig.mode && activeConfig.deviceId && (
        <div className="modal-overlay" onClick={() => {
          setActiveConfig(null);
          setConfigMessage(null);
          setValidationErrors({});
        }}>
          <div onClick={(e) => e.stopPropagation()}>
            <DeviceConfigPanel
              problem={activeConfig.problem}
              device={activeConfig.deviceId}
              mode={activeConfig.mode}
              config={deviceConfigs[activeConfig.deviceId] || {}}
              onConfigChange={handleConfigChange}
              onClose={() => {
                setActiveConfig(null);
                setConfigMessage(null);
                setValidationErrors({});
              }}
              onApply={handleApplyConfig}
              validationErrors={validationErrors}
              setValidationErrors={setValidationErrors}
              configMessage={configMessage}
              setConfigMessage={setConfigMessage}
              terminalInput={terminalInput}
              setTerminalInput={setTerminalInput}
              terminalOutput={terminalOutput}
              onTerminalCommand={handleTerminalCommand}
              selectedProblemForDevice={activeConfig.problem?.id}
              dnsConfig={dnsConfig}
              setDnsConfig={setDnsConfig}
              solvedProblems={solvedProblems}
              setSolvedProblems={setSolvedProblems}
              natState={natState}
              setNatState={setNatState}
              pcConfig={pcConfig}
              setPcConfig={setPcConfig}
              interfaceState={interfaceState}
              setInterfaceState={setInterfaceState}
              getDeviceLabel={getDeviceLabel}
              addStoryPopup={addStoryPopup}
              setSignalStrength={setSignalStrength}
            />
          </div>
        </div>
      )}

      {/* STORY POPUP CONTAINER - STRANGER THINGS THEME */}
      <StoryPopupContainer popups={storyPopups} />
      
      {/* CAMERA VIGNETTE - CINEMATIC EFFECT */}
      <div className="camera-vignette" />
    </div>
  );
}

function initializeNodes(nodeProblemMap, onBadgeClick, onDeviceClick) {
  const getProblems = (nodeId) => {
    return nodeProblemMap[nodeId] || [];
  };

  // ============================================
  // MAXIMUM CLARITY ENTERPRISE TOPOLOGY
  // ============================================

  const nodes = [
    // ============================================
    // GROUP CONTAINERS (MASSIVE BREATHABLE AREAS)
    // ============================================
    
    // HEAD OFFICE NETWORK - CENTER (VERY LARGE CONTAINER)
    {
      id: "group-head-office",
      data: { 
        label: "Hawkins Town",
        isGroup: true,
      },
      position: { x: 1000, y: 700 },
      style: {
        width: 1800,
        height: 1000,
        borderRadius: 20,
      },
      type: "custom",
      draggable: false,
      selectable: false,
      className: "group-node group-head-office",
    },

    // BRANCH A NETWORK - FAR LEFT TOP (LARGE)
    {
      id: "group-branch-a",
      data: { 
        label: "Upside Down Access",
        isGroup: true,
      },
      position: { x: 75, y: 700 },
      style: {
        width: 600,
        height: 1000,
        borderRadius: 20,
      },
      type: "custom",
      draggable: false,
      selectable: false,
      className: "group-node group-branch-a",
    },

    // BRANCH B NETWORK - FAR LEFT BOTTOM (LARGE GAP - ONLY 700px H)
    {
      id: "group-branch-b",
      data: { 
        label: "Emergency Network",
        isGroup: true,
      },
      position: { x: 75, y: 1850 },
      style: {
        width: 600,
        height: 700,
        borderRadius: 20,
      },
      type: "custom",
      draggable: false,
      selectable: false,
      className: "group-node group-branch-b",
    },

    // DATA CENTER NETWORK - FAR RIGHT (VERY LARGE)
    {
      id: "group-datacenter",
      data: { 
        label: "Central Command Hub",
        isGroup: true,
      },
      position: { x: 3150, y: 700 },
      style: {
        width: 1300,
        height: 1000,
        borderRadius: 20,
      },
      type: "custom",
      draggable: false,
      selectable: false,
      className: "group-node group-datacenter",
    },

    // ============================================
    // TOP LAYER (y=50): INTERNET
    // ============================================
    {
      id: "internet",
      data: { 
        label: "Public Internet",
        nodeType: "internet",
        problems: [],
        onBadgeClick,
      },
      position: { x: 2000, y: 50 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    // ============================================
    // UPPER CENTER (y=300): EDGE ROUTER
    // ============================================
    {
      id: "edge-router",
      data: { 
        deviceId: "edge-router",
        label: "Hawkins Gateway",
        sublabel: "WAN Access Point",
        nodeType: "router",
        problems: getProblems("edge-router"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 2000, y: 300 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    // ============================================
    // CENTRAL LAYER (y=600): CORE SWITCH (ANCHOR)
    // ============================================
    {
      id: "ho-core-switch",
      data: { 
        deviceId: "ho-core-switch",
        label: "Hawkins School",
        sublabel: "Core Network Hub",
        nodeType: "switch",
        problems: getProblems("ho-core-switch"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 2000, y: 600 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    // ============================================
    // DISTRIBUTION LAYER (y=950)
    // ============================================

    // BRANCH A ZONE (FAR LEFT)
    {
      id: "branch-a-router",
      data: { 
        deviceId: "branch-a-router",
        label: "Military Base",
        sublabel: "Remote Gateway",
        nodeType: "router",
        problems: getProblems("branch-a-router"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 300, y: 950 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    // HEAD OFFICE ZONE (CENTER) - VLAN Switches
    {
      id: "ho-access-switch-1",
      data: { 
        deviceId: "ho-access-switch-1",
        label: "Mike's House",
        sublabel: "VLAN 10 Access",
        nodeType: "switch",
        problems: getProblems("ho-access-switch-1"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 1200, y: 950 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    {
      id: "ho-access-switch-2",
      data: { 
        deviceId: "ho-access-switch-2",
        label: "Dustin's House",
        sublabel: "VLAN 20 Access",
        nodeType: "switch",
        problems: getProblems("ho-access-switch-2"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 2000, y: 950 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    {
      id: "ho-access-switch-3",
      data: { 
        deviceId: "ho-access-switch-3",
        label: "Lucas's House",
        sublabel: "VLAN 30 Access",
        nodeType: "switch",
        problems: getProblems("ho-access-switch-3"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 2800, y: 950 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    // DATA CENTER ZONE (FAR RIGHT)
    {
      id: "dc-router",
      data: { 
        label: "The Lab",
        sublabel: "Research Command",
        nodeType: "router",
        problems: [],
        onBadgeClick,
      },
      position: { x: 3600, y: 950 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    // ============================================
    // END DEVICES LAYER (y=1400)
    // ============================================

    // BRANCH A WORKSTATION
    {
      id: "branch-a-pc",
      data: { 
        label: "Starcourt Mall",
        sublabel: "Remote Access Point",
        nodeType: "workstation",
        problems: [],
        onBadgeClick,
      },
      position: { x: 300, y: 1400 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    // HEAD OFFICE WORKSTATIONS
    {
      id: "ho-pc-hr",
      data: { 
        deviceId: "ho-pc-hr",
        label: "Mike's Room",
        sublabel: "Hawkins Home Access",
        nodeType: "workstation",
        problems: getProblems("ho-pc-hr"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 1200, y: 1400 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    {
      id: "ho-pc-it-1",
      data: { 
        deviceId: "ho-pc-it-1",
        label: "Dustin's Setup",
        sublabel: "Tech Station",
        nodeType: "workstation",
        problems: getProblems("ho-pc-it-1"),
        onBadgeClick,
        isConfigurable: false,
        onDeviceClick,
      },
      position: { x: 1700, y: 1400 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    {
      id: "ho-pc-it-2",
      data: { 
        deviceId: "ho-pc-it-2",
        label: "Will's Connection",
        sublabel: "Network Bridge",
        nodeType: "workstation",
        problems: getProblems("ho-pc-it-2"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 2300, y: 1400 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    {
      id: "ho-pc-sales",
      data: { 
        label: "Lucas's Device",
        sublabel: "Connection Point",
        nodeType: "workstation",
        problems: getProblems("ho-pc-sales"),
        onBadgeClick,
      },
      position: { x: 2800, y: 1400 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    // DATA CENTER SERVERS
    {
      id: "dns-server",
      data: { 
        deviceId: "dns-server",
        label: "Hawkins Lab",
        sublabel: "Research Center",
        nodeType: "server",
        problems: getProblems("dns-server"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 3200, y: 1400 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    {
      id: "web-server",
      data: { 
        label: "Hopper's Cabin",
        sublabel: "Web Gateway",
        nodeType: "server",
        problems: [],
        onBadgeClick,
      },
      position: { x: 3600, y: 1400 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    {
      id: "db-server",
      data: { 
        label: "Hawkins Hospital",
        sublabel: "Critical Data",
        nodeType: "database",
        problems: [],
        onBadgeClick,
      },
      position: { x: 4000, y: 1400 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    // ============================================
    // BRANCH B ZONE (FAR LEFT BOTTOM)
    // ============================================
    {
      id: "branch-b-router",
      data: { 
        deviceId: "branch-b-router",
        label: "Military Compound",
        sublabel: "Remote Command Center",
        nodeType: "router",
        problems: getProblems("branch-b-router"),
        onBadgeClick,
        isConfigurable: true,
        onDeviceClick,
      },
      position: { x: 300, y: 2000 },
      type: "custom",
      draggable: true,
      selectable: true,
    },

    {
      id: "branch-b-pc",
      data: { 
        label: "Byers House",
        sublabel: "Emergency Access",
        nodeType: "workstation",
        problems: [],
        onBadgeClick,
      },
      position: { x: 300, y: 2350 },
      type: "custom",
      draggable: true,
      selectable: true,
    },
  ];

  // ============================================
  // APPLY DUAL WORLD CLASSIFICATION
  // ============================================
  const classifiedNodes = nodes.map(node => {
    if (node.data?.isGroup) {
      const worldClass = node.position.x < 2000 ? 'upside-down-group' : 'hawkins-group';
      return {
        ...node,
        className: `${node.className || ''} ${worldClass}`.trim()
      };
    } else if (node.data?.nodeType) {
      const worldClass = node.position.x < 2000 ? 'upside-down-node' : 'hawkins-node';
      return {
        ...node,
        className: `${node.className || ''} ${worldClass}`.trim()
      };
    }
    return node;
  });

  return classifiedNodes;
}

function initializeEdges() {
  const upsideDownNodes = new Set([
    "branch-a-router", "branch-a-pc",
    "branch-b-router", "branch-b-pc", "branch-b-workstation"
  ]);
  
  const getWorldClass = (sourceId, targetId) => {
    if (upsideDownNodes.has(sourceId) || upsideDownNodes.has(targetId)) {
      return 'upside-down-edge';
    }
    return 'hawkins-edge';
  };

  const baseEdges = [
    // ============================================
    // VERTICAL BACKBONE: INTERNET → EDGE → CORE
    // ============================================
    { id: "e-internet-edge", source: "internet", target: "edge-router", type: "orthogonal", stroke: "#0288d1", strokeWidth: 3, animated: false },
    { id: "e-edge-core", source: "edge-router", target: "ho-core-switch", type: "orthogonal", stroke: "#d32f2f", strokeWidth: 3, animated: false },

    // ============================================
    // CORE → DISTRIBUTION LAYER
    // ============================================
    { id: "e-core-branch-a", source: "ho-core-switch", target: "branch-a-router", type: "orthogonal", stroke: "#d32f2f", strokeWidth: 2, animated: false },
    { id: "e-core-hr", source: "ho-core-switch", target: "ho-access-switch-1", type: "orthogonal", stroke: "#d32f2f", strokeWidth: 2, animated: false },
    { id: "e-core-it", source: "ho-core-switch", target: "ho-access-switch-2", type: "orthogonal", stroke: "#d32f2f", strokeWidth: 2, animated: false },
    { id: "e-core-sales", source: "ho-core-switch", target: "ho-access-switch-3", type: "orthogonal", stroke: "#d32f2f", strokeWidth: 2, animated: false },
    { id: "e-core-dc-router", source: "ho-core-switch", target: "dc-router", type: "orthogonal", stroke: "#388e3c", strokeWidth: 2, animated: false },
    { id: "e-core-branch-b", source: "ho-core-switch", target: "branch-b-router", type: "orthogonal", stroke: "#d32f2f", strokeWidth: 2, animated: false },

    // ============================================
    // ACCESS SWITCHES → WORKSTATIONS (Vertical)
    // ============================================
    { id: "e-hr-pc", source: "ho-access-switch-1", target: "ho-pc-hr", type: "orthogonal", stroke: "#d32f2f", strokeWidth: 2, animated: false },
    { id: "e-it-pc1", source: "ho-access-switch-2", target: "ho-pc-it-1", type: "orthogonal", stroke: "#f57f17", strokeWidth: 2, animated: false },
    { id: "e-it-pc2", source: "ho-access-switch-2", target: "ho-pc-it-2", type: "orthogonal", stroke: "#f57f17", strokeWidth: 2, animated: false },
    { id: "e-sales-pc", source: "ho-access-switch-3", target: "ho-pc-sales", type: "orthogonal", stroke: "#f57f17", strokeWidth: 2, animated: false },

    // ============================================
    // BRANCH ROUTERS → WORKSTATIONS (Vertical)
    // ============================================
    { id: "e-branch-a-pc", source: "branch-a-router", target: "branch-a-pc", type: "orthogonal", stroke: "#7b1fa2", strokeWidth: 2, animated: true },
    { id: "e-branch-b-pc", source: "branch-b-router", target: "branch-b-pc", type: "orthogonal", stroke: "#7b1fa2", strokeWidth: 2, animated: true },

    // ============================================
    // DATA CENTER ROUTER → SERVERS (Horizontal)
    // ============================================
    { id: "e-dc-dns", source: "dc-router", target: "dns-server", type: "orthogonal", stroke: "#d32f2f", strokeWidth: 2, animated: false },
    { id: "e-dc-web", source: "dc-router", target: "web-server", type: "orthogonal", stroke: "#388e3c", strokeWidth: 2, animated: true },
    { id: "e-dc-db", source: "dc-router", target: "db-server", type: "orthogonal", stroke: "#388e3c", strokeWidth: 2, animated: true },
  ];

  return baseEdges.map(edge => ({
    ...edge,
    className: getWorldClass(edge.source, edge.target)
  }));
}
