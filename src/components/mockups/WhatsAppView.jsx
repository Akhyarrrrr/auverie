import {
  ChevronLeft,
  Video,
  Phone,
  MoreVertical,
  Play,
  Mic,
  Paperclip,
  Smile,
  Camera,
  Plus,
  Send,
  Sticker,
  Delete,
  ArrowBigUp,
  CheckCheck,
  Check,
  CornerDownRight,
  Ban
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { whatsappColors } from '../../data/whatsappThemes';

const keyRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function Keyboard({ platform, theme }) {
  return <div className={`wa-keyboard ${platform} ${theme}`} aria-hidden="true">
    {keyRows.map((row, index) => <div className="wa-key-row" key={row}>
      {index === 2 && <span className="wa-key special"><ArrowBigUp size={18} /></span>}
      {[...row].map(letter => <span className="wa-key" key={letter}>{letter}</span>)}
      {index === 2 && <span className="wa-key special"><Delete size={18} /></span>}
    </div>)}
    <div className="wa-key-row wa-key-bottom"><span className="wa-key special">123</span>
      <span className="wa-key space">{platform === 'android' ? 'spasi' : ''}</span>
      <span className="wa-key special wa-return">↵</span></div>
    {platform === 'ios' && <div className="wa-keyboard-tools"><Smile size={21} /><Mic size={21} /></div>}
  </div>;
}

export default function WhatsAppView({ slide, isGroup = false, previewCharacters = [] }) {
  const { project, getCharacter: storedCharacter } = useProject();
  const getCharacter = id => previewCharacters.find(character => character.id === id) || storedCharacter(id);
  const content = slide.content || {};
  const targetChar = getCharacter(content.targetCharacterId);
  const messages = content.messages || [];
  const globalSettings = project.globalSettings || {};
  const theme = slide.customSettings?.theme || globalSettings.theme || 'dark';
  const model = slide.customSettings?.phoneModel || globalSettings.phoneModel || '';
  const whatsappStyle = model.startsWith('samsung') ? 'android' : model === 'frameless'
    ? (slide.customSettings?.os || globalSettings.os || 'ios') : 'ios';
  const showKeyboard = !!content.showKeyboard;
  const unreadCount = Number(content.unreadCount) || 0;

  return (
    <div className={`wa-mockup-wrapper ${theme} wa-${whatsappStyle} palette-${content.chatPalette || 'classic'} wallpaper-${content.wallpaperPattern || 'auto'} ${showKeyboard ? 'keyboard-open' : ''}`}
      style={whatsappColors(content, theme)}>
      {/* WhatsApp Header (iOS vs Android) */}
      <div className={`wa-header ${whatsappStyle === 'android' ? 'style-android' : ''}`} data-edit-target="chat-header">
        <div className="wa-header-left">
          <div className="wa-back-btn">
            <ChevronLeft size={22} strokeWidth={2.5} />
            {content.backCount && <span>{content.backCount}</span>}
          </div>
          <img
            src={isGroup ? content.groupAvatar || targetChar.avatar : targetChar.avatar}
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
            <span className={`wa-status-text ${content.showTypingIndicator || content.statusText === 'online' ? 'online' : ''}`}>
              {content.showTypingIndicator ? 'sedang mengetik…' : content.statusText || (isGroup ? "ketuk untuk info grup" : "online")}
            </span>
          </div>
        </div>

        <div className="wa-header-actions">
          <Video size={19} />
          <Phone size={17} />
          {whatsappStyle === 'android' && <MoreVertical size={18} />}
        </div>
      </div>

      {/* Chat Messages Body with WhatsApp Doodle */}
      <div className="wa-chat-body" style={content.customWallpaper ? { backgroundImage: 'url(' + content.customWallpaper + ')' } : undefined}>
        <div className="wa-chat-stream">
        {content.dateLabel !== '' && <div className="wa-date-pill">{content.dateLabel ?? 'HARI INI'}</div>}
        {unreadCount > 0 && <div className="wa-unread-divider"><span>{unreadCount} pesan belum dibaca</span></div>}

        {messages.map((msg, index) => {
          const isMe = msg.senderId === 'me';
          const sender = getCharacter(msg.senderId);
          const hasTail = msg.hasTail !== false;
          const kind = msg.kind || (msg.isDeleted ? 'deleted' : msg.isVoiceNote ? 'voice' : msg.mediaUrl ? 'image' : 'text');
          const isSticker = kind === 'sticker';

          return (
            <div
              key={msg.id}
              className={`wa-bubble-container ${isMe ? 'me' : 'other'} ${isSticker ? 'sticker-message' : ''}`}
              data-edit-target={`message:${msg.id}`}
            >
              <div className={`wa-bubble ${hasTail && !isSticker ? 'has-tail' : ''}`}>
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
                {kind === 'image' && msg.mediaUrl && (
                  <img
                    src={msg.mediaUrl}
                    alt="Lampiran"
                    className="wa-image-attachment"
                  />
                )}
                {kind === 'image' && !msg.mediaUrl && <div className="wa-media-placeholder">Foto belum dipilih</div>}
                {isSticker && (msg.stickerUrl
                  ? <img src={msg.stickerUrl} alt="Stiker" className="wa-sticker-image" />
                  : <div className="wa-media-placeholder">Stiker belum dipilih</div>)}

                {/* Deleted Message State */}
                {kind === 'deleted' ? (
                  <div className="wa-deleted-msg">
                    <Ban size={14} />
                    <span>Pesan ini telah dihapus</span>
                  </div>
                ) : kind === 'voice' ? (
                  /* Voice note with waveform and avatar. */
                  <div className="wa-vn-wrapper">
                    <div className="wa-vn-avatar-box">
                      <img src={sender.avatar} alt="" className="wa-vn-avatar" />
                    </div>
                    <div className="wa-vn-play-btn" aria-hidden="true"><Play size={14} fill="currentColor" /></div>
                    <div className="wa-vn-waveform">
                      {[10, 16, 8, 22, 14, 20, 16, 12, 24, 18, 12, 16, 20, 14, 8, 18, 22, 10, 14, 16, 8].map((h, i) => (
                        <div
                          key={i}
                          className={`wa-waveform-bar ${i < 7 ? 'active' : ''}`}
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                    <span className="wa-vn-speed-pill">1.5x</span>
                  </div>
                ) : kind !== 'sticker' && (
                  /* Normal Text Message */
                  msg.text && <span className="wa-message-text">{msg.text}</span>
                )}

                {/* Bubble Timestamp & Status */}
                <div className="wa-bubble-meta">
                  <span className="wa-time">
                    {kind === 'voice' ? (msg.voiceDuration || "0:24") : (msg.time || "23:45")}
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
        {content.showTypingIndicator && <div className="wa-typing-bubble" aria-label="Lawan bicara sedang mengetik"><i /><i /><i /></div>}
        </div>
      </div>

      {/* WhatsApp Bottom Input Bar */}
      <div className="wa-input-bar" data-edit-target="composer">
        {whatsappStyle === 'ios' ? <Plus className="wa-compose-plus" size={27} /> : <Smile size={22} />}
        <div className="wa-input-pill"><span className={content.draftText ? 'draft' : ''}>{content.draftText || (showKeyboard ? '' : 'Pesan')}</span>
          {whatsappStyle === 'ios' ? <Sticker size={20} /> : <Paperclip size={18} />}</div>
        {whatsappStyle === 'ios' && <Camera size={22} className="wa-compose-camera" />}
        <div className="wa-mic-btn">{content.draftText ? <Send size={18} /> : <Mic size={18} />}</div>
      </div>
      {showKeyboard && <Keyboard platform={whatsappStyle} theme={theme} />}
    </div>
  );
}
