import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import AssetPickerModal from './AssetPickerModal';

export default function CharacterManager() {
  const { project, addCharacter, updateCharacter, updateSelfCharacter, deleteCharacter, getCharacterUsage, getCharacter } = useProject();
  const [selectedId, setSelectedId] = useState('me');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replacementId, setReplacementId] = useState('me');
  const active = selectedId === 'me' ? getCharacter('me') : project.characters.find(item => item.id === selectedId) || getCharacter('me');
  const usage = selectedId === 'me' ? 0 : getCharacterUsage(selectedId);
  const save = updates => selectedId === 'me' ? updateSelfCharacter(updates) : updateCharacter(selectedId, updates);

  const add = () => {
    const next = addCharacter({ name: 'Karakter baru', handle: '@karakterbaru' });
    setSelectedId(next.id);
    setDeleting(false);
  };
  const remove = () => {
    if (!deleteCharacter(selectedId, usage ? replacementId : undefined)) return;
    setSelectedId('me');
    setDeleting(false);
  };

  return <div className="sidebar-content character-settings">
    <div className="panel-intro"><h2>Tokoh cerita</h2><p>Ubah nama atau foto sekali; semua slide yang memakai tokoh itu ikut diperbarui.</p></div>
    <div className="character-list">
      <button className={selectedId === 'me' ? 'active' : ''} onClick={() => { setSelectedId('me'); setDeleting(false); }}>
        <img src={getCharacter('me').avatar} alt="" /><span>Saya</span></button>
      {project.characters.map(character => <button key={character.id} className={selectedId === character.id ? 'active' : ''}
        onClick={() => { setSelectedId(character.id); setDeleting(false); }}>
        {character.avatar ? <img src={character.avatar} alt="" /> : <span className="avatar-fallback">{character.name.charAt(0)}</span>}
        <span>{character.name}</span>
      </button>)}
      <button className="character-add" onClick={add}><Plus size={21} /><span>Tambah</span></button>
    </div>
    <section className="settings-section"><h3>{selectedId === 'me' ? 'Profil saya' : 'Profil tokoh'}</h3>
      <div className="character-photo">
        {active.avatar ? <img src={active.avatar} alt="" /> : <span className="avatar-fallback">{active.name.charAt(0)}</span>}
        <button className="button secondary" onClick={() => setPickerOpen(true)}>Ganti foto</button>
      </div>
      <label className="field"><span>Nama tampilan</span><input value={active.name || ''} onChange={event => save({ name: event.target.value })} /></label>
      <label className="field"><span>Username</span><input value={active.handle || ''} onChange={event => save({ handle: event.target.value })} placeholder="@username" /></label>
      {selectedId !== 'me' && <label className="field"><span>Verifikasi di X</span>
        <select value={active.verified ? active.verifiedType || 'blue' : 'none'} onChange={event => save({
          verified: event.target.value !== 'none', verifiedType: event.target.value
        })}><option value="none">Tidak ada</option><option value="blue">Biru</option><option value="gold">Emas</option></select></label>}
      {selectedId !== 'me' && <button className="text-button danger" onClick={() => setDeleting(true)}><Trash2 size={16} /> Hapus tokoh</button>}
      {deleting && <div className="delete-confirm">
        <p>{usage ? 'Tokoh ini dipakai pada ' + usage + ' bagian cerita. Pilih penggantinya sebelum menghapus.' : 'Tokoh ini tidak dipakai di slide mana pun.'}</p>
        {!!usage && <label className="field"><span>Ganti dengan</span><select value={replacementId} onChange={event => setReplacementId(event.target.value)}>
          <option value="me">Saya</option>
          {project.characters.filter(character => character.id !== selectedId).map(character =>
            <option key={character.id} value={character.id}>{character.name}</option>)}
        </select></label>}
        <div><button className="button secondary" onClick={() => setDeleting(false)}>Batal</button>
          <button className="button danger" onClick={remove}>Hapus tokoh</button></div>
      </div>}
    </section>
    <AssetPickerModal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} type="avatar" currentUrl={active.avatar || ''}
      onSelect={avatar => save({ avatar })} />
  </div>;
}
