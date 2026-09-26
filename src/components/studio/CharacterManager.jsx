import React, { useState } from 'react';
import { UserPlus, Trash2, CheckCircle2, Image, Upload, Sparkles } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import AssetPickerModal from './AssetPickerModal';
import { AESTHETIC_AVATARS } from '../../data/samplePresets';

export default function CharacterManager() {
  const { project, addCharacter, updateCharacter, deleteCharacter } = useProject();
  const [selectedCharId, setSelectedCharId] = useState(project.characters[0]?.id || null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const activeChar = project.characters.find(c => c.id === selectedCharId) || project.characters[0];

  const handleAddNewCharacter = () => {
    const randomAvatar = AESTHETIC_AVATARS[project.characters.length % AESTHETIC_AVATARS.length];
    const newChar = addCharacter({
      name: `Karakter ${project.characters.length + 1}`,
      handle: `@karakter${project.characters.length + 1}`,
      avatar: randomAvatar.url,
      verified: false,
      verifiedType: "none"
    });
    setSelectedCharId(newChar.id);
  };

  return (
    <div className="sidebar-content">
      {/* Tip Banner */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '12px',
        color: '#c7d2fe',
        lineHeight: 1.4
      }}>
        💡 <b>Tersinkronisasi Otomatis</b>: Mengubah avatar atau nama di sini akan otomatis memperbarui seluruh chat WhatsApp, Twitter, dan Instagram di semua slide!
      </div>

      {/* Characters List Bar */}
      <div className="form-group">
        <div className="form-label">
          <span>Daftar Karakter ({project.characters.length})</span>
          <button
            className="btn-header"
            style={{ padding: '3px 8px', fontSize: '11px' }}
            onClick={handleAddNewCharacter}
          >
            <UserPlus size={12} /> Tambah
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {project.characters.map((char) => {
            const isSelected = char.id === activeChar?.id;
            return (
              <div
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--bg-glass-active)' : 'transparent',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  minWidth: '64px'
                }}
              >
                <img
                  src={char.avatar}
                  alt={char.name}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '4px'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  maxWidth: '56px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {char.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Edit Form */}
      {activeChar && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: 'var(--bg-tertiary)',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={activeChar.avatar}
              alt=""
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border-medium)',
                cursor: 'pointer'
              }}
              onClick={() => setPickerOpen(true)}
              title="Klik untuk ganti foto"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                className="btn-header"
                style={{ fontSize: '11.5px', padding: '5px 12px', background: 'var(--accent-gradient)', color: 'white' }}
                onClick={() => setPickerOpen(true)}
              >
                <Sparkles size={13} />
                <span>Pilih Foto Estetik</span>
              </button>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                Katalog siap pakai atau upload foto
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Tampilan</label>
            <input
              type="text"
              className="form-input"
              value={activeChar.name}
              onChange={(e) => updateCharacter(activeChar.id, { name: e.target.value })}
              placeholder="Contoh: Reyhan Arka"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username / Handle</label>
            <input
              type="text"
              className="form-input"
              value={activeChar.handle}
              onChange={(e) => updateCharacter(activeChar.id, { handle: e.target.value })}
              placeholder="@username"
            />
          </div>

          {/* Centang Verifikasi (Biru / Emas / Tidak ada) */}
          <div className="form-group">
            <label className="form-label">Lencana Verifikasi (Badge)</label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-item ${!activeChar.verified ? 'active' : ''}`}
                onClick={() => updateCharacter(activeChar.id, { verified: false, verifiedType: 'none' })}
              >
                Biasa
              </button>
              <button
                type="button"
                className={`segmented-item ${activeChar.verified && activeChar.verifiedType !== 'gold' ? 'active' : ''}`}
                onClick={() => updateCharacter(activeChar.id, { verified: true, verifiedType: 'blue' })}
              >
                Centang Biru
              </button>
              <button
                type="button"
                className={`segmented-item ${activeChar.verified && activeChar.verifiedType === 'gold' ? 'active' : ''}`}
                onClick={() => updateCharacter(activeChar.id, { verified: true, verifiedType: 'gold' })}
              >
                Centang Emas
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '4px' }}>
            {project.characters.length > 1 && (
              <button
                className="btn-header"
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => {
                  if (window.confirm(`Hapus karakter "${activeChar.name}"?`)) {
                    deleteCharacter(activeChar.id);
                  }
                }}
                title="Hapus Karakter"
              >
                <Trash2 size={13} />
                <span>Hapus Karakter</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Visual Asset Picker Modal */}
      <AssetPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        type="avatar"
        currentUrl={activeChar?.avatar}
        onSelect={(newAvatarUrl) => {
          if (activeChar) {
            updateCharacter(activeChar.id, { avatar: newAvatarUrl });
          }
        }}
      />
    </div>
  );
}
