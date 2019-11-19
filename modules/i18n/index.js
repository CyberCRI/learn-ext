import Polyglot from 'node-polyglot'
import localePhrases from './locales.json'
import $ from 'cash-dom'

const FALLBACK_LOCALE = 'en'
const STORAGE_KEY = 'pref.lang'


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
  get prefLocale () {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    } catch {
      return navigator.defaultLocale
    }
  },
}

export const i18n = {
  get locale () {
    return $('html').attr('lang') || navigator.prefLocale
  },

  _ensurePolyglot () {
    if (!window.polyglot) {
      // We will be using a document-global object for this.
      window.polyglot = new Polyglot({
        interpolation: { prefix: '{{', suffix: '}}' },
      })
    }

    if (this.language === this.locale) {
      // If language wasn't changed, skip this.
      return
    }
    let phrases = localePhrases[this.locale]
    if (!phrases) {
      phrases = localePhrases[FALLBACK_LOCALE]
    }
    window.polyglot.replace(phrases)
    this.language = this.locale
    this.polyglot = window.polyglot

    console.log('[I] Init Polyglot with locale set to: ', this.locale)
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
