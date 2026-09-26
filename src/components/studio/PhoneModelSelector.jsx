import React from 'react';
import { Smartphone, Check, Palette } from 'lucide-react';
import { PHONE_MODELS } from '../../data/samplePresets';
import { useProject } from '../../context/ProjectContext';

export default function PhoneModelSelector() {
  const { project, updateGlobalSettings } = useProject();
  const currentModelId = project.globalSettings.phoneModel || 'iphone-16-pro';
  const currentModel = PHONE_MODELS.find(m => m.id === currentModelId) || PHONE_MODELS[0];
  const currentBezelColor = project.globalSettings.bezelColor || '#28292b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Phone Model Cards */}
      <div className="form-group">
        <label className="form-label">
          <span>Model HP & Bezel</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {PHONE_MODELS.map((model) => {
            const isSelected = model.id === currentModelId;
            return (
              <div
                key={model.id}
                onClick={() => {
                  updateGlobalSettings({
                    phoneModel: model.id,
                    bezelColor: model.colors[0]?.code || '#28292b'
                  });
                }}
                style={{
                  cursor: 'pointer',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: isSelected ? 'var(--bg-glass-active)' : 'var(--bg-tertiary)',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Smartphone size={16} color={isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  {isSelected && <Check size={14} color="var(--accent-primary)" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                  {model.name}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {model.brand}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frame / Bezel Colors */}
      {currentModel.colors.length > 1 && (
        <div className="form-group">
          <label className="form-label">
            <span><Palette size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} /> Warna Titanium / Body HP</span>
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {currentModel.colors.map((c) => {
              const isSelected = currentBezelColor === c.code;
              return (
                <div
                  key={c.id}
                  onClick={() => updateGlobalSettings({ bezelColor: c.code })}
                  title={c.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c.code,
                    border: isSelected ? '2.5px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isSelected && <Check size={14} color={c.id === 'white' ? '#000000' : '#ffffff'} strokeWidth={3} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WhatsApp OS Style Toggle */}
      <div className="form-group">
        <label className="form-label">Tampilan WhatsApp</label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-item ${project.globalSettings.whatsappStyle === 'ios' ? 'active' : ''}`}
            onClick={() => updateGlobalSettings({ whatsappStyle: 'ios' })}
          >
            WhatsApp iPhone (iOS)
          </button>
          <button
            type="button"
            className={`segmented-item ${project.globalSettings.whatsappStyle === 'android' ? 'active' : ''}`}
            onClick={() => updateGlobalSettings({ whatsappStyle: 'android' })}
          >
            WhatsApp Android (Hijau)
          </button>
        </div>
      </div>

      {/* iOS 18 Lockscreen Clock Font Style */}
      <div className="form-group">
        <label className="form-label">Font Jam Layar Kunci (iOS 18)</label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-item ${project.globalSettings.lockscreenFont === 'bold' ? 'active' : ''}`}
            onClick={() => updateGlobalSettings({ lockscreenFont: 'bold' })}
          >
            Tebal (Bold)
          </button>
          <button
            type="button"
            className={`segmented-item ${project.globalSettings.lockscreenFont === 'serif' ? 'active' : ''}`}
            onClick={() => updateGlobalSettings({ lockscreenFont: 'serif' })}
          >
            Serif
          </button>
          <button
            type="button"
            className={`segmented-item ${project.globalSettings.lockscreenFont === 'modern' ? 'active' : ''}`}
            onClick={() => updateGlobalSettings({ lockscreenFont: 'modern' })}
          >
            Modern
          </button>
        </div>
      </div>
    </div>
  );
}
