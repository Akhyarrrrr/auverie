import React from 'react';
import { ChevronLeft, Video, Phone, MoreVertical, Play, Mic, Paperclip, Smile, CheckCheck, Check } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function WhatsAppView({ slide, isGroup = false }) {
  const { project, getCharacter } = useProject();
  const content = slide.content || {};
  const targetChar = getCharacter(content.targetCharacterId);
  const messages = content.messages || [];
  const theme = slide.customSettings?.theme || project.globalSettings.theme || 'dark';

  return (
    <div className={`wa-mockup-wrapper ${theme}`}>
      {/* WhatsApp Header */}
      <div className="wa-header">
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

      {/* Chat Messages */}
      <div className="wa-chat-body">
        <div className="wa-date-pill">HARI INI</div>

        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          const sender = getCharacter(msg.senderId);

          return (
            <div
              key={msg.id}
              className={`wa-bubble-container ${isMe ? 'me' : 'other'}`}
            >
              <div className="wa-bubble">
                {/* Sender Name in Group Chat */}
                {isGroup && !isMe && (
                  <div className="wa-sender-header" style={{ color: sender.color || '#00a884' }}>
                    {sender.name}
                  </div>
                )}

                {/* Media Image Attachment */}
                {msg.mediaUrl && (
                  <img
                    src={msg.mediaUrl}
                    alt="Lampiran"
                    className="wa-image-attachment"
                  />
                )}

                {/* Voice Note */}
                {msg.isVoiceNote ? (
                  <div className="wa-vn-wrapper">
                    <div className="wa-vn-play-btn">
                      <Play size={15} fill="currentColor" />
                    </div>
                    <div className="wa-vn-waveform">
                      {[12, 18, 8, 22, 14, 20, 16, 10, 24, 18, 12, 16, 20, 14, 8, 18, 22, 10, 14].map((h, i) => (
                        <div
                          key={i}
                          className={`wa-waveform-bar ${i < 8 ? 'active' : ''}`}
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                    <Mic size={14} style={{ opacity: 0.7 }} />
                  </div>
                ) : (
                  <span>{msg.text}</span>
                )}

                {/* Bubble Timestamp & Status */}
                <div className="wa-bubble-meta">
                  <span className="wa-time">
                    {msg.isVoiceNote ? (msg.voiceDuration || "0:24") : (msg.time || "23:45")}
                  </span>
                  {isMe && (
                    <span className={`wa-check-icon ${msg.status === 'read' ? 'read' : 'sent'}`}>
                      {msg.status === 'read' || msg.status === 'delivered' ? (
                        <CheckCheck size={14} strokeWidth={2} />
                      ) : (
                        <Check size={13} strokeWidth={2} />
                      )}
                    </span>
                  )}
                </div>

                {/* Emoji Reactions */}
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
