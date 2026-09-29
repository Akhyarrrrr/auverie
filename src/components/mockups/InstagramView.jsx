import {
  ChevronLeft,
  Phone,
  Video,
  Info,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Star
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function InstagramView({ slide, isPost = false, isStory = false, previewCharacters = [] }) {
  const { project, getCharacter: storedCharacter } = useProject();
  const getCharacter = id => previewCharacters.find(character => character.id === id) || storedCharacter(id);
  const content = slide.content || {};
  const theme = slide.customSettings?.theme || project.globalSettings.theme || 'dark';

  // 1. INSTAGRAM STORY MODE
  if (isStory) {
    const author = getCharacter(content.authorId);
    const bgUrl = content.backgroundUrl;
    const music = content.musicSticker || {};
    const question = content.questionSticker || {};

    return (
      <div
        className="ig-story-wrapper"
        style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
          backgroundColor: content.backgroundColor || '#715d72' }}
      >
        <div className="ig-story-overlay" />

        <div className="ig-story-content">
          {/* Top Story Header */}
          <div>
            {/* Story Progress Segments */}
            <div className="ig-story-progress-bar">
              {Array.from({ length: Math.min(10, Math.max(1, content.storySegments || 3)) }, (_, index) =>
                <div key={index} className={'ig-story-progress-segment' + (index === 0 ? ' active' : '')} />)}
            </div>

            <div className="ig-story-header">
              <div className="ig-story-author-box">
                <img src={author.avatar} alt="" className="ig-story-author-avatar" />
                <span className="ig-story-author-name">{author.handle.replace('@', '')}</span>
                <span className="ig-story-time">{content.storyTime || '14m'}</span>
              </div>

              {content.isCloseFriends && (
                <div className="ig-story-close-friends-badge">
                  <Star size={11} fill="white" />
                  <span>Teman Dekat</span>
                </div>
              )}
            </div>
          </div>

          {/* Center Story Stickers (Music & Question Box) */}
          <div className="ig-story-stickers-container" data-edit-target="story-stickers">
            {/* Music Sticker */}
            {music.enabled !== false && music.song && (
              <div className="ig-music-sticker">
                <img
                  src={music.albumArt || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=100&q=80'}
                  alt=""
                  className="ig-music-album-art"
                />
                <div className="ig-music-details">
                  <span className="ig-music-title">{music.song}</span>
                  <span className="ig-music-artist">{music.artist || 'Artist'}</span>
                </div>
              </div>
            )}

            {/* Question Sticker */}
            {question.enabled && (
              <div className="ig-question-box">
                <div className="ig-question-header">
                  {question.prompt || "Tanya aku apa aja..."}
                </div>
                <div className="ig-question-input-mock">
                  Ketik jawaban kamu di sini...
                </div>
              </div>
            )}

            {/* Story Caption */}
            {content.caption && (
              <div data-edit-target="story-caption" style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {content.caption}
              </div>
            )}
          </div>

          {/* Bottom Story Reply Bar */}
          <div className="ig-story-reply-bar">
            <div className="ig-story-reply-pill">
              <span>Kirim pesan...</span>
            </div>
            <Heart size={24} fill="none" color="white" />
            <Send size={22} color="white" />
          </div>
        </div>
      </div>
    );
  }

  // 2. INSTAGRAM FEED POST MODE
  if (isPost) {
    const author = getCharacter(content.authorId);
    return (
      <div className={`ig-mockup-wrapper ${theme}`}>
        <div className="ig-header">
          <ChevronLeft size={24} />
          <span style={{ fontWeight: 700, fontSize: 16 }}>Postingan</span>
          <div style={{ width: 24 }} />
        </div>

        <div className="ig-post-view" data-edit-target="post">
          <div className="ig-post-header">
            <div className="ig-post-user">
              <img src={author.avatar} alt={author.name} className="ig-post-avatar" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>{author.handle.replace('@', '')}</span>
            </div>
            <MoreHorizontal size={18} />
          </div>

          <div className="ig-post-img-container" data-edit-target="post">
            {content.imageUrl ? <img src={content.imageUrl} alt="Foto postingan" className="ig-post-img" />
              : <div className="ig-media-placeholder no-export">Tambahkan foto lewat panel Edit</div>}
          </div>

          <div className="ig-post-actions">
            <div className="ig-actions-left">
              <Heart size={24} strokeWidth={2} />
              <MessageCircle size={24} strokeWidth={2} style={{ transform: 'scaleX(-1)' }} />
              <Send size={22} strokeWidth={2} />
            </div>
            <Bookmark size={24} strokeWidth={2} />
          </div>

          <div className="ig-post-likes">{content.likesCount || "1,248 suka"}</div>

          <div className="ig-post-caption-box" data-edit-target="post-caption">
            <span className="ig-caption-user">{author.handle.replace('@', '')}</span>
            <span>{content.caption || "Hari yang menyenangkan ✨"}</span>
          </div>
          {(content.comments || []).map(comment => <div className="ig-post-comment" key={comment.id} data-edit-target={`comment:${comment.id}`}>
            <strong>{getCharacter(comment.authorId).handle.replace('@', '')}</strong> {comment.text}
          </div>)}
        </div>
      </div>
    );
  }

  // 3. INSTAGRAM DM MODE
  const targetChar = getCharacter(content.targetCharacterId);
  const messages = content.messages || [];

  return (
    <div className={`ig-mockup-wrapper ${theme}`}>
      {/* IG DM Header */}
      <div className="ig-header" data-edit-target="chat-header">
        <div className="ig-header-user">
          <ChevronLeft size={24} />
          <div className="ig-header-avatar-box">
            <img src={targetChar.avatar} alt={targetChar.name} className="ig-header-avatar" />
            {content.isActive !== false && <div className="ig-active-dot" title="Aktif sekarang" />}
          </div>
          <div className="ig-header-title-box">
            <span className="ig-header-name">{targetChar.name}</span>
            <span className="ig-header-handle">{targetChar.handle}</span>
          </div>
        </div>
        <div className="ig-header-icons">
          <Phone size={20} />
          <Video size={22} />
          <Info size={20} />
        </div>
      </div>

      {/* Messages */}
      <div className="ig-dm-body">
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={msg.id} className={`ig-bubble-row ${isMe ? 'me' : 'other'}`} data-edit-target={`message:${msg.id}`}>
              {!isMe && (
                <img src={targetChar.avatar} alt="" className="ig-avatar-mini" />
              )}
              <div className="ig-bubble">
                {msg.mediaUrl && <img className="ig-dm-media" src={msg.mediaUrl} alt="Lampiran pesan" />}
                {msg.text}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="ig-heart-reaction">
                    {msg.reactions.join(' ')}
                  </div>
                )}
              </div>
              {msg.time && <small className="ig-message-time">{msg.time}</small>}
            </div>
          );
        })}

        {content.seenText && (
          <span className="ig-seen-text">{content.seenText}</span>
        )}
      </div>

      {/* Bottom Input */}
      <div className="ig-dm-input-bar">
        <div className="ig-dm-input-pill">
          <span>Kirim pesan...</span>
        </div>
        <Heart size={24} />
      </div>
    </div>
  );
}
