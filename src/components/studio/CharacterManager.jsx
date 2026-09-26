import React, { useState } from 'react';
import { UserPlus, Trash2, CheckCircle2, Image, Upload } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function CharacterManager() {
  const { project, addCharacter, updateCharacter, deleteCharacter } = useProject();
  const [selectedCharId, setSelectedCharId] = useState(project.characters[0]?.id || null);

  const activeChar = project.characters.find(c => c.id === selectedCharId) || project.characters[0];

  // Helper for uploading image file to base64
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChar) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      updateCharacter(activeChar.id, { avatar: uploadEvent.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewCharacter = () => {
    const newChar = addCharacter({
      name: `Karakter ${project.characters.length + 1}`,
      handle: `@karakter${project.characters.length + 1}`,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      verified: false
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
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border-medium)'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                className="btn-header"
                style={{ fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }}
              >
                <Upload size={12} /> Unggah Foto
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                />
              </label>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                PNG, JPG atau WebP
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

          <div className="form-group">
            <label className="form-label">URL Foto Avatar</label>
            <input
              type="text"
              className="form-input"
              value={activeChar.avatar}
              onChange={(e) => updateCharacter(activeChar.id, { avatar: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeChar.verified || false}
                onChange={(e) => updateCharacter(activeChar.id, { verified: e.target.checked })}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} color="#1d9bf0" /> Centang Biru (Verified)
              </span>
            </label>

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
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
