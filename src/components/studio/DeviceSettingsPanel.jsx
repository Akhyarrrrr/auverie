import { PHONE_MODELS } from '../../data/samplePresets';
import { useProject } from '../../context/ProjectContext';

export default function DeviceSettingsPanel() {
  const { project, activeSlide, updateGlobalSettings } = useProject();
  const settings = { ...project.globalSettings, ...activeSlide?.customSettings };
  const model = PHONE_MODELS.find(item => item.id === settings.phoneModel) || PHONE_MODELS[0];
  const update = (key, value) => updateGlobalSettings({ [key]: value });

  return <div className="sidebar-content device-settings">
    <div className="panel-intro"><h2>Tampilan HP</h2><p>Ubah HP adegan aktif dan bawaan adegan baru. Adegan lain mempertahankan tampilan yang sudah disimpan.</p></div>
    <section className="settings-section"><h3>Perangkat</h3>
      <div className="model-grid">{PHONE_MODELS.map(item => <button key={item.id}
        className={item.id === settings.phoneModel ? 'model-choice active' : 'model-choice'}
        onClick={() => updateGlobalSettings({ phoneModel: item.id, bezelColor: item.colors[0].code, os: item.brand === 'Samsung' ? 'android' : 'ios' })}>
        <strong>{item.name}</strong><span>{item.brand === 'Canvas' ? 'Tanpa bingkai' : item.brand}</span>
      </button>)}</div>
      {model.colors.length > 1 && <div className="field"><span>Warna bingkai</span>
        <div className="color-options">{model.colors.map(color => <button key={color.id} className={settings.bezelColor === color.code ? 'active' : ''}
          style={{ backgroundColor: color.code }} title={color.name} aria-label={color.name}
          aria-pressed={settings.bezelColor === color.code} onClick={() => update('bezelColor', color.code)} />)}</div></div>}
      {model.id === 'frameless' && <label className="field"><span>Sistem operasi layar</span>
        <select value={settings.os || 'ios'} onChange={event => update('os', event.target.value)}><option value="ios">iOS</option><option value="android">Android</option></select>
      </label>}
    </section>
    <section className="settings-section"><h3>Isi layar</h3>
      <label className="toggle-field"><span>Sembunyikan status bar</span><input type="checkbox" checked={!!settings.hideStatusBar} onChange={event => update('hideStatusBar', event.target.checked)} /></label>
      <label className="field"><span>Tema aplikasi</span><select value={settings.theme || 'dark'} onChange={event => update('theme', event.target.value)}>
        <option value="light">Terang</option><option value="dark">Gelap</option></select></label>
      <label className="field"><span>Jam di status bar</span><input type="time" value={settings.time || '23:45'} onChange={event => update('time', event.target.value)} /></label>
      <label className="field"><span>Baterai · {settings.batteryLevel}%</span><input type="range" min="1" max="100" value={settings.batteryLevel ?? 80}
        onChange={event => update('batteryLevel', Number(event.target.value))} /></label>
      <label className="toggle-field"><span>Sedang mengisi daya</span><input type="checkbox" checked={!!settings.isCharging}
        onChange={event => update('isCharging', event.target.checked)} /></label>
      <label className="field"><span>Jaringan</span><select value={settings.networkType || '5G'} onChange={event => update('networkType', event.target.value)}>
        <option value="WiFi">Wi-Fi</option><option value="5G">5G</option><option value="4G">4G</option><option value="LTE">LTE</option></select></label>
      <label className="field"><span>Kekuatan sinyal · {settings.signalBars || 4} bar</span><input type="range" min="1" max="4" value={settings.signalBars || 4}
        onChange={event => update('signalBars', Number(event.target.value))} /></label>
      {model.brand === 'Apple' && <label className="field"><span>Gaya jam layar kunci</span>
        <select value={settings.lockscreenFont || 'bold'} onChange={event => update('lockscreenFont', event.target.value)}>
          <option value="bold">Tebal</option><option value="serif">Serif</option><option value="modern">Modern</option></select></label>}
    </section>
  </div>;
}
