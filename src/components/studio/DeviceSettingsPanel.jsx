import { PHONE_MODELS } from '../../data/samplePresets';
import { useProject } from '../../context/ProjectContext';
import { useUI } from '../../context/UIContext';

export default function DeviceSettingsPanel() {
  const { t } = useUI();
  const { project, activeSlide, updateGlobalSettings } = useProject();
  const settings = { ...project.globalSettings, ...activeSlide?.customSettings };
  const model = PHONE_MODELS.find(item => item.id === settings.phoneModel) || PHONE_MODELS[0];
  const update = (key, value) => updateGlobalSettings({ [key]: value });

  return <div className="sidebar-content device-settings">
    <div className="panel-intro"><h2>{t('Tampilan HP')}</h2><p>{t('Ubah HP adegan aktif dan bawaan adegan baru. Adegan lain mempertahankan tampilan yang sudah disimpan.')}</p></div>
    <section className="settings-section"><h3>{t('Perangkat')}</h3>
      <div className="model-grid">{PHONE_MODELS.map(item => <button key={item.id}
        className={item.id === settings.phoneModel ? 'model-choice active' : 'model-choice'}
        onClick={() => updateGlobalSettings({ phoneModel: item.id, bezelColor: item.colors[0].code, os: item.brand === 'Samsung' ? 'android' : 'ios' })}>
        <strong>{t(item.name)}</strong><span>{item.brand === 'Canvas' ? t('Tanpa bingkai') : item.brand}</span>
      </button>)}</div>
      {model.colors.length > 1 && <div className="field"><span>{t('Warna bingkai')}</span>
        <div className="color-options">{model.colors.map(color => <button key={color.id} className={settings.bezelColor === color.code ? 'active' : ''}
          style={{ backgroundColor: color.code }} title={color.name} aria-label={color.name}
          aria-pressed={settings.bezelColor === color.code} onClick={() => update('bezelColor', color.code)} />)}</div></div>}
      {model.id === 'frameless' && <label className="field"><span>{t('Sistem operasi layar')}</span>
        <select aria-label={t('Sistem operasi layar')} value={settings.os || 'ios'} onChange={event => update('os', event.target.value)}><option value="ios">iOS</option><option value="android">Android</option></select>
      </label>}
    </section>
    <section className="settings-section"><h3>{t('Isi layar')}</h3>
      <label className="toggle-field"><span>{t('Sembunyikan status bar')}</span><input type="checkbox" checked={!!settings.hideStatusBar} onChange={event => update('hideStatusBar', event.target.checked)} /></label>
      <label className="field"><span>{t('Tema aplikasi')}</span><select aria-label={t('Tema aplikasi')} value={settings.theme || 'dark'} onChange={event => update('theme', event.target.value)}>
        <option value="light">{t('Terang')}</option><option value="dark">{t('Gelap')}</option></select></label>
      <label className="field"><span>{t('Jam di status bar')}</span><input type="time" value={settings.time || '23:45'} onChange={event => update('time', event.target.value)} /></label>
      <label className="field"><span>{t('Baterai')} · {settings.batteryLevel}%</span><input aria-label={t('Baterai')} type="range" min="1" max="100" value={settings.batteryLevel ?? 80}
        onChange={event => update('batteryLevel', Number(event.target.value))} /></label>
      <label className="toggle-field"><span>{t('Sedang mengisi daya')}</span><input type="checkbox" checked={!!settings.isCharging}
        onChange={event => update('isCharging', event.target.checked)} /></label>
      <label className="field"><span>{t('Jaringan')}</span><select aria-label={t('Jaringan')} value={settings.networkType || '5G'} onChange={event => update('networkType', event.target.value)}>
        <option value="WiFi">Wi-Fi</option><option value="5G">5G</option><option value="4G">4G</option><option value="LTE">LTE</option></select></label>
      <label className="field"><span>{t('Kekuatan sinyal')} · {settings.signalBars || 4} bar</span><input aria-label={t('Kekuatan sinyal')} type="range" min="1" max="4" value={settings.signalBars || 4}
        onChange={event => update('signalBars', Number(event.target.value))} /></label>
      {model.brand === 'Apple' && <label className="field"><span>{t('Gaya jam layar kunci')}</span>
        <select aria-label={t('Gaya jam layar kunci')} value={settings.lockscreenFont || 'bold'} onChange={event => update('lockscreenFont', event.target.value)}>
          <option value="bold">{t('Tebal')}</option><option value="serif">Serif</option><option value="modern">Modern</option></select></label>}
    </section>
  </div>;
}
