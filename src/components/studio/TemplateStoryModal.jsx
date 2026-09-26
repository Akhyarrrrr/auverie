import React from 'react';
import { X, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { STORY_TEMPLATES, SAMPLE_PROJECT } from '../../data/samplePresets';
import { useProject } from '../../context/ProjectContext';

export default function TemplateStoryModal({ isOpen, onClose }) {
  const { setProject, setActiveSlideIndex } = useProject();

  if (!isOpen) return null;

  const handleApplyTemplate = (tplId) => {
    if (window.confirm("Muat template cerita ini? Proyek saat ini akan diganti dengan template baru.")) {
      // Create a fresh clone of sample project tailored to the template
      const clone = JSON.parse(JSON.stringify(SAMPLE_PROJECT));
      clone.title = STORY_TEMPLATES.find(t => t.id === tplId)?.title || "Cerita AU Baru";

      if (tplId === 'tpl-salah-kirim') {
        clone.slides = clone.slides.filter(s => s.type === 'wa_chat' || s.type === 'lockscreen');
      } else if (tplId === 'tpl-menfess-viral') {
        clone.slides = clone.slides.filter(s => s.type === 'x_tweet' || s.type === 'lockscreen');
      } else if (tplId === 'tpl-baper-ig') {
        clone.slides = clone.slides.filter(s => s.type === 'ig_story' || s.type === 'ig_dm');
      }

      setProject(clone);
      setActiveSlideIndex(0);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={18} color="#ec4899" />
            <span>Katalog Template Cerita AU Siap Pakai</span>
          </div>
          <button className="btn-header" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Pilih alur cerita pembuka yang sudah disiapkan lengkap dengan karakter, jam malam, dan format adegan:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {STORY_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleApplyTemplate(tpl.id)}
                style={{
                  cursor: 'pointer',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '28px' }}>{tpl.icon}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {tpl.title}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {tpl.description}
                    </span>
                  </div>
                </div>

                <div style={{ color: 'var(--accent-primary)' }}>
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
