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
  Heart
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function SlideInspector() {
  const {
    project,
    activeSlide,
    updateSlideContent,
    updateSlideMeta,
    duplicateSlide,
    deleteSlide
  } = useProject();

  if (!activeSlide) {
    return (
      <aside className="inspector-panel">
        <div className="inspector-header">Inspector</div>
        <div className="sidebar-content" style={{ color: 'var(--text-muted)' }}>
          Pilih slide untuk mulai mengedit.
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
      status: 'read'
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
          <label className="form-label">Judul / Catatan Adegan</label>
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
              <label className="form-label">Status Info</label>
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
                {(content.messages || []).map((msg, mIdx) => (
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

            <div className="form-group">
              <label className="form-label">URL Foto Lampiran (Opsional)</label>
              <input
                type="text"
                className="form-input"
                value={content.mediaUrl || ''}
                onChange={(e) => updateSlideContent(activeSlide.id, { mediaUrl: e.target.value })}
                placeholder="https://..."
              />
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

        {/* ----------------- INSTAGRAM INSPECTOR ----------------- */}
        {activeSlide.type === 'ig_dm' && (
          <>
            <div className="form-group">
              <label className="form-label">Teman Obrolan IG</label>
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
            </div>

            <div className="form-group">
              <label className="form-label">Keterangan Dilihat (Seen)</label>
              <input
                type="text"
                className="form-input"
                value={content.seenText || 'Dilihat baru saja'}
                onChange={(e) =>
                  updateSlideContent(activeSlide.id, { seenText: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Daftar Pesan DM ({content.messages?.length || 0})</span>
                <button
                  className="btn-header"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={handleAddChatMessage}
                >
                  <Plus size={12} /> Tambah
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(content.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', width: 'auto', padding: '2px 6px' }}
                        value={msg.senderId}
                        onChange={(e) => handleUpdateMessage(msg.id, { senderId: e.target.value })}
                      >
                        <option value="me">Saya (Ungu Gradient)</option>
                        <option value={content.targetCharacterId || project.characters[0]?.id}>
                          Teman (Abu-Abu)
                        </option>
                      </select>
                      <button
                        className="btn-header"
                        style={{ padding: '2px 6px', color: '#ef4444' }}
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <textarea
                      className="form-textarea"
                      rows={2}
                      style={{ fontSize: '12px' }}
                      value={msg.text || ''}
                      onChange={(e) => handleUpdateMessage(msg.id, { text: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ----------------- LOCKSCREEN INSPECTOR ----------------- */}
        {activeSlide.type === 'lockscreen' && (
          <>
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

            <div className="form-group">
              <label className="form-label">URL Wallpaper Layar Kunci</label>
              <input
                type="text"
                className="form-input"
                value={content.wallpaperUrl || ''}
                onChange={(e) =>
                  updateSlideContent(activeSlide.id, { wallpaperUrl: e.target.value })
                }
                placeholder="https://..."
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
    </aside>
  );
}
