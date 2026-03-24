# Network Problem Badges & Mapping Guide

## Problem Badge System

The network layout includes an intelligent problem badge system that visually identifies affected network components. Each problem is color-coded and linked to specific devices/connections.

## Problem Registry

### Problem #1: VLAN & Trunk Misconfiguration
**Severity**: 🔴 Critical  
**Location**: Head Office - Core & Access Switches

**Affected Nodes**:
- `ho-core-switch` (Issues with trunk port config)
- `ho-access-switch-1` (VLAN 10 trunk problems)
- `ho-access-switch-2` (VLAN 20 trunk problems) 
- `ho-access-switch-3` (VLAN 30 trunk problems)

**Problem Description**:
Trunk ports configured as access ports. VLAN traffic cannot cross switches between HR, IT, and Sales departments. PCs in different VLANs cannot communicate through the core switch.

**Solution**:
Configure trunk ports (802.1Q standard) on all inter-switch connections. Set access ports to individual VLANs:
- `i/f Gi0/1-3 on Core Sw` → `switchport mode trunk`
- HR Switch: `switchport mode trunk` on uplink
- IT Switch: `switchport mode trunk` on uplink
- Sales Switch: `switchport mode trunk` on uplink

**Validation Steps**:
1. `show interfaces trunk` - verify all trunk ports listed
2. `show vlan brief` - verify VLAN assignments
3. `ping 192.168.10.10` from IT PC to HR PC

---

### Problem #2: Wrong Default Gateway on PC
**Severity**: 🟠 High  
**Location**: Head Office - PC (HR)

**Affected Nodes**:
- `ho-pc-hr`

**Problem Description**:
PC in HR has gateway configured as `192.168.1.99` but should be `192.168.1.254`. The PC cannot reach the core switch and external networks. Local LAN communication works but routing fails.

**Solution**:
Update the network configuration on PC (HR) to point to correct gateway:
```
Old: IP 192.168.10.10, Gateway 192.168.1.99, Subnet 255.255.255.0
New: IP 192.168.10.10, Gateway 192.168.1.254, Subnet 255.255.255.0
```

**Validation Steps**:
1. Check config: `ipconfig` or `ip addr show`
2. Ping gateway: `ping 192.168.1.254` ✓
3. Ping server: `ping 10.0.0.50` ✓

---

### Problem #3: Inter-VLAN Routing Disabled
**Severity**: 🔴 Critical  
**Location**: Head Office - Layer 3 Switch

**Affected Nodes**:
- `ho-core-switch`

**Problem Description**:
Layer 3 switch missing the `ip routing` command globally. Even with correct VLAN trunk/access configs, VLANs remain isolated because routing isn't enabled. The switch only works as a Layer 2 device.

**Solution**:
Enable routing on the Layer 3 switch and create VLAN interface routes:
```
HO-Switch# configure terminal
HO-Switch(config)# ip routing
HO-Switch(config)# interface vlan 10
HO-Switch(config-if)# ip address 192.168.1.1 255.255.255.0
HO-Switch(config-if)# interface vlan 20
HO-Switch(config-if)# ip address 192.168.2.1 255.255.255.0
HO-Switch(config-if)# interface vlan 30
HO-Switch(config-if)# ip address 192.168.3.1 255.255.255.0
```

**Validation Steps**:
1. Verify: `show ip routing` - should show "Routing is enabled"
2. Check routes: `show ip route` - should see VLAN routes
3. Ping across VLAN: `ping 192.168.2.10` from HR PC

---

### Problem #4: Missing Static Routes (Branch A)
**Severity**: 🟠 High  
**Location**: Branch A - Router

**Affected Nodes**:
- `branch-a-router`

**Problem Description**:
Branch A router has no static routes configured. Branch office is isolated from Head Office and Data Center. The router can reach the edge router but cannot forward traffic to interior networks.

**Solution**:
Add static routes on Branch A router to reach all internal networks via Edge Router:
```
Branch-A-Router# configure terminal
Branch-A-Router(config)# ip route 192.168.0.0 255.255.255.0 203.0.113.1
Branch-A-Router(config)# ip route 10.0.0.0 255.255.0.0 203.0.113.1
Branch-A-Router(config)# ip route 172.16.0.0 255.255.255.0 203.0.113.1
```

**Validation Steps**:
1. Show routes: `show ip route static`
2. Trace to HO: `traceroute 192.168.1.254`
3. Trace to DC: `traceroute 10.0.0.10`

