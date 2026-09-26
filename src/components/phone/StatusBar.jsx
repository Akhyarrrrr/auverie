import React from 'react';
import { Wifi } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function StatusBar({ customSettings = {} }) {
  const { project, activeSlide } = useProject();
  const settings = {
    ...project.globalSettings,
    ...(activeSlide?.customSettings || {}),
    ...customSettings
  };

  const isLight = settings.theme === 'light';
  const batteryLevel = Math.min(Math.max(1, settings.batteryLevel ?? 80), 100);
  const isCharging = settings.isCharging;
  const isLow = batteryLevel <= 20;

  return (
    <div className={`phone-status-bar ${isLight ? 'status-bar-dark' : ''}`}>
      {/* Clock Time */}
      <span className="status-bar-time">{settings.time || "23:45"}</span>

      {/* Dynamic Island */}
      <div className="dynamic-island">
        <div className="island-camera-lens"></div>
        <div className="island-sensor"></div>
      </div>

      {/* Network & Battery Status */}
      <div className="status-bar-icons">
        {/* Signal Bars */}
        <div className="signal-bars" title={`Signal: ${settings.signalBars || 4} bars`}>
          <div className={`signal-bar signal-bar-1 ${settings.signalBars >= 1 ? '' : 'inactive'}`}></div>
          <div className={`signal-bar signal-bar-2 ${settings.signalBars >= 2 ? '' : 'inactive'}`}></div>
          <div className={`signal-bar signal-bar-3 ${settings.signalBars >= 3 ? '' : 'inactive'}`}></div>
          <div className={`signal-bar signal-bar-4 ${settings.signalBars >= 4 ? '' : 'inactive'}`}></div>
        </div>

        {/* WiFi or Cellular Type */}
        {settings.networkType === 'WiFi' ? (
          <Wifi className="wifi-icon-svg" size={14} strokeWidth={2.5} />
        ) : (
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '-0.02em', marginRight: '1px' }}>
            {settings.networkType || '5G'}
          </span>
        )}

        {/* Battery Pill */}
        <div className="battery-pill" title={`${batteryLevel}% ${isCharging ? '(Charging)' : ''}`}>
          <div
            className={`battery-fill ${isCharging ? 'charging' : ''} ${isLow && !isCharging ? 'low' : ''}`}
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
      </div>
    </div>
  );
}
