import React from 'react';
import { ChevronLeft, Phone, Video, Info, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function InstagramView({ slide, isPost = false }) {
  const { project, getCharacter } = useProject();
  const content = slide.content || {};
  const theme = slide.customSettings?.theme || project.globalSettings.theme || 'dark';

  // Instagram Feed Post Mode
  if (isPost) {
    const author = getCharacter(content.authorId);
    return (
      <div className={`ig-mockup-wrapper ${theme}`}>
        <div className="ig-header">
          <ChevronLeft size={24} />
          <span style={{ fontWeight: 700, fontSize: 16 }}>Postingan</span>
          <div style={{ width: 24 }} />
        </div>

        <div className="ig-post-view">
          <div className="ig-post-header">
            <div className="ig-post-user">
              <img src={author.avatar} alt={author.name} className="ig-post-avatar" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>{author.handle.replace('@', '')}</span>
            </div>
            <MoreHorizontal size={18} />
          </div>

          <div className="ig-post-img-container">
            <img
              src={content.imageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"}
              alt="Post"
              className="ig-post-img"
            />
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

          <div className="ig-post-caption-box">
            <span className="ig-caption-user">{author.handle.replace('@', '')}</span>
            <span>{content.caption || "Hari yang menyenangkan ✨"}</span>
          </div>
        </div>
      </div>
    );
  }

  // Instagram DM Mode
  const targetChar = getCharacter(content.targetCharacterId);
  const messages = content.messages || [];

  return (
    <div className={`ig-mockup-wrapper ${theme}`}>
      {/* IG DM Header */}
      <div className="ig-header">
        <div className="ig-header-user">
          <ChevronLeft size={24} />
          <img src={targetChar.avatar} alt={targetChar.name} className="ig-header-avatar" />
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
            <div key={msg.id} className={`ig-bubble-row ${isMe ? 'me' : 'other'}`}>
              {!isMe && (
                <img src={targetChar.avatar} alt="" className="ig-avatar-mini" />
              )}
              <div className="ig-bubble">
                {msg.text}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="ig-heart-reaction">
                    {msg.reactions.join(' ')}
                  </div>
                )}
              </div>
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
