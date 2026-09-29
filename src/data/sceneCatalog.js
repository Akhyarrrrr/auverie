// Screen names are shared by the picker, inspector, simulator and renderer.
export const SCENE_APPS = [
  { id: 'whatsapp', name: 'WhatsApp', accent: '#25d366', screens: ['chat', 'group', 'inbox', 'info', 'status', 'calls', 'call', 'media'] },
  { id: 'instagram', name: 'Instagram', accent: '#d62976', screens: ['chat', 'group', 'inbox', 'requests', 'profile', 'feed', 'post', 'comments', 'story', 'notes', 'reel', 'notifications', 'call', 'media', 'instant'] },
  { id: 'facebook', name: 'Facebook', accent: '#0866ff', screens: ['feed', 'profile', 'post', 'group_feed', 'album', 'comments', 'story', 'reel', 'notifications', 'media'] },
  { id: 'messenger', name: 'Messenger', accent: '#0866ff', screens: ['chat', 'group', 'inbox', 'requests', 'info', 'album', 'media', 'story', 'notes', 'calls', 'call'] },
  { id: 'x', name: 'X', accent: '#1d9bf0', screens: ['post', 'thread', 'feed', 'profile', 'comments', 'notifications', 'inbox', 'requests', 'chat', 'group', 'info', 'media', 'call'] },
  { id: 'messages', name: 'iMessage / SMS', accent: '#007aff', screens: ['chat', 'group', 'inbox', 'info', 'media'] },
  { id: 'telegram', name: 'Telegram', accent: '#3390ec', screens: ['chat', 'group', 'channel', 'inbox', 'profile', 'info', 'album', 'media', 'story', 'calls', 'call'] },
  { id: 'line', name: 'LINE', accent: '#06c755', screens: ['chat', 'group', 'inbox', 'profile', 'info', 'album', 'media', 'calls', 'call'] },
  { id: 'tiktok', name: 'TikTok', accent: '#fe2c55', screens: ['reel', 'profile', 'comments', 'inbox', 'chat', 'notifications', 'media'] },
  { id: 'spotify', name: 'Spotify', accent: '#1ed760', screens: ['player', 'playlist', 'album', 'profile', 'queue', 'lyrics', 'share', 'inbox', 'chat', 'group'] },
  { id: 'notes', name: 'Catatan / narasi', accent: '#e4af0a', screens: ['note', 'note_list'] },
  { id: 'phone', name: 'Telepon', accent: '#34c759', screens: ['calls', 'contacts', 'info', 'call'] },
];

export const SCREEN_LABELS = {
  chat: 'Percakapan', group: 'Percakapan grup', channel: 'Kanal', inbox: 'Daftar chat', requests: 'Permintaan pesan',
  info: 'Info kontak / grup', status: 'Status', calls: 'Riwayat panggilan', call: 'Layar panggilan', media: 'Penampil media',
  profile: 'Profil', feed: 'Feed', post: 'Postingan', thread: 'Utas', group_feed: 'Postingan grup', comments: 'Komentar / balasan',
  story: 'Story', notes: 'Notes', reel: 'Video / Reels diam', notifications: 'Notifikasi', album: 'Album', instant: 'Instants',
  player: 'Now Playing', playlist: 'Playlist', queue: 'Antrean', lyrics: 'Lirik', share: 'Berbagi lagu',
  note: 'Catatan', note_list: 'Daftar catatan', contacts: 'Kontak',
};
export const SCREEN_LABELS_EN = { chat: 'Conversation', group: 'Group chat', channel: 'Channel', inbox: 'Chats', requests: 'Message requests',
  info: 'Contact / group info', status: 'Status', calls: 'Calls', call: 'Call', media: 'Media', profile: 'Profile', feed: 'Home', post: 'Post', thread: 'Thread',
  group_feed: 'Group', comments: 'Comments', story: 'Story', notes: 'Notes', reel: 'Reels', notifications: 'Notifications', album: 'Album', instant: 'Instants',
  player: 'Now Playing', playlist: 'Playlist', queue: 'Queue', lyrics: 'Lyrics', share: 'Share song', note: 'Note', note_list: 'Notes', contacts: 'Contacts' };

