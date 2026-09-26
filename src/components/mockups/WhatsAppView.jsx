import React, { useState } from 'react';
import {
  ChevronLeft,
  Video,
  Phone,
  MoreVertical,
  Play,
  Pause,
  Mic,
  Paperclip,
  Smile,
  CheckCheck,
  Check,
  CornerDownRight,
  Ban
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function WhatsAppView({ slide, isGroup = false }) {
  const { project, getCharacter, updateSlideContent } = useProject();
  const content = slide.content || {};
  const targetChar = getCharacter(content.targetCharacterId);
  const messages = content.messages || [];
  const globalSettings = project.globalSettings || {};
  const theme = slide.customSettings?.theme || globalSettings.theme || 'dark';
  const whatsappStyle = globalSettings.whatsappStyle || 'ios';

  const [playingVnId, setPlayingVnId] = useState(null);

  const toggleVnPlay = (msgId) => {
    setPlayingVnId(prev => (prev === msgId ? null : msgId));
  };

  const handleUpdateMessageText = (msgId, newText) => {
    updateSlideContent(slide.id, (prev) => ({
      ...prev,
      messages: (prev.messages || []).map((m) =>
        m.id === msgId ? { ...m, text: newText } : m
      )
    }));
  };

  return (
    <div className={`wa-mockup-wrapper ${theme}`}>
      {/* WhatsApp Header (iOS vs Android) */}
      <div className={`wa-header ${whatsappStyle === 'android' ? 'style-android' : ''}`}>
        <div className="wa-header-left">
          <div className="wa-back-btn">
            <ChevronLeft size={22} strokeWidth={2.5} />
          </div>
          <img
            src={targetChar.avatar}
            alt={targetChar.name}
            className="wa-avatar"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
            }}
          />
          <div className="wa-user-info">
            <span className="wa-user-name">
              {isGroup ? (content.groupTitle || "Grup Obrolan") : targetChar.name}
            </span>
            <span className={`wa-status-text ${content.statusText === 'online' ? 'online' : ''}`}>
              {content.statusText || (isGroup ? "ketuk untuk info grup" : "online")}
            </span>
          </div>
        </div>

        <div className="wa-header-actions">
          <Video size={19} />
          <Phone size={17} />
          <MoreVertical size={18} />
        </div>
      </div>

      {/* Chat Messages Body with WhatsApp Doodle */}
      <div className="wa-chat-body">
        <div className="wa-date-pill">HARI INI</div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === 'me';
          const sender = getCharacter(msg.senderId);
          const hasTail = msg.hasTail !== false;
          const isPlaying = playingVnId === msg.id;

          return (
            <div
              key={msg.id}
              className={`wa-bubble-container ${isMe ? 'me' : 'other'}`}
            >
              <div className={`wa-bubble ${hasTail ? 'has-tail' : ''}`}>
                {/* Sender Name in Group Chat */}
                {isGroup && !isMe && (
                  <div className="wa-sender-header" style={{ color: sender.color || '#00a884' }}>
                    {sender.name}
                  </div>
                )}

                {/* Forwarded Tag */}
                {msg.isForwarded && (
                  <div className="wa-forwarded-tag">
                    <CornerDownRight size={11} />
                    <span>Diteruskan</span>
                  </div>
                )}

                {/* Reply / Quote Preview Box */}
                {msg.replyTo && (
                  <div className="wa-reply-quote-box">
                    <span className="wa-reply-quote-author">{msg.replyTo.senderName || 'Lawan Bicara'}</span>
                    <span className="wa-reply-quote-text">{msg.replyTo.textPreview || '...'}</span>
                  </div>
                )}

                {/* Message Image Attachment */}
                {msg.mediaUrl && (
                  <img
                    src={msg.mediaUrl}
                    alt="Lampiran"
                    className="wa-image-attachment"
                  />
                )}

                {/* Deleted Message State */}
                {msg.isDeleted ? (
                  <div className="wa-deleted-msg">
                    <Ban size={14} />
                    <span>Pesan ini telah dihapus</span>
                  </div>
                ) : msg.isVoiceNote ? (
                  /* Authentic Voice Note with waveform & avatar */
                  <div className="wa-vn-wrapper">
                    <div className="wa-vn-avatar-box">
                      <img src={sender.avatar} alt="" className="wa-vn-avatar" />
                    </div>
                    <div className="wa-vn-play-btn" onClick={() => toggleVnPlay(msg.id)}>
                      {isPlaying ? (
                        <Pause size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )}
                    </div>
                    <div className="wa-vn-waveform">
                      {[10, 16, 8, 22, 14, 20, 16, 12, 24, 18, 12, 16, 20, 14, 8, 18, 22, 10, 14, 16, 8].map((h, i) => (
                        <div
                          key={i}
                          className={`wa-waveform-bar ${i < (isPlaying ? 14 : 7) ? 'active' : ''}`}
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                    <span className="wa-vn-speed-pill">1.5x</span>
                  </div>
                ) : (
                  /* Normal Text Message */
                  <span>{msg.text}</span>
                )}

                {/* Bubble Timestamp & Status */}
                <div className="wa-bubble-meta">
                  <span className="wa-time">
                    {msg.isVoiceNote ? (msg.voiceDuration || "0:24") : (msg.time || "23:45")}
                  </span>
                  {isMe && !msg.isDeleted && (
                    <span className={`wa-check-icon ${msg.status === 'read' ? 'read' : 'sent'}`}>
                      {msg.status === 'read' || msg.status === 'delivered' ? (
                        <CheckCheck size={14} strokeWidth={2} />
                      ) : (
                        <Check size={13} strokeWidth={2} />
                      )}
                    </span>
                  )}
                </div>

                {/* Emoji Reactions Pill */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="wa-reaction-tag">
                    {msg.reactions.join(' ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Bottom Input Bar */}
      <div className="wa-input-bar">
        <Smile size={22} style={{ color: '#8696a0' }} />
        <div className="wa-input-pill">
          <span>Ketik pesan...</span>
          <Paperclip size={18} style={{ marginLeft: 'auto', transform: 'rotate(45deg)' }} />
        </div>
        <div className="wa-mic-btn">
          <Mic size={18} />
        </div>
      </div>
    </div>
  );
}
