import React, { useState } from 'react';
import { X, Sparkles, HelpCircle, Layers } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { parseChatScript } from '../../services/scriptParser';

export default function QuickScriptModal({ isOpen, onClose }) {
  const { project, setProject, setActiveSlideIndex } = useProject();

  const [scriptText, setScriptText] = useState(
`Reyhan: Ca kamu dimana?
Bianca: Lagi di jalan nih macet parah :(
Reyhan: [vn:0:32]
Reyhan: Hati-hati yaa, jangan ngebut-ngebut.
Bianca: Iyaa makasih Rey, nanti kukabarin kalau udah sampe kosan!`
  );

  const [platformType, setPlatformType] = useState('wa_chat');
  const [messagesPerSlide, setMessagesPerSlide] = useState(5);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!scriptText.trim()) {
      alert('Tuliskan naskah dialog terlebih dahulu.');
      return;
    }

    const { slides: newSlides, newCharacters } = parseChatScript(
      scriptText,
      project.characters,
      {
        messagesPerSlide,
        platformType
      }
    );

    if (newSlides.length === 0) {
      alert('Format naskah tidak dikenali. Gunakan format "Nama: Pesan".');
      return;
    }

    setProject(prev => ({
      ...prev,
      characters: [...prev.characters, ...newCharacters],
      slides: [...prev.slides, ...newSlides].map((s, idx) => ({ ...s, order: idx + 1 }))
    }));

    // Focus on the first newly added slide
    setActiveSlideIndex(project.slides.length);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={18} color="#a855f7" />
            <span>Naskah Cepat (Quick Script Converter)</span>
          </div>
          <button className="btn-header" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-tertiary)',
            padding: '10px 14px',
            borderRadius: '8px',
            lineHeight: 1.5
          }}>
            Tuliskan alur obrolan seperti naskah teater dengan format <code>Nama: Pesan</code>.
            Gunakan <code>[vn:0:30]</code> untuk membuat Voice Note. Sistem akan otomatis membagi chat menjadi beberapa slide (Auto-Paging) agar pas di layar HP!
          </div>

          <div className="form-group">
            <label className="form-label">Platform Target</label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-item ${platformType === 'wa_chat' ? 'active' : ''}`}
                onClick={() => setPlatformType('wa_chat')}
              >
                WhatsApp Chat
              </button>
              <button
                type="button"
                className={`segmented-item ${platformType === 'wa_group' ? 'active' : ''}`}
                onClick={() => setPlatformType('wa_group')}
              >
                WhatsApp Group
              </button>
              <button
                type="button"
                className={`segmented-item ${platformType === 'ig_dm' ? 'active' : ''}`}
                onClick={() => setPlatformType('ig_dm')}
              >
                Instagram DM
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Batas Pesan per Slide (Auto-Paging): <b>{messagesPerSlide} pesan</b></span>
            </div>
            <input
              type="range"
              min="3"
              max="8"
              value={messagesPerSlide}
              onChange={(e) => setMessagesPerSlide(parseInt(e.target.value, 10))}
              style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Naskah Dialog</label>
            <textarea
              className="form-textarea"
              rows={8}
              style={{ minHeight: '160px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Reyhan: Halo kamu dimana?&#10;Bianca: Lagi dijalan nih"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-header" onClick={onClose}>
            Batal
          </button>
          <button className="btn-header primary" onClick={handleGenerate}>
            <Layers size={15} />
            <span>Generate ke Storyboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