const LEGACY = {
  wa_chat: ['whatsapp', 'chat'], wa_group: ['whatsapp', 'group'], x_tweet: ['x', 'post'], x_thread: ['x', 'thread'],
  x_dm: ['x', 'chat'], ig_dm: ['instagram', 'chat'], ig_post: ['instagram', 'post'], ig_story: ['instagram', 'story'],
};
export function sceneIdentity(slide) {
  const legacy = LEGACY[slide?.type];
  return { app: slide?.content?.app || legacy?.[0], screen: slide?.sceneState?.screen || slide?.content?.screen || legacy?.[1] };
}
export const appDefinition = app => SCENE_APPS.find(item => item.id === app);
export const isConversation = screen => ['chat', 'group', 'channel'].includes(screen);

export const MESSAGE_LABELS = { text: 'Teks', image: 'Foto', album: 'Album', video: 'Poster video', sticker: 'Stiker', gif: 'GIF diam',
  voice: 'Voice note', deleted: 'Pesan dihapus', system: 'Kejadian / pemisah', document: 'Dokumen', contact: 'Kontak',
  location: 'Lokasi', link: 'Tautan', poll: 'Polling', music: 'Musik', post: 'Bagikan postingan' };
const MEDIA = ['text', 'image', 'album', 'video', 'sticker', 'gif', 'voice', 'deleted', 'system', 'link', 'post'];
export const MESSAGE_KINDS = {
  whatsapp: [...MEDIA, 'document', 'contact', 'location', 'poll'], telegram: [...MEDIA, 'document', 'contact', 'location', 'poll', 'music'],
  line: [...MEDIA, 'document', 'contact', 'location'], messenger: [...MEDIA, 'document', 'poll', 'music'],
  instagram: [...MEDIA, 'music', 'poll'], x: [...MEDIA, 'document'], messages: [...MEDIA, 'document', 'contact', 'location'],
  tiktok: ['text', 'image', 'sticker', 'gif', 'system', 'post'], spotify: ['text', 'music', 'system'],
};
export function messageKind(message) {
  return message.kind || message.mediaKind || (MESSAGE_LABELS[message.type] ? message.type : null)
    || (message.isDeleted ? 'deleted' : message.isVoiceNote ? 'voice' : message.isSticker || message.stickerUrl ? 'sticker'
      : message.isVideo ? 'video' : message.isGif ? 'gif' : message.images?.length ? 'album' : message.mediaUrl || message.imageUrl ? 'image' : 'text');
}
export function sceneDefaults(app, screen, project) {
  const person = project.characters?.[0];
  return {
    app, screen, targetCharacterId: person?.id, authorId: person?.id, groupTitle: 'Teman dekat',
    statusText: 'online', title: app === 'notes' ? 'Hal yang belum sempat kukatakan' : 'Malam ini',
    text: '', caption: '', bio: person?.bio || '', location: '', timestamp: project.globalSettings?.time || '21:30',
    messages: [], posts: [], comments: [], contacts: [], notifications: [], tracks: [], notes: [], images: [],
    followersCount: '248', followingCount: '183', likesCount: '24', viewsCount: '312', repliesCount: '3', retweetsCount: '2',
    song: 'Malam yang sama', artist: 'Ruang cerita', duration: '3:42', progress: '1:24', progressPercent: 38,
    callStatus: 'incoming', callKind: 'voice', callDuration: '00:24', unreadCount: 0, dateLabel: 'Hari ini',
    draftText: '', showKeyboard: false, keyboardProfile: 'auto', keyboardMode: 'letters', keyboardSuggestions: [],
  };
}
