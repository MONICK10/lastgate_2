# Network Topology Visualization - ASCII & Visual Diagrams

## 🗂️ Complete Network Structure Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TechNova Network Infrastructure                          │
└─────────────────────────────────────────────────────────────────────────────┘

                            TIER 1: INTERNET LAYER
                                 (y: 50-200)
                            
                          ☁️ Internet Cloud
                            (500, 50)
                                 │
                         ╔═══════╩═══════╗
                         │ WAN Link      │
                    (animated blue)     │
                         ↓              │
                    🛣️ Edge Router     
                    (500, 200)         
              ┌─ NAT Rules, WAN Gateway}
              │  Problem #7
              │


                     TIER 2: CORE INFRASTRUCTURE LAYER
                              (y: 320-420)
                              
    ┌──────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │               Large Horizontal Spacing                            │
    │               (150-300px between sections)                        │
    │                                                                    │
    │  🏢               🏪              🏪              🖥️              │
    │  HEAD OFFICE      BRANCH A        BRANCH B        DATA CENTER    │
    │                                                                    │
    │  🔀Core Sw        🛣️Router-A      🛣️Router-B      🛣️DC Router   │
    │  (80, 420)        (-200,420)      (-50, 420)      (500, 420)    │
    │  L3 Switch        Branch Router   Branch Router   DC Gateway    │
    │  Problems:        Problem #4      Problem #5      No Problems   │
    │  #1, #3           Static Routes   OSPF Config                   │
    │  VLAN/Routing     Missing         Not Converged                 │
    │                                                                    │
    └──────────────────────────────────────────────────────────────────┘
         

                    TIER 3: ACCESS & ENDPOINT LAYER
                            (y: 580-750)
                              

┌────────────── HEAD OFFICE SECTION ──────────────────────────────────────┐
│                                                                            │
│  Department VLANs                      Vertical Spacing: 170px           │
│  ──────────────                                                           │
│                                                                            │
│    HR DEPT          IT DEPT            SALES DEPT                         │
│    VLAN 10          VLAN 20            VLAN 30                            │
│    x=-100           x=80               x=260                              │
│                                                                            │
│    🔀 HR-Sw         🔀 IT-Sw           🔀 Sales-Sw                       │
│    y=580            y=580              y=580                              │
│    Problem #9       Problem #9         Problem #9                         │
│    Shutdown         Shutdown           Shutdown                           │
│    Uplinks          Uplinks            Uplinks                            │
│         │                │                  │                             │
│         ├─ 85px gap  ├─ 85px gap  ├─ 85px gap                           │
│         │                │                  │                             │
│    💻 PC-HR         💻PC-IT1    💻PC-IT2   💻PC-Sales                    │
│    y=750            y=750      y=750       y=750                          │
│    Prob#2:          Prob#8:    Prob#8:                                    │
│    Wrong            Conflict   Duplicate                                  │
│    Gateway          IP Issue   IP (Same)                                  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘


┌────────────── BRANCH A SECTION ──────────────────────────────────────┐
│                                                                        │
│    Separate from HO: 250px left (x=-200)                             │
│                                                                        │
│    🛣️ Router-A              🔀 SW-A                                  │
│    x=-200, y=420            x=-200, y=580                            │
│    Problem #4:              (Local Switch)                            │
│    No Static Routes                                                   │
│         │                        │                                    │
│         │        100px gap       │                                    │
│         └────────────────────────┘                                    │
│                                                                        │
│         💻 PC-A                                                       │
│         x=-200, y=750                                                 │
│         (Branch Client)                                               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘


┌────────────── BRANCH B SECTION ──────────────────────────────────────┐
│                                                                        │
│    Separate from HO: 130px left (x=-50)                              │
│                                                                        │
│    🛣️ Router-B              🔀 SW-B                                  │
│    x=-50, y=420             x=-50, y=580                             │
│    Problem #5:              (Local Switch)                            │
│    OSPF Misconfiguration                                              │
│         │                        │                                    │
│         │        100px gap       │                                    │
│         └────────────────────────┘                                    │
│                                                                        │
│         💻 PC-B                                                       │
│         x=-50, y=750                                                  │
│         (Branch Client)                                               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘


