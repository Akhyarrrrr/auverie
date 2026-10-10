import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useUI } from '../../context/UIContext';
import AssetPickerModal from './AssetPickerModal';
import { Avatar } from '../mockups/SceneParts';

export default function CharacterManager() {
  const { t } = useUI();
  const { project, addCharacter, updateCharacter, updateSelfCharacter, deleteCharacter, getCharacterUsage, getCharacter } = useProject();
  const [selectedId, setSelectedId] = useState('me');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replacementId, setReplacementId] = useState('me');
  const active = selectedId === 'me' ? getCharacter('me') : project.characters.find(item => item.id === selectedId) || getCharacter('me');
  const usage = selectedId === 'me' ? 0 : getCharacterUsage(selectedId);
  const save = updates => selectedId === 'me' ? updateSelfCharacter(updates) : updateCharacter(selectedId, updates);

  const add = () => {
    const next = addCharacter({ name: t('Karakter baru'), handle: '@karakterbaru' });
    setSelectedId(next.id);
    setDeleting(false);
  };
  const remove = () => {
    if (!deleteCharacter(selectedId, usage ? replacementId : undefined)) return;
    setSelectedId('me');
    setDeleting(false);
  };

  return <div className="sidebar-content character-settings">
    <div className="panel-intro"><h2>{t('Tokoh cerita')}</h2><p>{t('Perubahan tokoh berlaku di slide aktif dan menjadi bawaan slide baru. Slide lain tetap seperti saat disimpan.')}</p></div>
    <div className="character-list">
      <button className={selectedId === 'me' ? 'active' : ''} onClick={() => { setSelectedId('me'); setDeleting(false); }}>
        <Avatar person={getCharacter('me')} size={38} /><span>{t('Saya')}</span></button>
      {project.characters.map(character => <button key={character.id} className={selectedId === character.id ? 'active' : ''}
        onClick={() => { setSelectedId(character.id); setDeleting(false); }}>
        <Avatar person={character} size={38} />
        <span>{character.name}</span>
      </button>)}
      <button className="character-add" onClick={add}><Plus size={21} /><span>{t('Tambah')}</span></button>
    </div>
    <section className="settings-section character-profile"><h3>{t(selectedId === 'me' ? 'Profil saya' : 'Profil tokoh')}</h3>
      <div className="character-photo">
        <Avatar person={active} size={52} />
        <button className="button secondary" onClick={() => setPickerOpen(true)}>{t('Ganti foto')}</button>
      </div>
      <label className="field"><span>{t('Nama tampilan')}</span><input value={active.name || ''} onChange={event => save({ name: event.target.value })} /></label>
      <label className="field"><span>Username</span><input value={active.handle || ''} onChange={event => save({ handle: event.target.value })} placeholder="@username" /></label>
      {selectedId !== 'me' && <label className="field"><span>{t('Verifikasi di X')}</span>
        <select value={active.verified ? active.verifiedType || 'blue' : 'none'} onChange={event => save({
          verified: event.target.value !== 'none', verifiedType: event.target.value
        })}><option value="none">{t('Tidak ada')}</option><option value="blue">{t('Biru')}</option><option value="gold">{t('Emas')}</option></select></label>}
      {selectedId !== 'me' && <button className="text-button danger" onClick={() => setDeleting(true)}><Trash2 size={16} />{t('Hapus tokoh')}</button>}
      {deleting && <div className="delete-confirm">
        <p>{t(usage ? 'Tokoh ini dipakai pada {n} bagian cerita. Pilih penggantinya sebelum menghapus.' : 'Tokoh ini tidak dipakai di slide mana pun.', { n: usage })}</p>
        {!!usage && <label className="field"><span>{t('Ganti dengan')}</span><select value={replacementId} onChange={event => setReplacementId(event.target.value)}>
          <option value="me">{t('Saya')}</option>
          {project.characters.filter(character => character.id !== selectedId).map(character =>
            <option key={character.id} value={character.id}>{character.name}</option>)}
        </select></label>}
        <div><button className="button secondary" onClick={() => setDeleting(false)}>{t('Batal')}</button>
          <button className="button danger" onClick={remove}>{t('Hapus tokoh')}</button></div>
      </div>}
    </section>
    <AssetPickerModal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} type="avatar" currentUrl={active.avatar || ''}
      onSelect={avatar => save({ avatar })} />
  </div>;
}