---

### Problem #5: OSPF Misconfiguration (Branch B)
**Severity**: 🟠 High  
**Location**: Branch B - Router

**Affected Nodes**:
- `branch-b-router`

**Problem Description**:
OSPF is not advertising networks. Neighbor relationships are not forming between Branch B and Edge Router. Branch B routes are not converged in the network routing table.

**Solution**:
Configure OSPF to advertise all subnetworks and establish neighbors:
```
Branch-B-Router# configure terminal
Branch-B-Router(config)# router ospf 1
Branch-B-Router(config-router)# network 172.17.0.0 0.0.0.255 area 0
Branch-B-Router(config-router)# network 203.0.113.0 0.0.0.255 area 0
Branch-B-Router(config-router)# neighbor 203.0.113.1
```

**Validation Steps**:
1. Show neighbors: `show ip ospf neighbor` - should see Edge Router
2. Check routing: `show ip route ospf` - should see learned routes
3. Verify connectivity: `ping 192.168.1.10`

---

### Problem #6: DNS Server Misconfiguration
**Severity**: 🟠 High  
**Location**: Data Center - DNS Server

**Affected Nodes**:
- `dns-server` (10.0.0.1)

**Problem Description**:
PCs can access resources by IP address but cannot resolve domain names. Example: `ping webserver.technova.local` fails but `ping 10.0.0.50` works. DNS service is not responding to queries.

**Solution**:
Configure DNS zone files with A records for all services:
```
DNS-Server# configure zone technova.local
Zone File:
  webserver     IN  A  10.0.0.50
  db            IN  A  10.0.1.50
  core-app      IN  A  10.0.0.10
  backup        IN  A  10.0.0.100
  mail          IN  A  10.0.0.20
```

**Validation Steps**:
1. Test resolution: `nslookup webserver.technova.local 10.0.0.1` ✓
2. Reverse lookup: `nslookup 10.0.0.50` ✓
3. Service status: `systemctl status dns` - should be running

---

### Problem #7: NAT Rules Incomplete
**Severity**: 🟠 High  
**Location**: Internet - Edge Router

**Affected Nodes**:
- `edge-router`

**Problem Description**:
NAT (Network Address Translation) is not fully configured. Only some internal networks are translated to public IPs. Some employees cannot access the internet because their traffic isn't being NAT'd.

**Solution**:
Add comprehensive NAT rules to translate all internal subnets to public IP:
```
Edge-Router# configure terminal
Edge-Router(config)# ip nat inside source list ACL_INTERNAL interface GigabitEthernet0 overload
Edge-Router(config)# access-list 1 permit 192.168.0.0 0.0.255.255
Edge-Router(config)# access-list 1 permit 172.16.0.0 0.0.15.255
Edge-Router(config)# access-list 1 permit 10.0.0.0 0.0.255.255
Edge-Router(config)# interface GigabitEthernet0
Edge-Router(config-if)# ip nat outside
```

**Validation Steps**:
1. Show NAT stats: `show ip nat statistics`
2. Show translations: `show ip nat translations`
3. Test internet: `ping 8.8.8.8` from any PC

---

### Problem #8: Duplicate IP Addresses
**Severity**: 🔴 Critical  
**Location**: Head Office - IT VLAN

**Affected Nodes**:
- `ho-pc-it-2`

**Problem Description**:
Two PCs in the IT VLAN (VLAN 20) have the same IP address. Both PC-IT1 and PC-IT2 are configured with `192.168.20.25`. This causes ARP conflicts and intermittent connectivity failures.

**Solution**:
Assign unique IP addresses to each device:
```
PC-IT1: Keep 192.168.20.25 (original)
PC-IT2: Change to 192.168.20.51 (new)

Both: Gateway 192.168.20.1, Subnet 255.255.255.0
```

**Validation Steps**:
1. Check IPs: `arp -a` - should see distinct entries
2. Verify each PC: `ipconfig` on each machine
3. Ping both: `ping 192.168.20.25` and `ping 192.168.20.51` ✓

---

### Problem #9: Shutdown Interfaces
**Severity**: 🔴 Critical  
**Location**: Head Office - Switch Uplinks

**Affected Nodes**:
- `ho-access-switch-1` (HR uplink shutdown)
- `ho-access-switch-2` (IT uplink shutdown)
- `ho-access-switch-3` (Sales uplink shutdown)