┌──────────────── DATA CENTER SECTION ────────────────────────────────────┐
│                                                                           │
│   EXTRA SPACING: 200px+ wide area (x: 300-700)                          │
│   Allows servers to be clearly visible & independent                    │
│                                                                           │
│   🖥️ DC Router (500, 420)                                               │
│   Gateway to all servers                                                 │
│                    │                                                     │
│   ┌────────────────┼────────────────┬──────────────┬──────────────┐    │
│   │                │                │              │              │    │
│   ↓                ↓                ↓              ↓              ↓    │
│                                                                           │
│   🖥️CoreApp      🌐Web          🗄️Database     🌐DNS           💾Bkp  │
│   i:350,580    i:425,580      i:500,580      i:575,580      i:650,580 │
│   10.0.0.10    10.0.0.50      10.0.1.50      10.0.0.1        10.0.0.100│
│   ✓ OK         ✓ OK           ✓ OK           ✗ Problem#6      ✓ OK    │
│                                              DNS Config              │
│                                              Issues                 │
│                                                                           │
│   ├─ 75px gap ─┤ ├─ 75px gap ─┤ ├─ 75px gap ─┤ ├─ 75px gap ─┤        │
│                                                                           │
│   Total DC Width: 400px (plenty of room, no overlap)                    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Connection Architecture

### Internet to Data Center Route
```
Internet Cloud (500,50)
    │
    │ WAN Link (Blue, Animated)
    │
    ↓
Edge Router (500,200)
    │
    │ Backbone (Red, 3px)
    │
    ↓
Core Switch (80,420)
    │
    │ Secure Link (Green)
    │
    ↓
DC Router (500,420)
    │
    ├─ App Link → Core Server (350,580)
    ├─ Web Link → Web Server (425,580)
    ├─ DB Link  → DB Server (500,580)
    └─ DNS Link → DNS Server (575,580) ❌ Problem #6
```

### Head Office Internal Route (Example: HR Dept)
```
HR PC (HR Dept, 192.168.10.10)
    │
    │ Access Port (Blue, 2px)
    │
    ↓
HR Access Switch (VLAN 10, x=-100, y=580) ❌ Problem #1, #9
    │
    │ Trunk Port (Red, 2px)
    │ ❌ Problem #1: Not configured properly
    │
    ↓
Core Switch (L3, x=80, y=420) ❌ Problem #1, #3
    │ ❌ Problem #3: IP Routing disabled
    │
    │ If routing works:
    ├─ Can reach other VLANs (IT: 192.168.20.x, Sales: 192.168.30.x)
    ├─ Can reach Edge Router (203.0.113.1)
    ├─ Can reach Data Center (10.0.0.0/8)
    └─ Can reach Internet (via Edge Router)

Current Status: ❌ BROKEN (due to Problems #1, #3)
```

### Branch A Remote Access Route
```
Branch A PC (172.16.1.10)
    │
    ↓
Branch A Switch (172.16.1.0/24, x=-200, y=580)
    │
    ↓
Branch A Router (172.16.0.1, x=-200, y=420) ❌ Problem #4
    │ ❌ Problem #4: No static routes configured
    │
    │ WAN Link to Edge Router
    │
    ↓
Edge Router (203.0.113.1, x=500, y=200)
    │
    │ If routing configured:
    ├─ Route to HO (192.168.0.0/16)
    ├─ Route to DC (10.0.0.0/8)
    └─ Route to Internet (0.0.0.0/0)

Current Status: ❌ ISOLATED (Branch A cannot reach HO/DC)
```

---

## 📊 Spacing & Positioning Matrix

