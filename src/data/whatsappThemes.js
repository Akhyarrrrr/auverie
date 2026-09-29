export const WHATSAPP_THEMES = [
  ['classic', 'Asli WhatsApp'],
  ['ocean', 'Biru seperti contoh'],
  ['violet', 'Ungu'],
  ['rose', 'Merah muda'],
  ['custom', 'Warna sendiri']
];

const palettes = {
  classic: {
    dark: ['#0b141a', '#202c33', '#005c4b', '#202c33', '#00a884', '#2a3942'],
    light: ['#efeae2', '#ffffff', '#d9fdd3', '#f0f2f5', '#008069', '#ffffff']
  },
  ocean: {
    dark: ['#03070b', '#292b2d', '#075782', '#22272b', '#1597ed', '#393b3d'],
    light: ['#e9f1f8', '#ffffff', '#d8edff', '#f6f9fc', '#007aff', '#ffffff']
  },
  violet: {
    dark: ['#100d18', '#2d2837', '#604897', '#252130', '#a48bf5', '#353040'],
    light: ['#f2eef9', '#ffffff', '#e8ddff', '#faf8ff', '#7558b8', '#ffffff']
  },
  rose: {
    dark: ['#180e13', '#342930', '#8e4669', '#2b2429', '#f48db7', '#3b3037'],
    light: ['#f9eef2', '#ffffff', '#ffe0ec', '#fff8fa', '#b44c79', '#ffffff']
  }
};

export function whatsappColors(content, theme) {
  const [background, incoming, outgoing, header, accent, input] =
    (palettes[content.chatPalette] || palettes.classic)[theme] || palettes.classic.dark;
  return {
    '--wa-background': content.backgroundColor || background,
    '--wa-incoming': content.incomingColor || incoming,
    '--wa-outgoing': content.outgoingColor || outgoing,
    '--wa-header': content.headerColor || header,
    '--wa-accent': content.accentColor || accent,
    '--wa-input': content.inputColor || input,
    '--wa-outgoing-text': content.outgoingTextColor || (theme === 'light' ? '#111b21' : '#f4f7f8'),
    '--wa-incoming-text': content.incomingTextColor || (theme === 'light' ? '#111b21' : '#f4f7f8'),
    '--wa-header-text': content.headerTextColor || (theme === 'light' ? '#111b21' : '#f4f7f8'),
    '--wa-input-text': content.inputTextColor || (theme === 'light' ? '#111b21' : '#f4f7f8')
  };
}
