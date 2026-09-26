import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Copy,
  Smile,
  Mic,
  Image,
  MessageCircle,
  Clock,
  Sparkles,
  Heart,
  Music,
  HelpCircle,
  Star,
  Quote,
  BarChart2,
  Ban
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import AssetPickerModal from './AssetPickerModal';

export default function SlideInspector() {
  const {
    project,
    activeSlide,
    updateSlideContent,
    updateSlideMeta,
    duplicateSlide,
    deleteSlide
  } = useProject();

  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetTargetField, setAssetTargetField] = useState('wallpaperUrl');

  if (!activeSlide) {
    return (
      <aside className="inspector-panel">
        <div className="inspector-header">Inspector</div>
        <div className="sidebar-content" style={{ color: 'var(--text-muted)' }}>
          Pilih slide di bawah untuk mulai mengedit.
        </div>
      </aside>
    );
  }

  const content = activeSlide.content || {};

  // Handlers for WhatsApp & IG DM Messages
  const handleAddChatMessage = () => {
    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: 'Pesan baru...',
      time: project.globalSettings.time || '23:45',
      status: 'read',
      hasTail: true
    };
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMsg]
    }));
  };

  const handleUpdateMessage = (msgId, updates) => {
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      messages: (prev.messages || []).map((m) =>
        m.id === msgId ? { ...m, ...updates } : m
      )
    }));
  };

  const handleDeleteMessage = (msgId) => {
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      messages: (prev.messages || []).filter((m) => m.id !== msgId)
    }));
  };

  // Lockscreen Notifications Handlers
  const handleAddNotification = () => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      app: 'whatsapp',
      title: project.characters[0]?.name || 'Pengirim',
      message: 'Pesan notifikasi baru...',
      time: 'Baru saja'
    };
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      notifications: [...(prev.notifications || []), newNotif]
    }));
  };

  const handleUpdateNotification = (notifId, updates) => {
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((n) =>
        n.id === notifId ? { ...n, ...updates } : n
      )
    }));
  };

  const handleDeleteNotification = (notifId) => {
    updateSlideContent(activeSlide.id, (prev) => ({
      ...prev,
      notifications: (prev.notifications || []).filter((n) => n.id !== notifId)
    }));
  };

  const openWallpaperPicker = (field = 'wallpaperUrl') => {
    setAssetTargetField(field);
    setAssetPickerOpen(true);
  };

  return (
    <aside className="inspector-panel">
      {/* Header */}
      <div className="inspector-header">
        <span>Pengaturan Slide #{activeSlide.order}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn-header"
            style={{ padding: '3px 8px', fontSize: '11px' }}
            onClick={() => duplicateSlide(activeSlide.id)}
            title="Duplikasi slide"
          >
            <Copy size={12} />
          </button>
          <button
            className="btn-header"
            style={{ padding: '3px 8px', fontSize: '11px', color: '#ef4444' }}
            onClick={() => deleteSlide(activeSlide.id)}
            title="Hapus slide"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="inspector-content">
        {/* Slide Title */}
        <div className="form-group">
          <label className="form-label">Catatan / Judul Adegan</label>
          <input
            type="text"
            className="form-input"
            value={activeSlide.title || ''}
            onChange={(e) => updateSlideMeta(activeSlide.id, { title: e.target.value })}
            placeholder="Contoh: Chat Reyhan & Bianca"
          />
        </div>

        {/* ----------------- WHATSAPP INSPECTOR ----------------- */}
        {(activeSlide.type === 'wa_chat' || activeSlide.type === 'wa_group') && (
          <>
            <div className="form-group">
              <label className="form-label">
                {activeSlide.type === 'wa_group' ? 'Judul Grup' : 'Teman Obrolan'}
              </label>
              {activeSlide.type === 'wa_group' ? (
                <input
                  type="text"
                  className="form-input"
                  value={content.groupTitle || 'Bocah Kosan 99'}
                  onChange={(e) =>
                    updateSlideContent(activeSlide.id, { groupTitle: e.target.value })
                  }
                />
              ) : (
                <select
                  className="form-select"
                  value={content.targetCharacterId || project.characters[0]?.id}
                  onChange={(e) =>
                    updateSlideContent(activeSlide.id, { targetCharacterId: e.target.value })
                  }
                >
                  {project.characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.handle})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Status Info WhatsApp</label>
              <input
                type="text"
                className="form-input"
                value={content.statusText || ''}
                onChange={(e) =>
                  updateSlideContent(activeSlide.id, { statusText: e.target.value })
                }
                placeholder="online, mengetik..., atau jam"
              />
            </div>

            {/* Messages Manager */}
            <div className="form-group">
              <div className="form-label">
                <span>Daftar Pesan ({content.messages?.length || 0})</span>
                <button
                  className="btn-header"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={handleAddChatMessage}
                >
                  <Plus size={12} /> Tambah
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(content.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <select
                        className="form-select"
                        style={{ padding: '3px 8px', fontSize: '11px', width: 'auto' }}
                        value={msg.senderId}
                        onChange={(e) => handleUpdateMessage(msg.id, { senderId: e.target.value })}
                      >
                        <option value="me">Saya (Kanan / Hijau)</option>
                        {project.characters.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Kiri)
                          </option>
                        ))}
                      </select>

                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn-header"
                          style={{
                            padding: '3px 6px',
                            fontSize: '11px',
                            background: msg.isVoiceNote ? 'var(--accent-primary)' : 'transparent'
                          }}
                          onClick={() => handleUpdateMessage(msg.id, { isVoiceNote: !msg.isVoiceNote })}
                          title="Ubah jadi Voice Note"
                        >
                          <Mic size={12} /> VN
                        </button>
                        <button
                          className="btn-header"
                          style={{ padding: '3px 6px', color: '#ef4444' }}
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Hapus pesan"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {msg.isVoiceNote ? (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '11px' }}>Durasi Voice Note</label>
                        <input
                          type="text"
                          className="form-input"
                          value={msg.voiceDuration || '0:24'}
                          onChange={(e) => handleUpdateMessage(msg.id, { voiceDuration: e.target.value })}
                          placeholder="0:34"
                        />
                      </div>
                    ) : (
                      <textarea
                        className="form-textarea"
                        rows={2}
                        style={{ fontSize: '12px' }}
                        value={msg.text || ''}
                        onChange={(e) => handleUpdateMessage(msg.id, { text: e.target.value })}
                        placeholder="Isi pesan chat..."
                      />
                    )}

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '80px', fontSize: '11px', padding: '4px 6px' }}
                        value={msg.time || '23:45'}
                        onChange={(e) => handleUpdateMessage(msg.id, { time: e.target.value })}
                        placeholder="Jam"
                      />

                      {/* Quick Emoji Reaction Buttons */}
                      <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                        {['❤️', '😂', '👍', '😭'].map((emoji) => {
                          const hasReaction = (msg.reactions || []).includes(emoji);
                          return (
                            <button
                              key={emoji}
                              type="button"
                              style={{
                                fontSize: '12px',
                                padding: '2px 5px',
                                borderRadius: '4px',
                                background: hasReaction ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)'
                              }}
                              onClick={() => {
                                const current = msg.reactions || [];
                                const updated = current.includes(emoji)
                                  ? current.filter((r) => r !== emoji)
                                  : [...current, emoji];
                                handleUpdateMessage(msg.id, { reactions: updated });
                              }}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ----------------- TWITTER / X INSPECTOR ----------------- */}
        {activeSlide.type === 'x_tweet' && (
          <>
            <div className="form-group">
              <label className="form-label">Penulis Tweet</label>
              <select
                className="form-select"
                value={content.authorId || project.characters[0]?.id}
                onChange={(e) => updateSlideContent(activeSlide.id, { authorId: e.target.value })}
              >
                {project.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.handle})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Isi Postingan Tweet</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={content.text || ''}
                onChange={(e) => updateSlideContent(activeSlide.id, { text: e.target.value })}
                placeholder="Tulis tweet AU..."
              />
            </div>

            {/* Quote Tweet Toggle */}
            <div className="form-group">
              <div className="form-label">
                <span><Quote size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} /> Kutip Tweet Lain (Quote Tweet)</span>
                <input
                  type="checkbox"
                  checked={content.quoteTweet?.enabled || false}
                  onChange={(e) =>
                    updateSlideContent(activeSlide.id, {
                      quoteTweet: {
                        ...content.quoteTweet,
                        enabled: e.target.checked,
                        authorId: project.characters[1]?.id || project.characters[0]?.id
                      }
                    })
                  }
                />
              </div>
              {content.quoteTweet?.enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--bg-tertiary)', padding: 8, borderRadius: 8 }}>
                  <select
                    className="form-select"
                    value={content.quoteTweet?.authorId}
                    onChange={(e) =>
                      updateSlideContent(activeSlide.id, {
                        quoteTweet: { ...content.quoteTweet, authorId: e.target.value }
                      })
                    }
                  >
                    {project.characters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.handle})
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={content.quoteTweet?.text || ''}
                    onChange={(e) =>
                      updateSlideContent(activeSlide.id, {
                        quoteTweet: { ...content.quoteTweet, text: e.target.value }
                      })
                    }
                    placeholder="Teks tweet yang dikutip..."
                  />
                </div>
              )}
            </div>

            {/* Poll Toggle */}
            <div className="form-group">
              <div className="form-label">
                <span><BarChart2 size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} /> Polling Twitter</span>
                <input
                  type="checkbox"
                  checked={content.poll?.enabled || false}
                  onChange={(e) =>
                    updateSlideContent(activeSlide.id, {
                      poll: {
                        ...content.poll,
                        enabled: e.target.checked,
                        options: [
                          { text: 'Setuju banget', percent: 68 },
                          { text: 'Enggak deh', percent: 32 }
                        ]
                      }
                    })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Waktu & Perangkat</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <input
                  type="text"
                  className="form-input"
                  value={content.timestamp || '11:45 PM · 26 Sep 26'}
                  onChange={(e) => updateSlideContent(activeSlide.id, { timestamp: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  value={content.client || 'Twitter for iPhone'}
                  onChange={(e) => updateSlideContent(activeSlide.id, { client: e.target.value })}
                />
              </div>
            </div>

            {/* Twitter Engagement Metrics */}
            <div className="form-group">
              <label className="form-label">Metrik Interaksi</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Suka (Likes)</span>
                  <input
                    type="text"
                    className="form-input"
                    value={content.likesCount || '1.4K'}
                    onChange={(e) => updateSlideContent(activeSlide.id, { likesCount: e.target.value })}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Repost</span>
                  <input
                    type="text"
                    className="form-input"
                    value={content.retweetsCount || '342'}
                    onChange={(e) => updateSlideContent(activeSlide.id, { retweetsCount: e.target.value })}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Markah (Bookmark)</span>
                  <input
                    type="text"
                    className="form-input"
                    value={content.bookmarksCount || '189'}
                    onChange={(e) => updateSlideContent(activeSlide.id, { bookmarksCount: e.target.value })}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tayangan (Views)</span>
                  <input
                    type="text"
                    className="form-input"
                    value={content.viewsCount || '24.5K'}
                    onChange={(e) => updateSlideContent(activeSlide.id, { viewsCount: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ----------------- INSTAGRAM STORY INSPECTOR ----------------- */}
        {activeSlide.type === 'ig_story' && (
          <>
            <div className="form-group">
              <label className="form-label">Pembuat Story</label>
              <select
                className="form-select"
                value={content.authorId || project.characters[0]?.id}
                onChange={(e) => updateSlideContent(activeSlide.id, { authorId: e.target.value })}
              >
                {project.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.handle})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Foto Background Story</label>
              <button
                type="button"
                className="btn-header"
                style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-gradient)', color: 'white' }}
                onClick={() => openWallpaperPicker('backgroundUrl')}
              >
                <Sparkles size={13} />
                <span>Pilih Foto dari Galeri Estetik</span>
              </button>
            </div>

            <div className="form-group">
              <div className="form-label">
                <span><Star size={12} color="#10b981" style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} /> Mode Teman Dekat (Close Friends)</span>
                <input
                  type="checkbox"
                  checked={content.isCloseFriends !== false}
                  onChange={(e) => updateSlideContent(activeSlide.id, { isCloseFriends: e.target.checked })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Stiker Lagu Musik (Spotify / IG Music)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <input
                  type="text"
                  className="form-input"
                  value={content.musicSticker?.song || 'About You'}
                  onChange={(e) =>
                    updateSlideContent(activeSlide.id, {
                      musicSticker: { ...content.musicSticker, song: e.target.value }
                    })
                  }
                  placeholder="Judul Lagu"
                />
                <input
                  type="text"
                  className="form-input"
                  value={content.musicSticker?.artist || 'The 1975'}
                  onChange={(e) =>
                    updateSlideContent(activeSlide.id, {
                      musicSticker: { ...content.musicSticker, artist: e.target.value }
                    })
                  }
                  placeholder="Artis"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Stiker Kotak Pertanyaan (Question Box)</span>
                <input
                  type="checkbox"
                  checked={content.questionSticker?.enabled !== false}
                  onChange={(e) =>
                    updateSlideContent(activeSlide.id, {
                      questionSticker: { ...content.questionSticker, enabled: e.target.checked }
                    })
                  }
                />
              </div>
              {content.questionSticker?.enabled !== false && (
                <input
                  type="text"
                  className="form-input"
                  value={content.questionSticker?.prompt || 'Tanya aku apapun...'}
                  onChange={(e) =>
                    updateSlideContent(activeSlide.id, {
                      questionSticker: { ...content.questionSticker, prompt: e.target.value }
                    })
                  }
                />
              )}
            </div>
          </>
        )}

        {/* ----------------- LOCKSCREEN INSPECTOR ----------------- */}
        {activeSlide.type === 'lockscreen' && (
          <>
            <div className="form-group">
              <label className="form-label">Wallpaper Layar Kunci</label>
              <button
                type="button"
                className="btn-header"
                style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-gradient)', color: 'white' }}
                onClick={() => openWallpaperPicker('wallpaperUrl')}
              >
                <Sparkles size={13} />
                <span>Pilih Wallpaper dari Katalog</span>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Format Tanggal</label>
              <input
                type="text"
                className="form-input"
                value={content.dateString || 'Jumat, 26 September'}
                onChange={(e) =>
                  updateSlideContent(activeSlide.id, { dateString: e.target.value })
                }
              />
            </div>

            {/* Stacked Notifications */}
            <div className="form-group">
              <div className="form-label">
                <span>Notifikasi Menumpuk ({content.notifications?.length || 0})</span>
                <button
                  className="btn-header"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={handleAddNotification}
                >
                  <Plus size={12} /> Tambah
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(content.notifications || []).map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', padding: '3px 6px' }}
                        value={notif.app}
                        onChange={(e) => handleUpdateNotification(notif.id, { app: e.target.value })}
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="twitter">X (Twitter)</option>
                        <option value="instagram">Instagram</option>
                        <option value="messages">Pesan SMS</option>
                      </select>

                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '80px', fontSize: '11px', padding: '3px 6px' }}
                        value={notif.time || '2m ago'}
                        onChange={(e) => handleUpdateNotification(notif.id, { time: e.target.value })}
                        placeholder="Waktu"
                      />

                      <button
                        className="btn-header"
                        style={{ padding: '3px 6px', color: '#ef4444' }}
                        onClick={() => handleDeleteNotification(notif.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '12px', fontWeight: 600 }}
                      value={notif.title || ''}
                      onChange={(e) => handleUpdateNotification(notif.id, { title: e.target.value })}
                      placeholder="Judul / Nama Pengirim"
                    />

                    <textarea
                      className="form-textarea"
                      rows={2}
                      style={{ fontSize: '12px' }}
                      value={notif.message || ''}
                      onChange={(e) => handleUpdateNotification(notif.id, { message: e.target.value })}
                      placeholder="Isi preview pesan..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        type="wallpaper"
        currentUrl={content[assetTargetField]}
        onSelect={(selectedUrl) => {
          updateSlideContent(activeSlide.id, { [assetTargetField]: selectedUrl });
        }}
      />
    </aside>
  );
}
