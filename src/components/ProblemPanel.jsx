import React, { useMemo } from 'react';

/**
 * ProblemPanel Component
 * Dynamically displays all network misconfiguration issues
 */
export default function ProblemPanel({
  devices = {},
  connections = [],
  routingTables = {},
  className = '',
  onProblemClick,
}) {
  const problems = useMemo(() => {
    const issues = [];
    let problemId = 0;

    // Check each device for issues
    Object.entries(devices).forEach(([key, device]) => {
      // Device offline check
      if (device.powerState !== 'on') {
        issues.push({
          id: `${key}-offline`,
          type: 'offline',
          severity: 'info',
          device: device.name,
          deviceKey: key,
          message: `${device.name} is offline`,
          description: 'Boot device to bring it online',
          icon: '🔴',
        });
      }

      // IP Address misconfiguration
      if (device.powerState === 'on' && device.ip && !device.ip.includes('.')) {
        issues.push({
          id: `${key}-ip`,
          type: 'ipMisconfig',
          severity: 'critical',
          device: device.name,
          deviceKey: key,
          message: `Invalid IP address format`,
          description: `${device.name}: IP should be in format xxx.xxx.xxx.xxx`,
          icon: '⚠️',
        });
      }

      // Gateway misconfiguration (if expected but wrong)
      if (device.powerState === 'on' && device.gateway) {
        // Check if gateway is in same subnet
        if (!device.ip) {
          issues.push({
            id: `${key}-gateway`,
            type: 'gatewayMisconfig',
            severity: 'high',
            device: device.name,
            deviceKey: key,
            message: `Gateway configured but IP not set`,
            description: `${device.name} needs IP address first`,
            icon: '⚠️',
          });
        }
      }

      // Routing table issues (for routers)
      if (device.powerState === 'on' && device.name.includes('Router')) {
        const routing = routingTables[key];
        if (!routing || Object.keys(routing).length === 0) {
          issues.push({
            id: `${key}-routing`,
            type: 'routingMissing',
            severity: 'high',
            device: device.name,
            deviceKey: key,
            message: `No routes configured`,
            description: `Add routes using "route add" command in terminal`,
            icon: '🛣️',
          });
        }
      }
    });

    // Connection issues
    connections.forEach((conn, idx) => {
      const fromDevice = devices[conn.from];
      const toDevice = devices[conn.to];

      if (fromDevice?.powerState === 'on' && toDevice?.powerState === 'on' && !conn.active) {
        issues.push({
          id: `${conn.from}-${conn.to}-inactive`,
          type: 'inactiveConnection',
          severity: 'medium',
          device: `${fromDevice.name} → ${toDevice.name}`,
          message: `Connection inactive`,
          description: 'Check both devices are properly configured',
          icon: '🔗',
        });
      }
    });

    return issues;
  }, [devices, connections, routingTables]);

  const severityColor = {
    critical: '#ff3333',
    high: '#ff6600',
    medium: '#ffaa00',
    info: '#00aaff',
  };

  const severityLabel = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    info: 'INFO',
  };

  const fixedCount = Object.values(devices).filter(
    (d) => d.powerState === 'on' && !d.misconfigured
  ).length;

  const onlineCount = Object.values(devices).filter(
    (d) => d.powerState === 'on'
  ).length;

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'rgba(10, 20, 40, 0.95)',
        borderTop: '2px solid #ff6600',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #ff6600',
      }}>
        <div style={{
          color: '#ff6600',
          fontWeight: 'bold',
          fontSize: '13px',
          marginBottom: '6px',
        }}>
          🔍 Mission Problems
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '10px',
        }}>
          <div>
            <span style={{ color: '#aaa' }}>Fixed: </span>
            <span style={{ color: '#00ff00', fontWeight: 'bold' }}>
              {fixedCount}/{onlineCount}
            </span>
          </div>
          <div>
            <span style={{ color: '#aaa' }}>Issues: </span>
            <span style={{
              color: problems.length > 0 ? '#ff6600' : '#00ff00',
              fontWeight: 'bold',
            }}>
              {problems.length}
            </span>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {problems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px 12px',
            color: '#aaa',
            fontSize: '11px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
            <div>All systems configured correctly!</div>
            <div style={{ fontSize: '9px', marginTop: '4px', color: '#666' }}>
              Run diagnostics to verify connectivity
            </div>
          </div>
        ) : (
          problems.map((problem) => (
            <div
              key={problem.id}
              onClick={() => onProblemClick?.(problem.deviceKey)}
              style={{
                padding: '8px',
                marginBottom: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${severityColor[problem.severity]}`,
                borderLeft: `3px solid ${severityColor[problem.severity]}`,
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${severityColor[problem.severity]}15`;
                e.currentTarget.style.boxShadow = `0 0 10px ${severityColor[problem.severity]}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'start',
                gap: '8px',
              }}>
                <span style={{ fontSize: '12px', minWidth: '16px' }}>
                  {problem.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: severityColor[problem.severity],
                    marginBottom: '2px',
                  }}>
                    <span style={{ fontSize: '8px', marginRight: '6px' }}>
                      [{severityLabel[problem.severity]}]
                    </span>
                    {problem.message}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: '#aaa',
                    marginBottom: '4px',
                  }}>
                    Device: {problem.device}
                  </div>
                  <div style={{
                    fontSize: '8px',
                    color: '#666',
                    lineHeight: '1.3',
                  }}>
                    → {problem.description}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Progress Bar */}
      {problems.length > 0 && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 102, 0, 0.2)',
        }}>
          <div style={{
            fontSize: '9px',
            color: '#aaa',
            marginBottom: '4px',
          }}>
            Overall Progress
          </div>
          <div style={{
            height: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid #444',
          }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#00ff00',
                width: `${(fixedCount / (onlineCount || 1)) * 100}%`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
