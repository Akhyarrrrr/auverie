import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  FileJson,
  Upload,
  RotateCcw,
  FileText,
  Check,
  Loader2,
  FolderArchive
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import {
  downloadElementAsPng,
  copyElementToClipboard,
  batchExportSlidesAsZip,
  exportElementAsBlob
} from '../../services/exportService';
import { downloadProjectAsJson, parseProjectJsonFile } from '../../services/storage';

export default function StudioHeader({ onOpenScriptModal }) {
  const {
    project,
    updateTitle,
    resetToSample,
    setProject,
    activeSlideIndex,
    setActiveSlideIndex,
    isExporting,
    setIsExporting,
    exportProgress,
    setExportProgress
  } = useProject();

  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // 1-Click Copy Slide Image to Clipboard
  const handleCopyClipboard = async () => {
    try {
      const element = document.getElementById('phone-screen-canvas');
      if (!element) return;
      setCopied(true);
      await copyElementToClipboard(element, 2);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Gagal menyalin gambar ke clipboard. Pastikan browser memberi izin clipboard.');
      setCopied(false);
    }
  };

  // Download Current Slide as PNG
  const handleDownloadSlidePng = async () => {
    try {
      const element = document.getElementById('phone-screen-canvas');
      if (!element) return;
      const currentSlide = project.slides[activeSlideIndex] || { type: 'slide' };
      const paddedNum = String(activeSlideIndex + 1).padStart(2, '0');
      const filename = `${paddedNum}_${currentSlide.type}.png`;
      await downloadElementAsPng(element, filename, 2);
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh gambar slide.');
    }
  };

  // Batch Export All Slides as ZIP
  const handleBatchExportZip = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const originalSlideIndex = activeSlideIndex;

      // Render each slide sequentially
      const renderSlideAsync = async (slide, index) => {
        setActiveSlideIndex(index);
        // Wait 300ms for React state and images to paint
        await new Promise(r => setTimeout(r, 350));
        const element = document.getElementById('phone-screen-canvas');
        if (!element) throw new Error('Phone canvas container not found');
        return await exportElementAsBlob(element, 2);
      };

      await batchExportSlidesAsZip(
        project.slides,
        renderSlideAsync,
        project.title,
        (progress) => setExportProgress(progress)
      );

      // Restore active slide
      setActiveSlideIndex(originalSlideIndex);
      alert(`Berhasil mengekspor seluruh ${project.slides.length} slide ke dalam file ZIP!`);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengekspor batch ZIP.');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // Save / Load .aujson
  const handleExportJson = () => {
    downloadProjectAsJson(project);
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseProjectJsonFile(file)
      .then((imported) => {
        setProject(imported);
        setActiveSlideIndex(0);
        alert(`Proyek "${imported.title}" berhasil dimuat!`);
      })
      .catch((err) => {
        alert(err.message || 'Gagal memuat file proyek.');
      });
  };

  return (
    <header className="studio-header">
      {/* Brand & Title */}
      <div className="brand-section">
        <div className="brand-badge">
          <Sparkles size={16} />
          <span>AU STUDIO</span>
        </div>

        <input
          type="text"
          className="project-title-input"
          value={project.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Judul Cerita AU..."
          title="Klik untuk mengubah judul cerita"
        />
      </div>

      {/* Middle Tools */}
      <div className="header-center-actions">
        <button
          className="btn-header"
          onClick={onOpenScriptModal}
          title="Tulis naskah dialog cepat langsung jadi slide"
        >
          <FileText size={15} style={{ color: '#a855f7' }} />
          <span>Naskah Cepat</span>
        </button>

        <button
          className="btn-header"
          onClick={resetToSample}
          title="Muat ulang contoh cerita template"
        >
          <RotateCcw size={14} />
          <span>Contoh Cerita</span>
        </button>

        <button
          className="btn-header"
          onClick={handleExportJson}
          title="Simpan file proyek (.aujson) untuk backup"
        >
          <FileJson size={14} />
          <span>Simpan Proyek</span>
        </button>

        <button
          className="btn-header"
          onClick={() => fileInputRef.current?.click()}
          title="Buka file proyek (.aujson)"
        >
          <Upload size={14} />
          <span>Buka Proyek</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".aujson,application/json"
          onChange={handleImportJson}
        />
      </div>

      {/* Right Action Buttons */}
      <div className="header-right-actions">
        {/* Copy Image Button */}
        <button
          className="btn-header"
          onClick={handleCopyClipboard}
          title="Salin gambar slide aktif ke clipboard"
        >
          {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
          <span>{copied ? 'Tersalin!' : 'Salin Gambar'}</span>
        </button>

        {/* Download Single PNG */}
        <button
          className="btn-header"
          onClick={handleDownloadSlidePng}
          title="Unduh slide ini sebagai gambar PNG tajam"
        >
          <Download size={15} />
          <span>Unduh PNG</span>
        </button>

        {/* Export All Slides as ZIP */}
        <button
          className="btn-header primary"
          onClick={handleBatchExportZip}
          disabled={isExporting}
          title="Render dan unduh semua slide sekaligus dalam file ZIP"
        >
          {isExporting ? (
            <>
              <Loader2 size={16} className="spin-animate" />
              <span>
                {exportProgress
                  ? `${exportProgress.current}/${exportProgress.total}`
                  : 'Mengekspor...'}
              </span>
            </>
          ) : (
            <>
              <FolderArchive size={16} />
              <span>Ekspor Semua (.ZIP)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
