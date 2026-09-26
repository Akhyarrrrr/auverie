// Preset data for AU Studio (Sample Stories & Characters)

export const DEFAULT_CHARACTERS = [
  {
    id: "char-reyhan",
    name: "Reyhan Arka",
    handle: "@reyarka",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
    verified: true,
    color: "#00a884"
  },
  {
    id: "char-bianca",
    name: "Bianca Val",
    handle: "@biancavall",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    verified: false,
    color: "#6366f1"
  },
  {
    id: "char-dika",
    name: "Dika Rafif",
    handle: "@dikaraf",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    verified: false,
    color: "#f59e0b"
  }
];

export const DEFAULT_GLOBAL_SETTINGS = {
  time: "23:45",
  batteryLevel: 28,
  isCharging: false,
  networkType: "5G",
  signalBars: 4,
  carrier: "Telkomsel",
  phoneModel: "iphone-island",
  theme: "dark"
};

export const SAMPLE_PROJECT = {
  id: "proj-secret-admirer",
  title: "Secret Admirer - Part 1",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  globalSettings: { ...DEFAULT_GLOBAL_SETTINGS },
  characters: [...DEFAULT_CHARACTERS],
  slides: [
    {
      id: "slide-1",
      order: 1,
      type: "lockscreen",
      title: "Layar Kunci Malam Hari",
      content: {
        dateString: "Jumat, 26 September",
        wallpaperUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        notifications: [
          {
            id: "notif-1",
            app: "whatsapp",
            title: "Reyhan Arka",
            message: "P, kamu besok ada acara ga? Mau ngomong sesuatu penting...",
            time: "23:44"
          },
          {
            id: "notif-2",
            app: "twitter",
            title: "X · Reyhan Arka",
            message: "bisa gak sih waktu diputer lagi, biar ga telat ketemu lo...",
            time: "23:30"
          },
          {
            id: "notif-3",
            app: "instagram",
            title: "Instagram · @dikaraf",
            message: "wkwk lu liat tweet si Reyhan ga barusan? 😂",
            time: "23:15"
          }
        ]
      }
    },
    {
      id: "slide-2",
      order: 2,
      type: "wa_chat",
      title: "Chat WA Reyhan & Bianca",
      content: {
        targetCharacterId: "char-reyhan",
        statusText: "online",
        messages: [
          {
            id: "m-1",
            senderId: "char-reyhan",
            text: "Ca, kamu udah tidur belum?",
            time: "23:42",
            status: "read"
          },
          {
            id: "m-2",
            senderId: "me",
            text: "Belum kok Rey, lagi ngerjain tugas kampus. Kenapa tumben jam segini ngechat?",
            time: "23:43",
            status: "read",
            reactions: ["❤️"]
          },
          {
            id: "m-3",
            senderId: "char-reyhan",
            text: "Coba dengerin ini dulu sebentar...",
            time: "23:44",
            status: "read",
            isVoiceNote: true,
            voiceDuration: "0:34"
          },
          {
            id: "m-4",
            senderId: "char-reyhan",
            text: "Lagu tadi buat kamu. Jangan lupa besok ketemu di kantin jam 1 ya.",
            time: "23:45",
            status: "read"
          }
        ]
      }
    },
    {
      id: "slide-3",
      order: 3,
      type: "x_tweet",
      title: "Tweet Curhat di X",
      content: {
        authorId: "char-reyhan",
        text: "bisa gak sih waktu diputer lagi, biar ga telat ketemu lo... #curhat #nightthoughts",
        timestamp: "11:45 PM · 26 Sep 26",
        client: "Twitter for iPhone",
        likesCount: "1,428",
        retweetsCount: "342",
        bookmarksCount: "189",
        viewsCount: "24.5K",
        mediaUrl: "",
        replies: [
          {
            id: "rep-1",
            authorId: "char-bianca",
            text: "kode buat siapa nih rey? wkwk",
            timestamp: "11:48 PM",
            likesCount: "42"
          },
          {
            id: "rep-2",
            authorId: "char-dika",
            text: "waduh mulai main kode-kodean nih anak bujang 😂",
            timestamp: "11:50 PM",
            likesCount: "19"
          }
        ]
      }
    },
    {
      id: "slide-4",
      order: 4,
      type: "ig_dm",
      title: "Instagram DM Reaction",
      content: {
        targetCharacterId: "char-bianca",
        messages: [
          {
            id: "ig-m1",
            senderId: "char-bianca",
            text: "Rey, story gitar kamu tadi keren banget lagunya! Siapa yg nyiptain?",
            time: "23:50"
          },
          {
            id: "ig-m2",
            senderId: "me",
            text: "Hehe makasih Ca, ada seseorang yang bikin inspirasinya dapet banget barusan :p",
            time: "23:51",
            reactions: ["❤️"]
          },
          {
            id: "ig-m3",
            senderId: "char-bianca",
            text: "Ihh siapa tuhh? Bocorin dongg!",
            time: "23:52"
          }
        ],
        seenText: "Dilihat 2 menit yang lalu"
      }
    }
  ]
};