### X-Axis (Horizontal) Distribution
```
-200px    -100px    0px       100px    200px    300px    400px    500px    600px    700px
  │         │        │          │        │        │        │        │        │        │
  A         B        I          J        K        L        M        N        O        P
                            HEAD OFFICE       DC SECTION
  BRANCH A        BRANCH B    AREA             (400px wide)
  
Legend:
A: Branch-A (-200px)
B: Access area (-100px to 0px)
I: HEAD OFFICE Core (80px)
M-P: DATA CENTER (350-650px)

Spacing Analysis:
- Branch A to HO: 280px gap (independent section)
- HO internal: 260px max (HR to Sales)
- HO to DC: 300px+ gap (separate infrastructure)
- DC servers: 75px between each (5 servers, 400px total)
```

### Y-Axis (Vertical) Distribution
```
Layer 1: y=50-200      Internet & Edge (150px layer)
           ↓
           GAP: 120px
           ↓
Layer 2: y=320-420     Core Infrastructure (100px layer)
           ↓
           GAP: 160px
           ↓
Layer 3: y=580-750     Endpoints (170px layer)

Total Vertical Height: 750px
```

---

## 🎨 Color Legend & Problem Badges

### Device Colors
```
🔴 RED ─────────────────  Has Problems (#d32f2f)
├─ Switches with VLAN issues
├─ Routers with routing problems
├─ PCs with configuration errors
└─ Servers with service issues

🟢 GREEN ────────────────  Properly Configured (#388e3c)
├─ Data Center Servers (mostly working)
├─ Branch Switches (local function OK)
└─ PCs without configuration issues

🟡 YELLOW ───────────────  Warning/Temporary (#f57f17)
├─ Branch A Switch (won't work until Router fixed)
├─ PC-IT1 (works but in same VLAN as duplicate IP)
└─ PCs that can't reach full network

🔵 BLUE ─────────────────  Functional (#1976d2)
├─ Access port connections
├─ Internet infrastructure
└─ Working devices

⚫ GRAY ─────────────────  Offline/Disabled (#757575)
├─ Shutdown interfaces
├─ Disabled services
└─ Offline devices
```

### Problem Badge Numbers
```
Badge on Device                      Problem Type

#1 ────────────────────────────────  VLAN & Trunk Config
   📍 Location: Core + 3 Access Switches
   ❌ Impact: VLANs isolated, no inter-department comms

#2 ────────────────────────────────  Wrong Gateway
   📍 Location: PC-HR
   ❌ Impact: HR PC can't reach servers

#3 ────────────────────────────────  Routing Disabled
   📍 Location: Core Switch (L3)
   ❌ Impact: No inter-VLAN traffic even with trunks

#4 ────────────────────────────────  Missing Routes
   📍 Location: Branch A Router
   ❌ Impact: Branch A isolated from HO & DC

#5 ────────────────────────────────  OSPF Down
   📍 Location: Branch B Router
   ❌ Impact: Branch B routing converged

#6 ────────────────────────────────  DNS Failure
   📍 Location: DNS Server
   ❌ Impact: No domain name resolution

#7 ────────────────────────────────  NAT Incomplete
   📍 Location: Edge Router
   ❌ Impact: Internet access fails for some networks

#8 ────────────────────────────────  Duplicate IP
   📍 Location: PC-IT2
   ❌ Impact: ARP conflicts in VLAN 20

#9 ────────────────────────────────  Shutdown Ports
   📍 Location: 3 Access Switches
   ❌ Impact: Entire departments go offline
```

---

## 🌐 Network Segments & VLAN Structure

