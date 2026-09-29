import {
  Lock,
  Flashlight,
  Camera,
  MessageSquare,
  Play,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function LockscreenView({ slide }) {
  const { project } = useProject();
  const content = slide.content || {};
  const notifications = content.notifications || [];
  const globalSettings = project.globalSettings || {};
  const english = (slide.customSettings?.locale || globalSettings.locale) === 'en';
  const time = slide.customSettings?.time || globalSettings.time || "23:45";
  const dateString = content.dateString || (english ? "Friday, 26 September" : "Jumat, 26 September");
  const wallpaperUrl = content.wallpaperUrl;
  const fontStyle = slide.customSettings?.lockscreenFont || globalSettings.lockscreenFont || 'bold';
  const music = content.music || globalSettings.lockscreenMusic || {};
  const model = String(slide.customSettings?.phoneModel || globalSettings.phoneModel || '');

  return (
    <div
      className={`lockscreen-wrapper ${model.startsWith('samsung') ? 'android-lockscreen' : ''}`}
      style={{ backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : undefined,
        backgroundColor: content.backgroundColor || '#455c69' }}
    >
      <div className="lockscreen-overlay" />

      <div className="lockscreen-content">
        {/* Center Clock & Date Header */}
        <div className="lockscreen-header-center" data-edit-target="lock-clock">
          <div className="lockscreen-padlock">
            <Lock size={15} strokeWidth={2.5} />
          </div>
          <span className="lockscreen-date">{dateString}</span>
          <span className={`lockscreen-clock font-${fontStyle}`}>{time}</span>
        </div>

        {/* Lockscreen Music Player Widget (Spotify / Apple Music) */}
        {music.enabled && (
          <div className="lockscreen-music-widget" data-edit-target="lock-music">
            <div className="music-widget-top">
              <img
                src={music.albumArt || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80"}
                alt=""
                className="music-widget-album"
              />
              <div className="music-widget-info">
                <span className="music-widget-title">{music.title || "Penjaga Hati"}</span>
                <span className="music-widget-artist">{music.artist || "Nadhif Basalamah"}</span>
              </div>
            </div>

            <div className="music-widget-progress-bar">
              <div className="music-progress-track">
                <div className="music-progress-fill" style={{ width: `${Math.max(0, Math.min(100, Number(music.progressPercent ?? 38)))}%` }} />
              </div>
              <div className="music-widget-times">
                <span>{music.progress || "1:24"}</span>
                <span>-{music.duration || "3:42"}</span>
              </div>
            </div>

            <div className="music-widget-controls">
              <SkipBack size={18} fill="currentColor" />
              <Play size={20} fill="currentColor" />
              <SkipForward size={18} fill="currentColor" />
            </div>
          </div>
        )}

        {/* Stacked Notification Cards */}
        <div className="lockscreen-notifs-container">
          {notifications.map((notif) => {
            const app = notif.app || 'whatsapp';
            return (
              <div key={notif.id} className="lockscreen-notif-card" data-edit-target={`notification:${notif.id}`}>
                <div className="lockscreen-notif-header">
                  <div className="lockscreen-app-badge">
                    <div className={`lockscreen-app-icon ${app}`}>
                      {app === 'whatsapp' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
                        </svg>
                      )}
                      {app === 'twitter' && (
                        <span style={{ fontSize: '10px', fontWeight: 900 }}>𝕏</span>
                      )}
                      {app === 'instagram' && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      )}
                      {app === 'messages' && <MessageSquare size={11} />}
                    </div>
                    <span>{app === 'custom' ? (notif.appName || (english ? 'App' : 'Aplikasi')) : app === 'twitter' ? 'X' : app}</span>
                  </div>
                  <span>{notif.time || (english || slide.renderVersion === 2 ? "2m ago" : "2 mnt lalu")}</span>
                </div>

                <div className="lockscreen-notif-title">{notif.title}</div>
                <div className="lockscreen-notif-body">{notif.message}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom Shortcuts */}
        <div className="lockscreen-bottom-bar">
          <div className="lockscreen-circle-btn">
            <Flashlight size={20} />
          </div>
          <div className="lockscreen-circle-btn">
            <Camera size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
