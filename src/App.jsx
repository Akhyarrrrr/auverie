import React, { useState } from 'react';
import {
  Users,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Download,
  Loader2,
  Moon,
  Sun
} from 'lucide-react';
import { useProject } from './context/ProjectContext';
import StudioHeader from './components/studio/StudioHeader';
import CharacterManager from './components/studio/CharacterManager';
import DeviceSettingsPanel from './components/studio/DeviceSettingsPanel';
import StoryboardStrip from './components/studio/StoryboardStrip';
import SlideInspector from './components/studio/SlideInspector';
import PhoneContainer from './components/phone/PhoneContainer';
import QuickScriptModal from './components/studio/QuickScriptModal';
import TemplateStoryModal from './components/studio/TemplateStoryModal';
import QuickAddBubbleBar from './components/studio/QuickAddBubbleBar';
import { copyElementToClipboard, downloadElementAsPng } from './services/exportService';

export default function App() {
  const {
    project,
    activeSlide,
    activeSlideIndex,
    activeTab,
    setActiveTab,
    updateGlobalSettings,
    isExporting,
    exportProgress
  } = useProject();

  const [zoom, setZoom] = useState(0.88);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);

  const handleCopyCurrent = async () => {
    try {
      const el = document.getElementById('phone-screen-canvas');
      if (!el) return;
      setCopiedQuick(true);
      await copyElementToClipboard(el, 2);
      setTimeout(() => setCopiedQuick(false), 2000);
    } catch (e) {
      alert('Gagal menyalin gambar.');
      setCopiedQuick(false);
    }
  };

  const handleDownloadCurrent = async () => {
    try {
      const el = document.getElementById('phone-screen-canvas');
      if (!el) return;
      const paddedNum = String(activeSlideIndex + 1).padStart(2, '0');
      await downloadElementAsPng(el, `${paddedNum}_${activeSlide?.type || 'slide'}.png`, 2);
    } catch (e) {
      alert('Gagal mengunduh gambar.');
    }
  };

  return (
    <div className="studio-layout">
      {/* Studio Header Bar */}
      <StudioHeader
        onOpenScriptModal={() => setScriptModalOpen(true)}
        onOpenTemplateModal={() => setTemplateModalOpen(true)}
      />

      {/* Main Studio Viewport */}
      <div className="studio-body">
        {/* Left Sidebar Tools */}
        <aside className="sidebar-panel">
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab-btn ${activeTab === 'characters' ? 'active' : ''}`}
              onClick={() => setActiveTab('characters')}
            >
              <Users size={16} />
              <span>Karakter</span>
            </button>
            <button
              className={`sidebar-tab-btn ${activeTab === 'device' ? 'active' : ''}`}
              onClick={() => setActiveTab('device')}
            >
              <Smartphone size={16} />
              <span>Model HP & Sinyal</span>
            </button>
          </div>

          {activeTab === 'characters' ? (
            <CharacterManager />
          ) : (
            <DeviceSettingsPanel />
          )}
        </aside>

        {/* Center Live Phone Canvas */}
        <main className="canvas-viewport">
          {/* Floating Canvas Controls */}
          <div className="canvas-toolbar">
            <button
              className="canvas-toolbar-btn"
              onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
              title="Perkecil Tampilan"
            >
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '35px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="canvas-toolbar-btn"
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
              title="Perbesar Tampilan"
            >
              <ZoomIn size={14} />
            </button>
            <button
              className="canvas-toolbar-btn"
              onClick={() => setZoom(0.88)}
              title="Reset Zoom"
            >
              <Maximize2 size={13} />
            </button>

            <div className="canvas-toolbar-divider" />

            {/* Quick Dark/Light Toggle */}
            <button
              className="canvas-toolbar-btn"
              onClick={() =>
                updateGlobalSettings({
                  theme: project.globalSettings.theme === 'dark' ? 'light' : 'dark'
                })
              }
              title="Ganti Mode Gelap / Terang"
            >
              {project.globalSettings.theme === 'dark' ? (
                <Sun size={14} color="#f59e0b" />
              ) : (
                <Moon size={14} color="#6366f1" />
              )}
            </button>

            <div className="canvas-toolbar-divider" />

            {/* Quick Copy & Download for Active Slide */}
            <button
              className="canvas-toolbar-btn"
              onClick={handleCopyCurrent}
              title="Salin Gambar Slide Ini"
            >
              <Copy size={13} />
              <span>{copiedQuick ? 'Disalin!' : 'Salin'}</span>
            </button>
            <button
              className="canvas-toolbar-btn"
              onClick={handleDownloadCurrent}
              title="Unduh PNG Slide Ini"
            >
              <Download size={13} />
              <span>PNG</span>
            </button>
          </div>

          {/* Interactive Phone Stage */}
          <div className="phone-stage-wrapper">
            <PhoneContainer slide={activeSlide} zoom={zoom} />
          </div>

          {/* Quick Action Floating Bar directly below the phone screen */}
          <QuickAddBubbleBar />
        </main>

        {/* Right Inspector Panel */}
        <SlideInspector />
      </div>

      {/* Bottom Storyboard Filmstrip */}
      <StoryboardStrip />

      {/* Quick Script Dialog Modal */}
      <QuickScriptModal
        isOpen={scriptModalOpen}
        onClose={() => setScriptModalOpen(false)}
      />

      {/* Instant Story Pack Template Modal */}
      <TemplateStoryModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />

      {/* Batch Export Progress Overlay */}
      {isExporting && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div
            className="modal-dialog"
            style={{
              maxWidth: '380px',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <Loader2 size={36} className="spin-animate" color="var(--accent-primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Mengekspor Seluruh Slide...</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {exportProgress?.status || `Memproses slide ${exportProgress?.current || 1} dari ${exportProgress?.total || project.slides.length}`}
            </p>
            <div style={{
              width: '100%',
              height: '6px',
              background: 'var(--bg-tertiary)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'var(--accent-gradient)',
                width: `${exportProgress ? ((exportProgress.current / exportProgress.total) * 100) : 10}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Jangan tutup jendela browser sampai unduhan ZIP selesai.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
