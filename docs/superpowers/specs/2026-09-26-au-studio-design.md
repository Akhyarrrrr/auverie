# AU Studio (AURA) - Technical Design Document

**Date**: 2026-09-26  
**Status**: Approved by User  
**Target Deployment**: Vercel & GitHub Repository  

---

## 1. Overview & Problem Statement
AU (Alternate Universe) creators on TikTok, X (Twitter), and Instagram currently spend hours creating stories using fragmented tools (Tweetgen, fake chat generators, screenshotting, cropping, stitching in CapCut). 

**AU Studio** is an all-in-one web workstation for AU authors that provides:
- **Central Character Roster**: Reusable character profiles (avatars, display names, handles, verified badges). Editing a character instantly updates all corresponding mockups across WhatsApp, Twitter, and Instagram.
- **Synchronized Device State**: Global phone status bar (clock time, battery percentage, carrier, WiFi/cellular signals, dark/light mode) keeping timeline consistency across slides.
- **Pixel-Perfect Platform Mockups**:
  1. **WhatsApp**: 1-on-1 chats, group chats, voice notes with waveforms, message status (sent/delivered/read), emoji reactions, image attachments, custom wallpaper.
  2. **Twitter / X**: Single tweets, reply threads, quote tweets, Twitter DMs, verified badges, metrics (reposts, likes, bookmarks, views).
  3. **Instagram**: Direct messages (DM) with seen indicator, reaction hearts, and feed posts with captions & comments.
  4. **iPhone Lockscreen**: iOS clock, date, custom lockscreen wallpaper, stacked push notifications from WhatsApp, Twitter, Instagram.
- **Hybrid Creator Workflow**:
  - **Quick Script-to-Chat Converter**: Parse plain text scripts into formatted multi-speaker chats.
  - **Live Visual Inspector (WYSIWYG)**: Click directly on messages or slide elements to edit text, timestamps, senders, and attachments.
  - **Auto-Paging Support**: Easily split long dialogues into consecutive slides.
- **High-Res Batch Exporter**:
  - Export single slide or entire project as a ZIP bundle of crisp 2x/3x PNGs sized for TikTok Slides (9:16 - 1080x1920) or Twitter/Instagram (1:1 / 4:5).
  - 1-click "Copy Image to Clipboard" for instant workflow.
- **Offline & Local Persistence**:
  - Project auto-saving via IndexedDB (handles high-res images without local storage limits).
  - Import/Export project files (`.aujson`) for backup and sharing.

---

## 2. Architecture & Technology Stack
- **Framework**: React 19 + Vite (JavaScript/JSX or TypeScript).
- **Styling**: Vanilla CSS with modern CSS Custom Properties, Glassmorphism UI tokens, dark studio workspace theme, and accurate platform typography (SF Pro / Segoe / Chirp equivalents).
- **State Management & Persistence**:
  - React State + Context for active project and editor session.
  - IndexedDB for storing projects, avatars, wallpapers, and slide assets.
- **DOM to High-Res Image Rendering**:
  - `html-to-image` (configured with `pixelRatio: 2` or `3` for crisp retina export, preserving emoji and SVG icons).
- **Packaging & Archiving**:
  - `jszip` + `file-saver` for client-side zero-latency batch ZIP download.
- **Icons**:
  - `lucide-react` for studio controls + embedded SVG vector icons for WhatsApp, X, and Instagram.
- **Deployment**:
  - Static SPA deployable to Vercel with `vercel.json` rewrites and zero server maintenance costs.

---

## 3. Data Schema

### 3.1 Project Schema
```typescript
interface AUProject {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  globalSettings: GlobalDeviceSettings;
  characters: Character[];
  slides: Slide[];
}

interface GlobalDeviceSettings {
  time: string;           // e.g. "23:45"
  batteryLevel: number;   // 1 - 100
  isCharging: boolean;
  networkType: "WiFi" | "5G" | "4G" | "LTE";
  signalBars: number;     // 1 - 4
  carrier: string;        // e.g. "Telkomsel", "Indosat"
  phoneModel: "iphone-island" | "iphone-notch" | "android";
  theme: "dark" | "light";
}

interface Character {
  id: string;
  name: string;           // e.g. "Reyhan Arka"
  handle: string;         // e.g. "@reyarka"
  avatar: string;         // base64 / blob URL / default svg
  verified?: boolean;     // blue tick
  color?: string;         // sender bubble accent
}
```

