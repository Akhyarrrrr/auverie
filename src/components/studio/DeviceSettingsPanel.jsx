import React from 'react';
import { Smartphone, Clock, Battery, Wifi, Sun, Moon, Zap } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function DeviceSettingsPanel() {
  const { project, updateGlobalSettings } = useProject();
  const settings = project.globalSettings;

  return (
    <div className="sidebar-content">
      {/* Theme Toggle */}
      <div className="form-group">
        <label className="form-label">
          <span>Tema Tampilan HP</span>
        </label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-item ${settings.theme === 'dark' ? 'active' : ''}`}
            onClick={() => updateGlobalSettings({ theme: 'dark' })}
          >
            <Moon size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            Mode Gelap (Dark)
          </button>
          <button
            type="button"
            className={`segmented-item ${settings.theme === 'light' ? 'active' : ''}`}
            onClick={() => updateGlobalSettings({ theme: 'light' })}
          >
            <Sun size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            Mode Terang (Light)
          </button>
        </div>
      </div>

      {/* Clock Time */}
      <div className="form-group">
        <label className="form-label">
          <span><Clock size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Jam HP</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={settings.time || "23:45"}
          onChange={(e) => updateGlobalSettings({ time: e.target.value })}
          placeholder="Format: 23:45 atau 01:15"
        />
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Mengubah jam di status bar dan layar kunci secara serempak.
        </span>
      </div>

      {/* Battery Level & Charging */}
      <div className="form-group">
        <div className="form-label">
          <span><Battery size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Baterai HP: <b>{settings.batteryLevel}%</b></span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px' }}>
            <input
              type="checkbox"
              checked={settings.isCharging || false}
              onChange={(e) => updateGlobalSettings({ isCharging: e.target.checked })}
            />
            <Zap size={12} color="#10b981" /> Charging
          </label>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={settings.batteryLevel || 50}
          onChange={(e) => updateGlobalSettings({ batteryLevel: parseInt(e.target.value, 10) })}
          style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
        />
      </div>

      {/* Network Type & Signal */}
      <div className="form-group">
        <label className="form-label">
          <span><Wifi size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Jaringan & Sinyal</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <select
            className="form-select"
            value={settings.networkType || "5G"}
            onChange={(e) => updateGlobalSettings({ networkType: e.target.value })}
          >
            <option value="5G">5G</option>
            <option value="WiFi">WiFi</option>
            <option value="4G">4G</option>
            <option value="LTE">LTE</option>
          </select>

          <select
            className="form-select"
            value={settings.signalBars || 4}
            onChange={(e) => updateGlobalSettings({ signalBars: parseInt(e.target.value, 10) })}
          >
            <option value={4}>4 Bar (Penuh)</option>
            <option value={3}>3 Bar</option>
            <option value={2}>2 Bar</option>
            <option value={1}>1 Bar (Lemah)</option>
          </select>
        </div>
      </div>

      {/* Carrier Name */}
      <div className="form-group">
        <label className="form-label">Operator Seluler</label>
        <input
          type="text"
          className="form-input"
          value={settings.carrier || "Telkomsel"}
          onChange={(e) => updateGlobalSettings({ carrier: e.target.value })}
          placeholder="Telkomsel, Indosat, XL..."
        />
      </div>
    </div>
  );
}
