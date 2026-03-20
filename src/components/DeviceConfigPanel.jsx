import React, { useState, useEffect } from 'react';

/**
 * DeviceConfigPanel Component
 * Provides UI for configuring device settings (IP, gateway, subnet, etc.)
 */
export default function DeviceConfigPanel({
  device,
  devices,
  configEdits,
  onConfigChange,
  onSave,
  onClose,
  validationStatus,
  className = '',
}) {
  const [localEdits, setLocalEdits] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  // Sync local edits with prop changes
  useEffect(() => {
    if (device?.id) {
      setLocalEdits(configEdits?.[device.id] || {});
    }
  }, [device?.id, configEdits]);

  if (!device) return null;

  const currentIp = localEdits.ip || device.ip || '';
  const currentGateway = localEdits.gateway || device.gateway || '';
  const currentSubnet = localEdits.subnet || device.subnet || '';

  const handleChange = (field, value) => {
    const updated = {
      ...localEdits,
      [field]: value,
    };
    setLocalEdits(updated);
    onConfigChange?.(device.id, updated);
  };

  const handleSave = () => {
    onSave?.(device.id, localEdits);
    setShowValidation(true);
  };

  const isValid = validationStatus?.[device.id]?.isValid || false;
  const validationMessage = validationStatus?.[device.id]?.message || '';

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'rgba(20, 40, 60, 0.95)',
        borderLeft: '3px solid #00ff00',
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '-5px 0 15px rgba(0, 255, 0, 0.15)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        borderBottom: '2px solid #00ff00',
        paddingBottom: '8px',
      }}>
        <h4 style={{
          margin: 0,
          color: '#00ff00',
          fontSize: '13px',
          fontWeight: 'bold',
        }}>
          ⚙️ {device.name}
        </h4>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#ff3333',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '0 8px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.color = '#ff6666'}
          onMouseLeave={(e) => e.target.style.color = '#ff3333'}
        >
          ✕
        </button>
      </div>

      {/* Device Info */}
      <div style={{
        fontSize: '10px',
        color: '#aaa',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: '8px',
        borderRadius: '4px',
        borderLeft: `3px solid ${device.powerState === 'on' ? '#00ff00' : '#666'}`,
      }}>
        <div><strong>Status:</strong> {device.powerState === 'on' ? '🟢 Online' : '🔴 Offline'}</div>
        <div><strong>Zone:</strong> {device.zone || 'N/A'}</div>
        <div><strong>Type:</strong> {device.ip ? 'Configured' : 'Not Configured'}</div>
      </div>

      {/* Validation Status */}
      {showValidation && (
        <div style={{
          padding: '10px',
          borderRadius: '4px',
          backgroundColor: isValid ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 51, 51, 0.1)',
          border: `1px solid ${isValid ? '#00ff00' : '#ff3333'}`,
          color: isValid ? '#00ff00' : '#ff6666',
          fontSize: '11px',
          fontWeight: 'bold',
        }}>
          <div style={{ marginBottom: '4px' }}>
            {isValid ? '✓ VALID CONFIGURATION' : '✗ CONFIGURATION ERROR'}
          </div>
          {validationMessage && (
            <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>
              {validationMessage}
            </div>
          )}
        </div>
      )}

      {/* IP Address Field */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          fontSize: '10px',
          color: '#aaa',
          display: 'block',
          marginBottom: '4px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}>
          IP Address
        </label>
        <div style={{
          fontSize: '9px',
          color: '#ffaa00',
          marginBottom: '6px',
          padding: '4px',
          backgroundColor: 'rgba(255, 170, 0, 0.1)',
          borderRadius: '2px',
          border: '1px solid rgba(255, 170, 0, 0.3)',
        }}>
          Expected: {device.ip || '(not set)'}
        </div>
        <input
          type="text"
          value={currentIp}
          onChange={(e) => handleChange('ip', e.target.value)}
          placeholder="e.g., 192.168.1.10"
          style={{
            width: '100%',
            padding: '6px',
            backgroundColor: 'rgba(0, 255, 0, 0.05)',
            border: '1px solid #00ff00',
            borderRadius: '3px',
            color: '#00ff00',
            fontFamily: 'Courier New, monospace',
            fontSize: '10px',
            boxSizing: 'border-box',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
            e.target.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none';
            e.target.style.backgroundColor = 'rgba(0, 255, 0, 0.05)';
          }}
        />
      </div>

      {/* Gateway Field */}
      {device.gateway && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            fontSize: '10px',
            color: '#aaa',
            display: 'block',
            marginBottom: '4px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}>
            Gateway
          </label>
          <div style={{
            fontSize: '9px',
            color: '#ffaa00',
            marginBottom: '6px',
            padding: '4px',
            backgroundColor: 'rgba(255, 170, 0, 0.1)',
            borderRadius: '2px',
            border: '1px solid rgba(255, 170, 0, 0.3)',
          }}>
            Expected: {device.gateway || '(not set)'}
          </div>
          <input
            type="text"
            value={currentGateway}
            onChange={(e) => handleChange('gateway', e.target.value)}
            placeholder="e.g., 192.168.1.254"
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: 'rgba(0, 255, 0, 0.05)',
              border: '1px solid #00ff00',
              borderRadius: '3px',
              color: '#00ff00',
              fontFamily: 'Courier New, monospace',
              fontSize: '10px',
              boxSizing: 'border-box',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
              e.target.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.backgroundColor = 'rgba(0, 255, 0, 0.05)';
            }}
          />
        </div>
      )}

      {/* Subnet Field */}
      {device.subnet && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            fontSize: '10px',
            color: '#aaa',
            display: 'block',
            marginBottom: '4px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}>
            Subnet
          </label>
          <div style={{
            fontSize: '9px',
            padding: '4px',
            backgroundColor: 'rgba(0, 255, 0, 0.05)',
            borderRadius: '2px',
            color: '#aaa',
          }}>
            {device.subnet}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: 'auto',
        paddingTop: '12px',
        borderTop: '1px solid rgba(0, 255, 0, 0.2)',
      }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#00ff00',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '11px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 0 15px #00ff00';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          💾 Save & Validate
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: '#aaa',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '11px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#ff00ff';
            e.target.style.borderColor = '#ff00ff';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#aaa';
            e.target.style.borderColor = '#444';
          }}
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
