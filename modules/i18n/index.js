import Polyglot from 'node-polyglot'
import localePhrases from './locales.json'

const FALLBACK_LOCALE = 'en'

const fmtLangId = (langid) => {
  // Remove the country suffix from language ids.
  // Eg: EN-US; EN-ID, FR-CA, fr-fr -> en; en; fr; fr
  return langid.toLowerCase().split('-')[0]
}

export const navigator = {
  get defaultLocale () {
    return fmtLangId(window.navigator.language)
  },
  get locales () {
    return window.navigator.languages.map(fmtLangId)
  },
}

export const i18n = {
  get locale () {
    try {
      return JSON.parse(window.localStorage.getItem('pref.lang')) || navigator.defaultLocale
    } catch {
      return navigator.defaultLocale
    }
  },

  _ensurePolyglot () {
    if (this.polyglot) {
      return
    }
    let phrases = localePhrases[this.locale]
    if (!phrases) {
      phrases = localePhrases[FALLBACK_LOCALE]
    }
    this.polyglot = new Polyglot({
      phrases,
      interpolation: { prefix: '{{', suffix: '}}' },
    })
  },

  context (prefix) {
    return (key, subs) => {
      return this.t(`${prefix}.${key}`, subs)
    }
  },

  t (key, subs) {
    this._ensurePolyglot()
    return this.polyglot.t(key, subs)
  },
}

