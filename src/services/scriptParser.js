export function parseChatScript(scriptText, existingCharacters = [], options = {}) {
  const { platformType = 'wa_chat', startTime = '23:40' } = options;
  const lines = scriptText.split(/\r?\n/);
  const messages = [];
  const newCharacters = [];
  const invalidLines = [];
  let minute = /^(\d{1,2}):(\d{2})$/.test(startTime)
    ? Number(startTime.split(':')[0]) * 60 + Number(startTime.split(':')[1]) : 23 * 60 + 40;

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) { invalidLines.push({ line: index + 1, text: line }); return; }
    const speaker = match[1].trim();
    const value = match[2].trim();
    if (!speaker || !value) { invalidLines.push({ line: index + 1, text: line }); return; }
    const name = speaker.toLocaleLowerCase();
    let senderId = 'me';
    if (!['aku', 'saya', 'me'].includes(name)) {
      let character = [...existingCharacters, ...newCharacters].find(item =>
        item.name.toLocaleLowerCase() === name || item.handle.toLocaleLowerCase().replace(/^@/, '') === name.replace(/^@/, ''));
      if (!character) {
        character = { id: crypto.randomUUID(), name: speaker, handle: '@' + name.replace(/\W+/g, ''),
          avatar: existingCharacters[0]?.avatar || '', verified: false };
        newCharacters.push(character);
      }
      senderId = character.id;
    }
    const voice = value.match(/^\[vn:(\d{1,2}:\d{2})\]$/i);
    const time = String(Math.floor((minute % 1440) / 60)).padStart(2, '0') + ':' + String(minute % 60).padStart(2, '0');
    messages.push({ id: crypto.randomUUID(), senderId, text: voice && platformType.startsWith('wa_') ? '' : value, time,
      status: 'read', isVoiceNote: !!voice && platformType.startsWith('wa_'), voiceDuration: voice?.[1] });
    minute++;
  });
  const other = messages.find(item => item.senderId !== 'me');
  return { messages, newCharacters, invalidLines, targetCharacterId: other?.senderId || existingCharacters[0]?.id || null };
}

// Heights come from the rendered phone preview, not an estimated character count.
export function paginateByHeight(messages, heights, availableHeight) {
  if (messages.length !== heights.length || availableHeight <= 0) throw new Error('Ukuran pratinjau belum siap.');
  const pages = [];
  const oversized = [];
  let page = [];
  let used = 0;
  messages.forEach((message, index) => {
    const height = heights[index];
    if (height > availableHeight) oversized.push(index + 1);
    if (page.length && used + height > availableHeight) {
      pages.push(page);
      page = [];
      used = 0;
    }
    page.push(message);
    used += height;
  });
  if (page.length) pages.push(page);
  return { pages, oversized };
}
