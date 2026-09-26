import React, { useState } from 'react';
import { X, Image, Upload, Check, Sparkles } from 'lucide-react';
import { AESTHETIC_AVATARS, AESTHETIC_WALLPAPERS } from '../../data/samplePresets';

export default function AssetPickerModal({ isOpen, onClose, onSelect, type = 'avatar', currentUrl = '' }) {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  const [inputUrl, setInputUrl] = useState('');
  const [filterTag, setFilterTag] = useState('Semua');

  if (!isOpen) return null;

  const handleUploadFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      onSelect(uploadEvt.target.result);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    onSelect(inputUrl.trim());
    onClose();
  };

  const isAvatar = type === 'avatar';
  const galleryItems = isAvatar ? AESTHETIC_AVATARS : AESTHETIC_WALLPAPERS;

  const filteredItems = isAvatar && filterTag !== 'Semua'
    ? galleryItems.filter(item => item.tag === filterTag)
    : galleryItems;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={18} color="#a855f7" />
            <span>{isAvatar ? 'Pilih Foto Avatar Karakter' : 'Pilih Wallpaper Estetik'}</span>
          </div>
          <button className="btn-header" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
          <button
            className={`sidebar-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
            style={{ padding: '10px 16px', flexDirection: 'row', gap: '6px' }}
          >
            <Image size={15} />
            <span>Katalog Siap Pakai</span>
          </button>
          <button
            className={`sidebar-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
            style={{ padding: '10px 16px', flexDirection: 'row', gap: '6px' }}
          >
            <Upload size={15} />
            <span>Unggah dari HP/Laptop</span>
          </button>
          <button
            className={`sidebar-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
            style={{ padding: '10px 16px', flexDirection: 'row', gap: '6px' }}
          >
            <span>Tautan URL</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {activeTab === 'gallery' && (
            <>
              {isAvatar && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {['Semua', 'Cowok', 'Cewek', 'Aesthetic'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className="btn-header"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        background: filterTag === tag ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: filterTag === tag ? '#ffffff' : 'var(--text-secondary)'
                      }}
                      onClick={() => setFilterTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: isAvatar ? 'repeat(auto-fill, minmax(105px, 1fr))' : 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px'
              }}>
                {filteredItems.map((item) => {
                  const isSelected = currentUrl === item.url;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelect(item.url);
                        onClose();
                      }}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative',
                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                        aspectRatio: isAvatar ? '1 / 1' : '9 / 16',
                        background: '#1a1e29',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                        padding: '4px 6px',
                        fontSize: '10px',
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.name}
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'var(--accent-primary)',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'upload' && (
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '48px 24px',
              border: '2px dashed var(--border-medium)',
              borderRadius: '16px',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer',
              textAlign: 'center'
            }}>
              <Upload size={32} color="var(--accent-primary)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Klik untuk memilih foto</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mendukung format JPG, PNG, atau WebP</span>
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUploadFile}
              />
            </label>
          )}

          {activeTab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="form-label">Tautan Gambar (URL Langsung)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <button className="btn-header primary" onClick={handleApplyUrl} style={{ alignSelf: 'flex-end' }}>
                Terapkan Foto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
