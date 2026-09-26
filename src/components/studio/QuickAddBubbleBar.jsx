import React from 'react';
import {
  MessageSquarePlus,
  Mic,
  Image,
  Reply,
  Ban,
  PhoneCall,
  Plus
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function QuickAddBubbleBar() {
  const { activeSlide, updateSlideContent, project } = useProject();

  if (!activeSlide) return null;

  const isChat = activeSlide.type === 'wa_chat' || activeSlide.type === 'wa_group' || activeSlide.type === 'ig_dm';

  if (!isChat) return null;

  const handleAddMe = () => {
    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: 'Ketik pesan kamu...',
      time: project.globalSettings.time || '23:45',
      status: 'read',
      hasTail: true
    };
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMsg]
    }));
  };

  const handleAddOther = () => {
    const otherId = activeSlide.content?.targetCharacterId || project.characters[0]?.id;
    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: otherId,
      text: 'Ketik balasan lawan bicara...',
      time: project.globalSettings.time || '23:46',
      status: 'read',
      hasTail: true
    };
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMsg]
    }));
  };

  const handleAddVoiceNote = () => {
    const otherId = activeSlide.content?.targetCharacterId || project.characters[0]?.id;
    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: otherId,
      text: '',
      time: project.globalSettings.time || '23:46',
      status: 'read',
      isVoiceNote: true,
      voiceDuration: '0:28',
      hasTail: true
    };
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMsg]
    }));
  };

  const handleAddImage = () => {
    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: 'Liat foto ini deh barusan...',
      time: project.globalSettings.time || '23:47',
      status: 'read',
      mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      hasTail: true
    };
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMsg]
    }));
  };

  const handleAddQuoteReply = () => {
    const msgs = activeSlide.content?.messages || [];
    const lastMsg = msgs[msgs.length - 1];
    const previewText = lastMsg ? (lastMsg.text || 'Voice Note') : 'Pesan sebelumnya';

    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: 'Maksud kamu gimana?',
      time: project.globalSettings.time || '23:48',
      status: 'read',
      hasTail: true,
      replyTo: {
        senderName: 'Lawan Bicara',
        textPreview: previewText
      }
    };
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      messages: [...msgs, newMsg]
    }));
  };

  const handleAddDeleted = () => {
    const otherId = activeSlide.content?.targetCharacterId || project.characters[0]?.id;
    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: otherId,
      text: '',
      time: project.globalSettings.time || '23:49',
      isDeleted: true,
      hasTail: true
    };
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMsg]
    }));
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '18px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(18, 21, 29, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--border-accent)',
      padding: '6px 14px',
      borderRadius: 'var(--radius-full)',
      boxShadow: 'var(--shadow-lg), 0 0 24px rgba(0,0,0,0.7)',
      zIndex: 40
    }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
        Tambah Cepat:
      </span>

      <button
        type="button"
        className="btn-header"
        style={{
          padding: '5px 10px',
          fontSize: '11.5px',
          background: 'rgba(0, 168, 132, 0.2)',
          color: '#25d366',
          borderColor: 'rgba(0, 168, 132, 0.4)'
        }}
        onClick={handleAddMe}
        title="Tambah Pesan Saya (Kanan/Hijau)"
      >
        <Plus size={12} strokeWidth={3} />
        <span>Pesan Saya</span>
      </button>

      <button
        type="button"
        className="btn-header"
        style={{
          padding: '5px 10px',
          fontSize: '11.5px',
          background: 'rgba(255, 255, 255, 0.08)'
        }}
        onClick={handleAddOther}
        title="Tambah Pesan Lawan (Kiri)"
      >
        <Plus size={12} strokeWidth={3} />
        <span>Pesan Lawan</span>
      </button>

      <button
        type="button"
        className="btn-header"
        style={{ padding: '5px 9px', fontSize: '11.5px' }}
        onClick={handleAddVoiceNote}
        title="Tambah Voice Note"
      >
        <Mic size={13} color="#a855f7" />
        <span>Voice Note</span>
      </button>

      <button
        type="button"
        className="btn-header"
        style={{ padding: '5px 9px', fontSize: '11.5px' }}
        onClick={handleAddImage}
        title="Tambah Foto / Lampiran Gambar"
      >
        <Image size={13} color="#38bdf8" />
        <span>Foto</span>
      </button>

      <button
        type="button"
        className="btn-header"
        style={{ padding: '5px 9px', fontSize: '11.5px' }}
        onClick={handleAddQuoteReply}
        title="Tambah Balasan Mengutip Pesan (Quote Reply)"
      >
        <Reply size={13} color="#f59e0b" />
        <span>Balas Kutipan</span>
      </button>

      <button
        type="button"
        className="btn-header"
        style={{ padding: '5px 9px', fontSize: '11.5px', color: '#f87171' }}
        onClick={handleAddDeleted}
        title="Tambah Pesan Dihapus (Drama Overthinking)"
      >
        <Ban size={13} />
        <span>Dihapus</span>
      </button>
    </div>
  );
}