### 3.2 Slide Schema
```typescript
type SlideType = 
  | "wa_chat" 
  | "wa_group" 
  | "x_tweet" 
  | "x_dm" 
  | "ig_dm" 
  | "ig_post" 
  | "lockscreen";

interface Slide {
  id: string;
  order: number;
  type: SlideType;
  title?: string;
  customSettings?: Partial<GlobalDeviceSettings>; // optional per-slide override
  content: 
    | WAChatContent 
    | XTweetContent 
    | XDMContent 
    | IGDMContent 
    | IGPostContent 
    | LockscreenContent;
}

interface ChatMessage {
  id: string;
  senderId: string;       // matches Character.id ("me" or character ID)
  text: string;
  time: string;           // e.g. "23:46"
  status?: "sent" | "delivered" | "read";
  mediaUrl?: string;      // image attachment
  isVoiceNote?: boolean;
  voiceDuration?: string; // e.g. "0:24"
  reactions?: string[];   // e.g. ["❤️", "😂"]
}

interface WAChatContent {
  targetCharacterId: string;
  statusText?: string;    // "online", "typing...", or "last seen today at 22:15"
  messages: ChatMessage[];
  customWallpaper?: string;
}

interface XTweetContent {
  authorId: string;
  text: string;
  timestamp: string;      // e.g. "11:45 PM · Sep 26, 2026"
  client: string;         // e.g. "Twitter for iPhone"
  likesCount: string;
  retweetsCount: string;
  bookmarksCount: string;
  viewsCount: string;
  mediaUrl?: string;
  replyToHandle?: string;
  replies?: Array<{
    id: string;
    authorId: string;
    text: string;
    timestamp: string;
    likesCount: string;
  }>;
}

interface LockscreenContent {
  wallpaperUrl?: string;
  dateString?: string;    // e.g. "Friday, September 26"
  notifications: Array<{
    id: string;
    app: "whatsapp" | "twitter" | "instagram" | "messages";
    title: string;        // e.g. "Reyhan Arka"
    message: string;      // e.g. "P, kamu udah sampe kosan belum?"
    time: string;         // e.g. "2m ago" or "23:45"
  }>;
}
```

---

## 4. UI/UX Layout Specification
The studio interface is divided into 4 key zones:
1. **Top Navigation Bar**:
   - Project Title (editable inline)
   - Story presets selector (sample template AU to test immediately)
   - Save / Load `.aujson`
   - High-Res Batch Export button (ZIP) & Single Slide Export
   - Dark/Light studio mode toggle
2. **Left Sidebar - Characters & Device Settings**:
   - Tab 1: **Characters** (add, edit avatar, manage names & handles)
   - Tab 2: **Device Bar** (clock, battery slider, wifi/carrier, theme)
   - Tab 3: **Quick Script** (write raw script and convert to chat slides)
3. **Center Canvas - Interactive Phone Mockup**:
   - High-fidelity phone frame with Dynamic Island / Notch
   - Live editable components (click to change text, add bubble, add reaction)
   - Quick floating controls (Copy as Image, Duplicate Slide, Delete Slide)
4. **Bottom Storyboard Bar**:
   - Slide thumbnail strip showing all slides in sequence (Slide 1, Slide 2, Slide 3...)
   - Add new slide (+ WhatsApp, + Twitter, + Instagram, + Lockscreen)
   - Drag/reorder slides easily

---

## 5. Verification & Testing Strategy
1. **Fidelity Verification**:
   - Test WhatsApp dark and light themes with realistic bubble tails, timestamps, and checkmarks.
   - Test X/Twitter single tweets and reply chains with real metric format (1.2K, 45, etc.).
   - Test Instagram DMs with sender/receiver styles and heart reactions.
   - Test Lockscreen notification grouping.
2. **Batch Export Testing**:
   - Generate multi-slide project (5+ slides across WA, X, IG, Lockscreen).
   - Trigger ZIP export and verify all PNG files are downloaded properly, sharp, and properly numbered.
   - Test 1-click clipboard copy.
3. **Data Integrity Testing**:
   - Add custom characters and verify avatar persistence in IndexedDB.
   - Export `.aujson` and import it back to confirm lossless project restore.
4. **Build & Production Readiness**:
   - `npm run build` cleanly without lint/build errors.
   - Verify static deployment assets and `vercel.json`.
