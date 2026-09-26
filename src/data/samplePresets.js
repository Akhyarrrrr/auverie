// Curated Asset Library & Templates for AU Studio

export const AESTHETIC_AVATARS = [
  { id: "av-1", name: "Reyhan (Gitaris)", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80", tag: "Cowok" },
  { id: "av-2", name: "Bianca (Artistik)", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80", tag: "Cewek" },
  { id: "av-3", name: "Dika (Sahabat)", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80", tag: "Cowok" },
  { id: "av-4", name: "Alea (Manis)", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80", tag: "Cewek" },
  { id: "av-5", name: "Gavin (Cool/Badboy)", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80", tag: "Cowok" },
  { id: "av-6", name: "Clara (Populer)", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80", tag: "Cewek" },
  { id: "av-7", name: "Rendra (Fotografer)", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80", tag: "Cowok" },
  { id: "av-8", name: "Zoya (Kpop Aesthetic)", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80", tag: "Cewek" },
  { id: "av-9", name: "Faceless Boy (Misterius)", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80", tag: "Aesthetic" },
  { id: "av-10", name: "Faceless Sunset Girl", url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=300&q=80", tag: "Aesthetic" }
];

export const AESTHETIC_WALLPAPERS = [
  { id: "wp-1", name: "Moody Rainy City", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" },
  { id: "wp-2", name: "Tokyo Neon Sunset", url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80" },
  { id: "wp-3", name: "Cloudy Purple Sky", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80" },
  { id: "wp-4", name: "Dark Minimalist Architecture", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" },
  { id: "wp-5", name: "Retro Sunset Beach", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
  { id: "wp-6", name: "Cozy Night Cafe", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80" }
];

export const PHONE_MODELS = [
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    islandType: "dynamic-island",
    bezelRadius: "52px",
    screenRadius: "44px",
    colors: [
      { id: "natural", name: "Natural Titanium", code: "#9a978f" },
      { id: "black", name: "Black Titanium", code: "#28292b" },
      { id: "desert", name: "Desert Titanium", code: "#c3a992" },
      { id: "white", name: "White Titanium", code: "#e4e4e3" }
    ]
  },
  {
    id: "iphone-14-notch",
    name: "iPhone 14 / 13 (Notch)",
    brand: "Apple",
    islandType: "classic-notch",
    bezelRadius: "48px",
    screenRadius: "40px",
    colors: [
      { id: "midnight", name: "Midnight Black", code: "#1e2229" },
      { id: "starlight", name: "Starlight White", code: "#faf7f2" },
      { id: "purple", name: "Deep Purple", code: "#4c3957" }
    ]
  },
  {
    id: "samsung-s24-ultra",
    name: "Samsung S24 Ultra",
    brand: "Samsung",
    islandType: "punch-hole-center",
    bezelRadius: "24px",
    screenRadius: "18px",
    colors: [
      { id: "titanium-gray", name: "Titanium Gray", code: "#6c6c70" },
      { id: "titanium-black", name: "Titanium Black", code: "#1a1a1c" },
      { id: "titanium-violet", name: "Titanium Violet", code: "#3e3752" }
    ]
  },
  {
    id: "frameless",
    name: "Frameless (Hanya Layar 9:16)",
    brand: "Canvas",
    islandType: "none",
    bezelRadius: "0px",
    screenRadius: "0px",
    colors: [
      { id: "none", name: "Tanpa Bezel", code: "#000000" }
    ]
  }
];

export const DEFAULT_CHARACTERS = [
  {
    id: "char-reyhan",
    name: "Reyhan Arka",
    handle: "@reyarka",
    avatar: AESTHETIC_AVATARS[0].url,
    verified: true,
    verifiedType: "blue", // "blue" | "gold" | "none"
    color: "#00a884",
    bio: "gitar & overthinking · 21"
  },
  {
    id: "char-bianca",
    name: "Bianca Val",
    handle: "@biancavall",
    avatar: AESTHETIC_AVATARS[1].url,
    verified: false,
    verifiedType: "none",
    color: "#6366f1",
    bio: "art student 🎨"
  },
  {
    id: "char-dika",
    name: "Dika Rafif",
    handle: "@dikaraf",
    avatar: AESTHETIC_AVATARS[2].url,
    verified: false,
    verifiedType: "none",
    color: "#f59e0b",
    bio: "bocah kosan no 1"
  }
];

export const DEFAULT_GLOBAL_SETTINGS = {
  time: "23:45",
  batteryLevel: 28,
  isCharging: false,
  networkType: "5G",
  signalBars: 4,
  carrier: "Telkomsel",
  phoneModel: "iphone-16-pro",
  bezelColor: "#28292b",
  theme: "dark",
  whatsappStyle: "ios", // "ios" | "android"
  lockscreenFont: "bold", // "bold" | "serif" | "modern" | "stencil"
  lockscreenMusic: {
    enabled: true,
    title: "Penjaga Hati",
    artist: "Nadhif Basalamah",
    albumArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80",
    duration: "3:42",
    progress: "1:24"
  }
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
        wallpaperUrl: AESTHETIC_WALLPAPERS[0].url,
        showMusicPlayer: true,
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
            title: "X · @reyarka",
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
        wallpaper: "doodle-dark", // "doodle-dark" | "doodle-light" | "solid" | custom url
        messages: [
          {
            id: "m-1",
            senderId: "char-reyhan",
            text: "Ca, kamu udah tidur belum?",
            time: "23:42",
            status: "read",
            hasTail: true
          },
          {
            id: "m-2",
            senderId: "me",
            text: "Belum kok Rey, lagi ngerjain tugas kampus. Kenapa tumben jam segini ngechat?",
            time: "23:43",
            status: "read",
            reactions: ["❤️"],
            hasTail: true
          },
          {
            id: "m-3",
            senderId: "char-reyhan",
            text: "Coba dengerin ini dulu sebentar...",
            time: "23:44",
            status: "read",
            isVoiceNote: true,
            voiceDuration: "0:34",
            hasTail: false
          },
          {
            id: "m-4",
            senderId: "char-reyhan",
            text: "Lagu tadi buat kamu. Jangan lupa besok ketemu di kantin jam 1 ya.",
            time: "23:45",
            status: "read",
            hasTail: true,
            replyTo: {
              senderName: "Bianca Val",
              textPreview: "Kenapa tumben jam segini ngechat?"
            }
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
        quoteTweet: {
          enabled: false
        },
        poll: {
          enabled: false
        },
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
    },
    {
      id: "slide-5",
      order: 5,
      type: "ig_story",
      title: "Instagram Story Musik Galau",
      content: {
        authorId: "char-reyhan",
        isCloseFriends: true,
        backgroundUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        caption: "malam ini dingin banget ya...",
        musicSticker: {
          song: "About You",
          artist: "The 1975"
        },
        questionSticker: {
          enabled: true,
          prompt: "Lagu apa yang lagi sering kalian dengerin tengah malem gini?"
        }
      }
    }
  ]
};

// Preset Story Packs that non-tech creators can choose in 1 click!
export const STORY_TEMPLATES = [
  {
    id: "tpl-salah-kirim",
    title: "Drama Salah Kirim WA",
    description: "Karakter berniat curhat ke teman, tapi malah salah kirim ke gebetan / musuh.",
    icon: "💬"
  },
  {
    id: "tpl-menfess-viral",
    title: "Curhat Menfess Twitter Viral",
    description: "Tweet curhat anonim yang viral dan dibalas langsung oleh orang yang dimaksud.",
    icon: "𝕏"
  },
  {
    id: "tpl-baper-ig",
    title: "Kode di Instagram Story",
    description: "Pasang lagu galau di Close Friends, lalu dia tiba-tiba reply story.",
    icon: "📸"
  },
  {
    id: "tpl-chaos-grup",
    title: "Kosan Chaos (WhatsApp Group)",
    description: "Obrolan heboh anak grup saat ada gosip baru atau ada yang ketahuan pacaran.",
    icon: "👥"
  }
];
