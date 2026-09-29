import { Wifi } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function StatusBar({ islandType = 'dynamic-island', customSettings = {}, slide }) {
  const { project, activeSlide } = useProject();
  const settings = {
    ...project.globalSettings,
    ...((slide || activeSlide)?.customSettings || {}),
    ...customSettings
  };

  const isLight = settings.theme === 'light';
  const batteryLevel = Math.min(Math.max(1, settings.batteryLevel ?? 80), 100);
  const isCharging = settings.isCharging;
  const isLow = batteryLevel <= 20;
  const signalBars = settings.signalBars ?? 4;

  return (
    <div className={`phone-status-bar ${isLight ? 'status-bar-dark' : ''}`} data-edit-target="status-bar">
      {/* Clock Time */}
      <span className="status-bar-time">{settings.time || "23:45"}</span>

      {/* Screen Cutout Variant (Dynamic Island vs Notch vs Punch Hole) */}
      {islandType === 'dynamic-island' && (
        <div className="dynamic-island">
          <div className="island-camera-lens" />
          <div className="island-sensor" />
        </div>
      )}

      {islandType === 'classic-notch' && (
        <div className="classic-notch">
          <div className="notch-speaker" />
        </div>
      )}

      {islandType === 'punch-hole-center' && (
        <div className="punch-hole-center" />
      )}

      {/* Network & Battery Status */}
      <div className="status-bar-icons">
        {/* Signal Bars */}
        <div className="signal-bars" title={`Sinyal: ${signalBars} bar`}>
          <div className={`signal-bar signal-bar-1 ${signalBars >= 1 ? '' : 'inactive'}`} />
          <div className={`signal-bar signal-bar-2 ${signalBars >= 2 ? '' : 'inactive'}`} />
          <div className={`signal-bar signal-bar-3 ${signalBars >= 3 ? '' : 'inactive'}`} />
          <div className={`signal-bar signal-bar-4 ${signalBars >= 4 ? '' : 'inactive'}`} />
        </div>

        {/* WiFi or Cellular Type */}
        {settings.networkType === 'WiFi' ? (
          <Wifi className="wifi-icon-svg" size={14} strokeWidth={2.5} />
        ) : (
          <span className="status-bar-network">
            {settings.networkType || '5G'}
          </span>
        )}

        {/* Battery Pill */}
        <div className={`battery-pill ${isCharging ? 'is-charging' : ''}`} title={`${batteryLevel}% ${isCharging ? '(Charging)' : ''}`}>
          <span className="battery-number">{batteryLevel}</span>
          <div
            className={`battery-fill ${isCharging ? 'charging' : ''} ${isLow && !isCharging ? 'low' : ''}`}
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
      </div>
    </div>
  );
}
