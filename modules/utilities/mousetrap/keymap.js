/**
 * mapping of special keycodes to their corresponding keys
 *
 * everything in this dictionary cannot use keypress events
 * so it has to be here to map to the correct keycodes for
 * keyup/keydown events
 */
const _numericKeys = Array(10)
  .fill()
  .reduce((acc, _, i) => {
    // Keycode for numeric keys start from 96 for <0> through to 105 for <9>.
    const keycode = 96 + i
    return {...acc, [keycode]: `${i}`}
  }, {})

const _MAP = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del',
  91: 'meta',
  93: 'meta',
  224: 'meta',
  ..._numericKeys,
}

const _MAP_REV = Object
  .entries(_MAP)
  .reduce((acc, [k, v]) => {
    return {...acc, [v]: k}
  }, {})

// mapping for special characters
const _SYMBOL_MAP = {
  106: '*',
  107: '+',
  109: '-',
  110: '.',
  111 : '/',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: '\'',
}

/**
 * this is a mapping of keys that require shift on a US keypad
 * back to the non shift equivelents
 *
 * this is so you can use keyup events with these keys
 *
 * note that this will only work reliably on US keyboards
 */
const _SHIFT_MAP = {
  '~': '`',
  '!': '1',
  '@': '2',
  '#': '3',
  '$': '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  '_': '-',
  '+': '=',
  ':': ';',
  '"': '\'',
  '<': ',',
  '>': '.',
  '?': '/',
  '|': '\\',
}

/**
 * this is a list of special strings you can use to map
 * to modifier keys when you specify your keyboard shortcuts
 */
const _SPECIAL_ALIASES = {
  'option': 'alt',
  'command': 'meta',
  'return': 'enter',
  'escape': 'esc',
  'plus': '+',
  'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl',
}

export default {
  SHIFTED: _SHIFT_MAP,
  ALIASES: _SPECIAL_ALIASES,
  SYMBOLS: _SYMBOL_MAP,
  KEYS: _MAP,
  KEYS_R: _MAP_REV,
}