```
┌─────────────────────── HEAD OFFICE ─────────────────────────┐
│                                                               │
│  VLAN 10 (HR)           VLAN 20 (IT)        VLAN 30 (Sales) │
│  ─────────           ──────────          ────────────        │
│  10.200.10.0/24      10.200.20.0/24      10.200.30.0/24     │
│  Gateway: 10.200.1.1 Gateway: 10.200.1.2 Gateway: 10.200.1.3│
│                                                               │
│  Devices:            Devices:             Devices:          │
│  · PC-HR             · PC-IT1 ✓           · PC-Sales ✓      │
│  · (more PCs)        · PC-IT2 ❌ Dup IP   · (more PCs)      │
│                                                               │
│  ─────────────────────────────────────────────────────────   │
│  Layer 3 Switch (Core): 10.200.1.0/24                        │
│  IP: 10.200.1.254                                            │
│  Status: ❌ Routing not enabled (Problem #3)                │
│  ─────────────────────────────────────────────────────────   │
│                                                               │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────── BRANCH A ──────────────────────────────┐
│                                                                 │
│  VLAN 40 (Branch A Local)                                      │
│  ───────────────────────                                       │
│  172.16.1.0/24                                                 │
│  Gateway: 172.16.0.1 (Branch Router)                           │
│                                                                │
│  Router IP: 172.16.0.1                                         │
│  Status: ❌ No static routes (Problem #4)                     │
│  Cannot reach: HO (192.168.0.0/16), DC (10.0.0.0/8)          │
│                                                                │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────── BRANCH B ──────────────────────────────┐
│                                                                 │
│  VLAN 50 (Branch B Local)                                      │
│  ───────────────────────                                       │
│  172.17.1.0/24                                                 │
│  Gateway: 172.17.0.1 (Branch Router)                           │
│                                                                │
│  Router IP: 172.17.0.1                                         │
│  Status: ❌ OSPF not configured (Problem #5)                  │
│  Routes not converging                                         │
│                                                                │
└─────────────────────────────────────────────────────────────┘


┌────────────────────── DATA CENTER ────────────────────────────┐
│                                                                 │
│  VLAN 60 (DC Services - Primary)       VLAN 61 (DB Tier)      │
│  ────────────────────────────────      ──────────────────     │
│  10.0.0.0/24                           10.0.1.0/24            │
│  Gateway: 10.0.0.254                   Gateway: 10.0.1.254    │
│                                                                │
│  Devices:                              Devices:               │
│  · Web Server: 10.0.0.50 ✓             · DB Server: 10.0.1.50│
│  · Core App: 10.0.0.10 ✓               Status: ✓ Working      │
│  · DNS: 10.0.0.1 ❌ Problem #6                                │
│  · Backup: 10.0.0.100 ✓                                       │
│                                                                │
│  DC Router: 10.0.0.254                                         │
│  Status: ✓ No problems                                         │
│                                                                │
└─────────────────────────────────────────────────────────────┘


┌──────────────────── INTERNET ────────────────────────────────┐
│                                                                │
│  Public WAN                                                    │
│  ──────────                                                    │
│  203.0.113.0/24                                                │
│  Edge Router: 203.0.113.1                                      │
│  Status: ❌ NAT incomplete (Problem #7)               │
│                                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Edge Connection Types

```
TYPE: Backbone/Core Links (Critical Infrastructure)
────────────────────────────────────────────────────
Color: 🔴 Red (#d32f2f)
Width: 3px
Style: Solid curve (smoothstep)
Example: HO Core → Edge Router

Connection Quality:
  ├─ High bandwidth (100+ Mbps)
  ├─ Low latency (<1ms)
  └─ Critical for network function


TYPE: Trunk Ports (VLAN Carrying)
─────────────────────────────────
Color: 🔴 Red (#d32f2f)
Width: 2px
Style: Solid curve
Example: Core Switch → Access Switches
Problems: #1 (misconfigured)

Connection Detail:
  ├─ Carries multiple VLANs (tagged frames)
  ├─ Should be 802.1Q trunks
  └─ ❌ Problem: Configured as access ports


TYPE: Access Ports (End Device Connection)
──────────────────────────────────────────
Color: 🔵 Blue (#1976d2)
Width: 2px
Style: Solid curve
Example: Switch → PC

Connection Detail:
  ├─ Single VLAN per port
  ├─ Untagged traffic
  └─ Standard PC connections


TYPE: WAN Links (Remote Office)
────────────────────────────────
Color: 🔴 Red (#d32f2f)
Width: 3px
Style: Solid curve, animated
Example: Branch Router ↔ Edge Router

Connection Detail:
  ├─ Long distance links
  ├─ May have latency
  └─ Router-to-router


TYPE: Secure Links (Data Center)
────────────────────────────────
Color: 🟢 Green (#388e3c)
Width: 3px
Style: Solid curve, some animated
Example: DC Router → Servers

Connection Detail:
  ├─ High security priority
  ├─ Real-time monitoring
  └─ Production systems
```

---

## 📈 Connectivity Matrix

```
FROM        TO           STATUS  ROUTE                          PROBLEM
─────────────────────────────────────────────────────────────────────────

HR-PC    → IT-PC         ❌     HR-Sw→Core→IT-Sw→IT-PC      #1, #3, #9

HR-PC    → Web-Server    ❌     HR-Sw→Core→Edge→DC-Rtr→Web  #1, #3, #9

Branch-A → HO            ❌     BR-A-Rtr→Edge→HO             #4

Branch-B → DC            ❌     BR-B-Rtr→Edge→DC             #5

DNS      → Resolution    ❌     DNS Service Down              #6

Any-PC   → Internet      ❌     Core→Edge→ISP↔Public          #7

All      → All           ✓      After all 9 problems fixed   None

```

---

## ✨ Visual Hierarchy

```
IMPORTANCE LEVELS:

🔴 CRITICAL (Immediate Fix Required)
   ├─ Problem #1: VLAN trunk misconfiguration
   ├─ Problem #3: Inter-VLAN routing disabled
   ├─ Problem #8: Duplicate IP conflicts
   └─ Problem #9: Shutdown interfaces

🟠 HIGH (Fix Soon)
   ├─ Problem #2: Wrong gateway on HR PC
   ├─ Problem #4: Missing static routes
   ├─ Problem #5: OSPF not converging
   ├─ Problem #6: DNS misconfiguration
   └─ Problem #7: NAT rules incomplete


DEVICE COMPLEXITY (Learning Difficulty):

⭐ BASIC (PCs)
   └─ Just need IP & gateway

⭐⭐ INTERMEDIATE (Switches & Simple Routing)
   ├─ VLANs & trunks
   └─ Basic static routes

⭐⭐⭐ ADVANCED (Layer 3, Routing, Services)
   ├─ Inter-VLAN routing
   ├─ OSPF convergence
   ├─ DNS configuration
   └─ NAT rules


FIX SEQUENCE (Recommended Order):

1. Fix trunking (#1) – Enable inter-switch comms
2. Fix routing (#3) – Enable inter-VLAN routing
3. Fix interfaces (#9) – Restore switch connections
4. Fix gateway (#2) – HR PC can now reach servers
5. Fix Branch A routes (#4) – Remote office online
6. Fix Branch B OSPF (#5) – Second branch online
7. Fix DNS (#6) – Name resolution works
8. Fix Duplicate IP (#8) – No more conflicts
9. Fix NAT (#7) – Internet access restored
```

---

## 🎯 Quick Troubleshooting Flowchart

```
START: Network not working

   │
   ├─→ Can HR PC reach IT PC in same building?
   │   ├─ NO → Check Problems #1, #2, #3, #9
   │   │      (VLAN config, gateway, routing, ports)
   │   │
   │   └─ YES → Next
   │
   ├─→ Can HO reach Data Center?
   │   ├─ NO → Check Problems #1, #3, #7
   │   │      (Core infrastructure issues)
   │   │
   │   └─ YES → Next
   │
   ├─→ Can Branch A reach Head Office?
   │   ├─ NO → Check Problem #4
   │   │      (Static routes missing)
   │   │
   │   └─ YES → Next
   │
   ├─→ Can Branch B reach anywhere?
   │   ├─ NO → Check Problem #5
   │   │      (OSPF not working)
   │   │
   │   └─ YES → Next
   │
   ├─→ Can anyone resolve DNS names?
   │   ├─ NO → Check Problem #6
   │   │      (DNS server issues)
   │   │
   │   └─ YES → Next
   │
   ├─→ Can anyone reach Internet?
   │   ├─ NO → Check Problem #7
   │   │      (NAT rules)
   │   │
   │   └─ YES → Next
   │
   └─→ All problems solved! ✅
       Network fully restored.
```

---

*Network Topology Visualization Guide v2.0*  
*All coordinates, problems, and connections documented*  
*Ready for educational deployment*
