import { NativeControl, NativeIcon } from './SceneParts';

export const EMOJI_KEYS = ['😀', '🥹', '😂', '🤣', '😊', '😍', '🥰', '😘', '😭', '😅', '🤍', '❤️', '✨', '🙏', '👍', '👀', '🫶', '😎', '😔', '🤔', '🙃', '😴', '🔥', '💐'];
export default function KeyboardView({ content, platform, theme, locale = 'id', onAction }) {
  const profile = content.keyboardProfile && content.keyboardProfile !== 'auto' ? content.keyboardProfile : platform === 'ios' ? 'ios' : 'samsung';
  const mode = content.keyboardMode || 'letters';
  const caps = !!content.keyboardCaps;
  const rows = mode === 'numbers' ? ['1234567890', '-/:;()$&@"', '.,?!\'']
    : mode === 'symbols' ? ['[]{}#%^*+=', '_\\|~<>€£¥•', '.,?!\''] : ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  const key = (value, className = '', action = { type: 'key', value }) => <NativeControl key={`${action.type}:${action.value || className}`}
    className={`keyboard-key ${className}`} label={typeof value === 'string' && value ? value : className} action={action} onAction={onAction}>{value}</NativeControl>;
  return <div className={`native-keyboard keyboard-${profile} ${theme}`} data-edit-target="keyboard"
    style={{ ...(content.keyboardBackground || content.keyboardColor ? { '--key-background': content.keyboardBackground || content.keyboardColor } : {}),
      ...(content.keyboardKeyColor ? { '--key-surface': content.keyboardKeyColor } : {}),
      ...(content.keyboardTextColor ? { '--key-text': content.keyboardTextColor } : {}),
      ...(content.keyboardHeight ? { height: content.keyboardHeight } : {}) }}>
    {(profile !== 'ios' || content.keyboardSuggestions?.length > 0) && <div className="keyboard-suggestions">
      {(content.keyboardSuggestions?.length ? content.keyboardSuggestions : ['😊', locale === 'en' ? 'Okay' : 'Oke', locale === 'en' ? 'Thanks' : 'Makasih']).map(value =>
        <NativeControl key={value} label={value} action={{ type: 'suggestion', value }} onAction={onAction}>{value}</NativeControl>)}
    </div>}
    {mode === 'emoji' ? <><div className="keyboard-emoji-search">{locale === 'en' ? 'Search Emoji' : 'Cari emoji'}</div>
      <div className="keyboard-emoji-grid">{EMOJI_KEYS.map(value => key(value))}</div></>
      : <div className="keyboard-rows">{rows.map((row, i) => <div className={`keyboard-row row-${i}`} key={i}>
        {i === 2 && key(mode === 'letters' ? <NativeIcon name="up" size={25} /> : '#+=', 'special',
          { type: mode === 'letters' ? 'caps' : 'keyboard-mode', value: mode === 'symbols' ? 'numbers' : 'symbols' })}
        {[...row].map(letter => key(caps ? letter.toUpperCase() : letter))}
        {i === 2 && key(<NativeIcon name="delete" size={23} />, 'special', { type: 'delete-key' })}
      </div>)}</div>}
    <div className="keyboard-row keyboard-last-row">
      {key(mode === 'letters' ? '123' : 'ABC', 'special', { type: 'keyboard-mode', value: mode === 'letters' ? 'numbers' : 'letters' })}
      {profile !== 'ios' && key(<NativeIcon name="smile" size={22} />, 'special emoji', { type: 'keyboard-mode', value: 'emoji' })}
      {key(content.spaceLabel ?? (profile === 'ios' ? '' : locale === 'en' ? 'space' : 'spasi'), 'space', { type: 'key', value: ' ' })}
      {key(<NativeIcon name="return" size={24} />, 'special return', { type: 'key', value: '\n' })}
    </div>
    {profile === 'ios' && <div className="keyboard-ios-tools">
      <NativeControl label="Emoji" action={{ type: 'keyboard-mode', value: mode === 'emoji' ? 'letters' : 'emoji' }} onAction={onAction}>
        <svg width="29" height="29" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" />
          <g fill="var(--key-background)"><circle cx="8" cy="8" r="1.5" /><circle cx="16" cy="8" r="1.5" /><path d="M5 13h14c-1 7-13 7-14 0Z" /></g></svg>
      </NativeControl>
      <NativeControl label="Dikte" action={{ type: 'recording' }} onAction={onAction}><NativeIcon name="mic" size={27} /></NativeControl>
    </div>}
  </div>;
}
