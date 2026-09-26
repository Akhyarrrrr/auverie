import React from 'react';
import { Smartphone, Clock, Battery, Wifi, Sun, Moon, Zap, Music } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import PhoneModelSelector from './PhoneModelSelector';

export default function DeviceSettingsPanel() {
  const { project, updateGlobalSettings } = useProject();
  const settings = project.globalSettings || {};

  const timePresets = ["23:45", "01:24", "07:15", "14:30", "19:00"];

  return (
    <div className="sidebar-content">
      {/* 1. Model HP & Bezel Selection */}
      <PhoneModelSelector />

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

      {/* 2. Theme Toggle */}
      <div className="form-group">
        <label className="form-label">
          <span>Mode Gelap / Terang</span>
        </label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-item ${settings.theme === 'dark' ? 'active' : ''}`}
            onClick={() => updateGlobalSettings({ theme: 'dark' })}
          >
            <Moon size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            Gelap (Dark)
          </button>
          <button
            type="button"
            className={`segmented-item ${settings.theme === 'light' ? 'active' : ''}`}
            onClick={() => updateGlobalSettings({ theme: 'light' })}
          >
            <Sun size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            Terang (Light)
          </button>
        </div>
      </div>

      {/* 3. Clock Time & Presets */}
      <div className="form-group">
        <label className="form-label">
          <span><Clock size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Jam HP</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={settings.time || "23:45"}
          onChange={(e) => updateGlobalSettings({ time: e.target.value })}
          placeholder="23:45"
        />
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
          {timePresets.map(t => (
            <button
              key={t}
              type="button"
              className="btn-header"
              style={{
                padding: '2px 7px',
                fontSize: '11px',
                background: settings.time === t ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: settings.time === t ? '#ffffff' : 'var(--text-secondary)'
              }}
              onClick={() => updateGlobalSettings({ time: t })}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Battery Level & Charging */}
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

      {/* 5. Network Type & Signal */}
      <div className="form-group">
        <label className="form-label">
          <span><Wifi size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Jaringan & Operator</span>
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

          <input
            type="text"
            className="form-input"
            value={settings.carrier || "Telkomsel"}
            onChange={(e) => updateGlobalSettings({ carrier: e.target.value })}
            placeholder="Telkomsel, Indosat..."
          />
        </div>
      </div>

      {/* 6. Lockscreen Music Widget Toggle */}
      <div className="form-group">
        <div className="form-label">
          <span><Music size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Widget Musik di Layar Kunci</span>
          <input
            type="checkbox"
            checked={settings.lockscreenMusic?.enabled !== false}
            onChange={(e) => updateGlobalSettings({
              lockscreenMusic: {
                ...settings.lockscreenMusic,
                enabled: e.target.checked
              }
            })}
          />
        </div>
        {settings.lockscreenMusic?.enabled !== false && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              type="text"
              className="form-input"
              value={settings.lockscreenMusic?.title || "Penjaga Hati"}
              onChange={(e) => updateGlobalSettings({
                lockscreenMusic: {
                  ...settings.lockscreenMusic,
                  title: e.target.value
                }
              })}
              placeholder="Judul Lagu"
            />
            <input
              type="text"
              className="form-input"
              value={settings.lockscreenMusic?.artist || "Nadhif Basalamah"}
              onChange={(e) => updateGlobalSettings({
                lockscreenMusic: {
                  ...settings.lockscreenMusic,
                  artist: e.target.value
                }
              })}
              placeholder="Nama Penyanyi / Artis"
            />
          </div>
        )}
      </div>
    </div>
  );
}