**Problem Description**:
Some switch uplinks are administratively shut down. The interfaces connecting access switches to the core are disabled. Entire VLANs go offline or experience intermittent failures.

**Solution**:
Enable the shutdown interfaces on all access switches:
```
HR-Switch# configure terminal
HR-Switch(config)# interface Gi0/1 (uplink to core)
HR-Switch(config-if)# no shutdown

IT-Switch# configure terminal
IT-Switch(config)# interface Gi0/1
IT-Switch(config-if)# no shutdown

Sales-Switch# configure terminal
Sales-Switch(config)# interface Gi0/1
Sales-Switch(config-if)# no shutdown
```

**Validation Steps**:
1. Check interfaces: `show interfaces status | include connected`
2. Verify all uplinks: Should see "up/up" status
3. Test VLAN traffic: Ping between departments ✓

---

## Problem Highlighting Feature

### When Badge is Clicked:

```javascript
// User clicks on badge #1 (VLAN Misconfiguration)
// System highlights ALL affected nodes with animated pulsing

Highlighted Nodes:
  🔴 ho-core-switch (pulsing red)
  🔴 ho-access-switch-1 (pulsing red)
  🔴 ho-access-switch-2 (pulsing red)
  🔴 ho-access-switch-3 (pulsing red)

Modal Shows:
  Title: VLAN & Trunk Misconfiguration
  Location: Head Office - Core & Access Switches
  Problem: [Full description]
  Solution: [Configuration steps]
  Steps: [Numbered checklist]
```

---

## Badge Color Legend

| Color | Hex | Meaning |
|-------|-----|---------|
| 🔴 Red | #d32f2f | Critical - Network down or isolated |
| 🟠 Orange | #f57f17 | High - Partial connectivity loss |
| 🟡 Yellow | #fbc02d | Medium - Potential issues |
| 🟢 Green | #388e3c | OK - No problems |
| ⚫ Gray | #757575 | Offline/Disabled |

---

## Implementation Code Example

### Badge Click Handler:
```javascript
const handleShowProblemDetails = (problemId) => {
  setSelectedProblem(problems.find(p => p.id === problemId));
  setShowProblemModal(true);
  
  // Highlight all affected devices
  setHighlightedProblems(new Set([problemId]));
  
  // Update nodes with highlighted class
  setNodes(n => n.map(node => ({
    ...node,
    data: {
      ...node.data,
      highlighted: node.data.problems?.includes(problemId) || false
    }
  })));
};
```

### Problem Mapping:
```javascript
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
```

---

## Quick Diagnostic Matrix

| Problem ID | Type | Severity | Quick Fix | Check Command |
|---|---|---|---|---|
| 1 | Config | Critical | Add trunk config | `show int trunk` |
| 2 | Config | High | Change gateway IP | `ipconfig` |
| 3 | Config | Critical | Enable `ip routing` | `show ip routing` |
| 4 | Route | High | Add static routes | `show ip route static` |
| 5 | Route | High | Configure OSPF | `show ip ospf neighbor` |
| 6 | Service | High | Configure DNS zone | `nslookup test` |
| 7 | Config | High | Add NAT rules | `show ip nat stat` |
| 8 | Config | Critical | Change duplicate IP | `arp -a` |
| 9 | Config | Critical | Enable interfaces | `show int status` |

---

## Problem Verification Checklist

After fixing each problem, verify with:

**Problem #1**: `show interfaces trunk` - All trunks should be active
**Problem #2**: `ping 10.0.0.1` from PC-HR - Should succeed
**Problem #3**: `show ip route vlan 10` - Should show inter-VLAN routes
**Problem #4**: `ping 192.168.1.1` from Branch A - Should succeed
**Problem #5**: `show ip ospf neighbor` - Branch B should appear
**Problem #6**: `nslookup webserver.technova.local` - Should resolve
**Problem #7**: `show ip nat translations` - Should show translations
**Problem #8**: `arp -a | grep 192.168.20` - Should show unique entries
**Problem #9**: `show interfaces Gi0/1 status` - All uplinks "up/up"

---

## All Problems Solved Criteria

✅ Network is fully operational when all 9 problems are marked as solved
✅ All devices can communicate with each other
✅ Branch offices can reach Head Office and Data Center  
✅ Data Center services are accessible to all locations
✅ Internet access is available from all networks
✅ DNS resolution works for all services
✅ No duplicate IPs or configuration conflicts

---

*This badge system provides students with clear visual feedback and structured guidance for network troubleshooting.*
