import { ArrowLeft, Bookmark, Heart, Image, MessageCircle, MoreHorizontal, Plus, Repeat2, Send, Share } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function TwitterView({ slide, isDm = false, isThread = false }) {
  const { project, getCharacter } = useProject();
  const content = slide.content || {};
  const author = getCharacter(content.authorId);
  const theme = slide.customSettings?.theme || project.globalSettings.theme || 'dark';

  // Highlight hashtags and mentions in posts.
  const renderFormattedText = (text = '') => {
    const parts = text.split(/([#@][\w_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#') || part.startsWith('@')) {
        return <span key={i} className="x-hashtag">{part}</span>;
      }
      return part;
    });
  };

  const quoteTweet = content.quoteTweet || {};
  const quoteAuthor = quoteTweet.enabled ? getCharacter(quoteTweet.authorId) : null;
  const poll = content.poll || {};

  if (isDm) {
    const target = getCharacter(content.targetCharacterId);
    return <div className={`x-mockup-wrapper x-dm-wrapper x-chat-wrapper ${theme}`}>
      <div className="x-header x-chat-header" data-edit-target="chat-header">
        <ArrowLeft size={20} strokeWidth={2} /><span className="x-chat-heading"><strong>{target.name}</strong><small>{target.handle}</small></span>
        <MoreHorizontal size={21} strokeWidth={2} />
      </div>
      <div className="x-dm-conversation" data-edit-target="messages">
        <div className="x-dm-intro"><img src={target.avatar} alt="" /><strong>{target.name}</strong><span>{target.handle}</span><small>Chat di X</small></div>
        {(content.messages || []).map(message => <div key={message.id} className={`x-dm-message ${message.senderId === 'me' ? 'mine' : ''}`}
          data-edit-target={`message:${message.id}`}>
          {message.mediaUrl && <img className="x-dm-media" src={message.mediaUrl} alt="Lampiran pesan" />}
          {message.text && <span>{message.text}</span>}
          <small>{message.time || ''}{message.senderId === 'me' && message.status === 'read' ? ' · Dilihat' : ''}</small>
          {!!message.reactions?.length && <em>{message.reactions.join(' ')}</em>}
        </div>)}
      </div>
      <div className="x-dm-compose" aria-hidden="true"><Plus size={21} /><Image size={19} /><span>Mulai pesan</span><Send size={18} /></div>
    </div>;
  }

  return (
    <div className={`x-mockup-wrapper ${theme}`}>
      {/* Post header */}
      <div className="x-header">
        <ArrowLeft size={20} strokeWidth={2.2} />
        <span className="x-header-title">{isThread ? 'Utas' : 'Postingan'}</span>
        <div style={{ width: 20 }} />
      </div>

      <div className="x-content-scroll">
        {/* Main Post */}
        <div className="x-post-main" data-edit-target="post">
          {/* Author Meta */}
          <div className="x-author-row">
            <div className="x-author-meta">
              <img
                src={author.avatar}
                alt={author.name}
                className="x-avatar"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                }}
              />
              <div className="x-author-names">
                <span className="x-name">
                  {author.name}
                  {author.verified && (
                    <span className="x-verified-badge" title="Terverifikasi">
                      {author.verifiedType === 'gold' ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="#e2b714">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4z" />
                          <path d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4-6.7 6.7z" fill="#000000" />
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="#1d9bf0">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4z" />
                          <path d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4-6.7 6.7z" fill="#ffffff" />
                        </svg>
                      )}
                    </span>
                  )}
                </span>
                <span className="x-handle">{author.handle}</span>
              </div>
            </div>
          </div>

          {/* Post Text */}
          <div className="x-post-text" data-edit-target="post-text">
            {renderFormattedText(content.text)}
          </div>

          {/* Quoted Tweet Box (Retweet with comment) */}
          {quoteTweet.enabled && quoteAuthor && (
            <div className="x-quote-card">
              <div className="x-quote-header">
                <img src={quoteAuthor.avatar} alt="" className="x-quote-avatar" />
                <span className="x-quote-name">{quoteAuthor.name}</span>
                <span className="x-quote-handle">{quoteAuthor.handle}</span>
              </div>
              <div className="x-quote-text">
                {renderFormattedText(quoteTweet.text || 'Isi tweet yang dikutip...')}
              </div>
            </div>
          )}

          {/* Poll */}
          {poll.enabled && poll.options && (
            <div className="x-poll-container">
              {poll.options.map((opt, oIdx) => (
                <div key={oIdx} className="x-poll-option">
                  <div className="x-poll-bar" style={{ width: `${opt.percent || 25}%` }} />
                  <span className="x-poll-label">{opt.text}</span>
                  <span className="x-poll-pct">{opt.percent || 25}%</span>
                </div>
              ))}
              <span className="x-poll-meta">{poll.totalVotes || '1,420'} suara · 1 hari tersisa</span>
            </div>
          )}

          {/* Media Image Attachment */}
          {content.mediaUrl && (
            <div className="x-media-container">
              <img src={content.mediaUrl} alt="Attached Media" className="x-media-img" />
            </div>
          )}

          {/* Timestamp and Device */}
          <div className="x-meta-footer">
            <span>{content.timestamp || "11:45 PM · 26 Sep 26"}</span>
            {content.client && <><span>·</span><span className="x-meta-device">{content.client}</span></>}
            {content.viewsCount && (
              <>
                <span>·</span>
                <span><b>{content.viewsCount}</b> Tayangan</span>
              </>
            )}
          </div>

          {/* Metrics Counters */}
          <div className="x-metrics-row">
            <div className="x-metric-item">
              <span className="x-metric-val">{content.retweetsCount || "342"}</span>
              <span>Repost</span>
            </div>
            <div className="x-metric-item">
              <span className="x-metric-val">{content.likesCount || "1.4K"}</span>
              <span>Suka</span>
            </div>
            <div className="x-metric-item">
              <span className="x-metric-val">{content.bookmarksCount || "189"}</span>
              <span>Markah</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="x-actions-bar">
            <div className="x-action-btn"><MessageCircle size={18} /></div>
            <div className="x-action-btn"><Repeat2 size={19} /></div>
            <div className="x-action-btn"><Heart size={18} /></div>
            <div className="x-action-btn"><Bookmark size={18} /></div>
            <div className="x-action-btn"><Share size={18} /></div>
          </div>
        </div>

        {/* Reply Chain / Thread */}
        {content.replies && content.replies.length > 0 && (
          <div className="x-reply-chain" data-edit-target="replies">
            {content.replies.map((rep) => {
              const repAuthor = getCharacter(rep.authorId);
              return (
                <div key={rep.id} className="x-reply-card">
                  <div className="x-thread-line" />
                  <img src={repAuthor.avatar} alt={repAuthor.name} className="x-reply-avatar" />
                  <div className="x-reply-body">
                    <div className="x-reply-header">
                      <span style={{ fontWeight: 700 }}>{repAuthor.name}</span>
                      <span className="x-handle">{repAuthor.handle}</span>
                      <span className="x-handle">· {rep.timestamp || "1m"}</span>
                    </div>
                  {!isThread && <div className="x-replying-to">
                      Membalas <span>{author.handle}</span>
                    </div>}
                  <div className="x-reply-text">
                      {renderFormattedText(rep.text)}
                    </div>
                    {rep.mediaUrl && <img className="x-media-img x-reply-media" src={rep.mediaUrl} alt="Media utas" />}
                    <div style={{ display: 'flex', gap: 18, color: '#71767b', fontSize: 12, marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={14} /> {rep.repliesCount || '0'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Repeat2 size={14} /> {rep.retweetsCount || '0'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={14} /> {rep.likesCount || "5"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
