import { isConversation, MESSAGE_KINDS } from './sceneCatalog.js';

const SOCIAL_APPS = ['instagram', 'facebook', 'x', 'tiktok'];
const POST_SCREENS = ['feed', 'post', 'thread', 'group_feed', 'comments'];
const STORY_SCREENS = ['story', 'status', 'instant'];
export const INBOX_FILTERS = [['all', 'All', 'Semua'], ['unread', 'Unread', 'Belum dibaca'], ['favorites', 'Favorites', 'Favorit'], ['groups', 'Groups', 'Grup']];

export function sceneCapabilities(app, screen, content = {}, state = {}) {
  const chat = isConversation(screen), story = STORY_SCREENS.includes(screen);
  const social = POST_SCREENS.includes(screen), profile = ['profile', 'info'].includes(screen);
  const music = app === 'spotify' && ['player', 'share', 'lyrics', 'playlist', 'album', 'queue'].includes(screen);
  const album = screen === 'album' && app !== 'spotify', viewer = screen === 'media', reel = screen === 'reel';
  const list = ['inbox', 'requests', 'contacts', 'calls'].includes(screen);
  const media = story || viewer || reel || album;
  const composer = chat || story || screen === 'comments';
  const overlays = [['', 'Tidak ada']];
  if (chat) {
    if (content.messages?.length) overlays.push(['message-menu', 'Menu pesan']);
    overlays.push(['attachments', 'Lampiran'], ['stickers', 'Tray stiker / emoji']);
  }
  if (app === 'facebook' && social) overlays.push(['facebook-reactions', 'Pemilih reaksi']);
  if (app === 'phone' && screen === 'call') overlays.push(['dialpad', 'Keypad panggilan']);
  const screenMenu = !['note_list', 'contacts', 'requests', 'calls', 'post', 'thread', 'group_feed', 'comments', 'reel', 'notifications', 'call'].includes(screen);
  if (screenMenu) overlays.push(['screen-menu', 'Menu layar'], ['share', 'Bagikan']);
  const postKinds = ['text', 'image', 'album', 'video', 'gif'];
  const mediaKinds = album ? ['album'] : story ? ['image', 'video', 'album'] : reel ? ['video', 'image', 'album']
    : viewer ? ['image', 'video', 'album', 'gif', 'sticker'] : social || profile && ['facebook', 'x'].includes(app) ? postKinds : MESSAGE_KINDS[app] || ['text', 'image'];
  const metrics = app === 'x' ? ['likesCount', 'repliesCount', 'retweetsCount', ...(screen !== 'feed' && screen !== 'profile' ? ['viewsCount'] : [])]
    : app === 'facebook' ? ['likesCount', 'repliesCount', 'sharesCount'] : ['likesCount', 'repliesCount'];
  const labels = {
    ...(chat ? { today: 'Pemisah hari', typing: 'Indikator mengetik', message: 'Placeholder pesan', read: 'Label dilihat', edited: 'Diedit', forwarded: 'Diteruskan', unread: 'Belum dibaca' } : {}),
    ...(screen === 'comments' ? { likes: 'Suka', reply: 'Balasan' } : {}),
    ...(social ? { likes: 'Suka' } : {}),
    ...(profile && SOCIAL_APPS.includes(app) ? { posts: 'Postingan', followers: 'Pengikut', following: 'Mengikuti' } : {}),
    ...(story ? { replyTo: 'Membalas kepada', ...(content.questionSticker?.enabled ? { answer: 'Jawaban' } : {}) } : {}),
    ...(state.overlay ? { menu: 'Menu', ...(state.overlay === 'stickers' ? { stickers: 'Stiker' } : {}) } : {}),
  };
  const colors = screen === 'call' || reel ? [] : story || viewer ? ['backgroundColor', 'accentColor']
    : ['backgroundColor', 'headerColor', 'headerTextColor', 'accentColor', 'textColor', 'mutedColor', 'lineColor'];
  if (chat) colors.push('incomingColor', 'incomingTextColor', 'outgoingColor', 'outgoingTextColor');
  if (chat) colors.push('inputColor', 'inputTextColor');
  if (composer && content.showKeyboard) colors.push('keyboardBackground', 'keyboardKeyColor', 'keyboardTextColor');
  return {
    chat, story, social, profile, music, album, viewer, reel, media, composer, list, mediaKinds, overlays, metrics, labels, colors,
    socialProfile: profile && SOCIAL_APPS.includes(app),
    profileCover: profile && ['facebook', 'x', 'line'].includes(app),
    profileImages: profile && ['instagram', 'tiktok'].includes(app),
    profilePosts: profile && ['facebook', 'x'].includes(app),
    members: screen === 'info' || chat && ['group', 'channel'].includes(screen),
    inboxFilters: screen === 'inbox' && ['whatsapp', 'messenger'].includes(app),
    comments: screen === 'comments',
    posts: social && ['feed', 'group_feed'].includes(screen),
    hd: (chat || viewer) && ['whatsapp', 'messenger', 'telegram', 'line', 'messages'].includes(app),
    once: (chat || viewer) && ['whatsapp', 'instagram', 'messenger', 'telegram'].includes(app),
    wallpaper: chat,
    messageMenu: chat && state.overlay === 'message-menu' && !!content.messages?.length,
    mainPerson: !['contacts', 'calls', 'notifications', 'note_list', 'queue', 'lyrics', 'playlist', 'album'].includes(screen) || album,
  };
}

export function contactFields(screen) {
  if (screen === 'info') return [['name', 'Nama anggota']];
  if (screen === 'contacts') return [['name', 'Nama kontak'], ['phoneNumber', 'Nomor telepon', 'tel']];
  if (screen === 'calls') return [['name', 'Nama kontak'], ['time', 'Waktu panggilan (HH:mm)', 'clock'], ['duration', 'Durasi panggilan']];
  return [['name', 'Nama khusus'], ['text', 'Pratinjau pesan'], ['time', 'Waktu chat (HH:mm)', 'clock'], ['unread', 'Jumlah pesan belum dibaca', 'integer']];
}

export function validOverlay(app, screen, content, state) {
  const capabilities = sceneCapabilities(app, screen, content, state);
  const overlay = state?.overlay === 'chat-menu' ? 'screen-menu' : state?.overlay;
  return capabilities.overlays.some(([key]) => key === overlay) ? overlay : null;
}
