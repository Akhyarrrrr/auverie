// Quick Script-to-Chat Converter with Smart Auto-Paging

export function parseChatScript(scriptText, existingCharacters = [], options = {}) {
  const {
    messagesPerSlide = 5,
    platformType = "wa_chat",
    defaultTargetCharId = null
  } = options;

  const lines = scriptText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const parsedMessages = [];
  const newlyDiscoveredCharacters = [];

  let currentTimeMinute = 40;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check format: "Name: message text"
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) continue;

    const rawSpeaker = match[1].trim();
    const rawText = match[2].trim();

    // Determine sender ID
    let senderId = "me";
    const lowerSpeaker = rawSpeaker.toLowerCase();

    if (lowerSpeaker === "me" || lowerSpeaker === "aku" || lowerSpeaker === "saya") {
      senderId = "me";
    } else {
      // Find in existing characters
      const found = existingCharacters.find(
        c => c.name.toLowerCase() === lowerSpeaker || c.handle.toLowerCase() === lowerSpeaker || c.handle.toLowerCase() === `@${lowerSpeaker}`
      );

      if (found) {
        senderId = found.id;
      } else {
        // Find if already discovered in this script
        let discovered = newlyDiscoveredCharacters.find(c => c.name.toLowerCase() === lowerSpeaker);
        if (!discovered) {
          const cleanHandle = lowerSpeaker.replace(/\s+/g, '');
          discovered = {
            id: `char-${Date.now()}-${newlyDiscoveredCharacters.length}`,
            name: rawSpeaker,
            handle: `@${cleanHandle}`,
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanHandle}`,
            verified: false
          };
          newlyDiscoveredCharacters.push(discovered);
        }
        senderId = discovered.id;
      }
    }

    // Voice note check: [vn:0:24]
    const vnMatch = rawText.match(/^\[vn:?(\d+:\d+)?\]$/i);
    const isVoiceNote = !!vnMatch;
    const voiceDuration = vnMatch && vnMatch[1] ? vnMatch[1] : "0:24";

    // Format minute time string
    const timeStr = `23:${String(currentTimeMinute).padStart(2, '0')}`;
    if (i % 2 === 1) currentTimeMinute++;

    parsedMessages.push({
      id: `m-script-${Date.now()}-${i}`,
      senderId,
      text: isVoiceNote ? "" : rawText,
      time: timeStr,
      status: "read",
      isVoiceNote,
      voiceDuration
    });
  }

  // Determine main target character for 1-on-1 chats
  const otherChar = parsedMessages.find(m => m.senderId !== "me");
  const targetCharacterId = otherChar ? otherChar.senderId : (defaultTargetCharId || (existingCharacters[0]?.id || "char-reyhan"));

  // Auto-Paging: Chunk messages into slides of max `messagesPerSlide`
  const slides = [];
  for (let i = 0; i < parsedMessages.length; i += messagesPerSlide) {
    const chunk = parsedMessages.slice(i, i + messagesPerSlide);
    const slideNumber = Math.floor(i / messagesPerSlide) + 1;
    
    slides.push({
      id: `slide-script-${Date.now()}-${slideNumber}`,
      order: slideNumber,
      type: platformType,
      title: `Chat Part ${slideNumber}`,
      content: {
        targetCharacterId,
        statusText: "online",
        messages: chunk
      }
    });
  }

  return {
    slides,
    newCharacters: newlyDiscoveredCharacters
  };
}
