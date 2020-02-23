import Polyglot from 'node-polyglot'
import localePhrases from './locales.json'

import { LocalStorage } from '@ilearn/modules/mixins'

const FALLBACK_LOCALE = 'en'
const AVAILABLE_LOCALES = ['en', 'fr', 'hi', 'zh']

export const i18n = {
  _ensurePolyglot () {
    if (this.polyglot) {
      return
    }

    this.polyglot = new Polyglot({
      interpolation: { prefix: '{{', suffix: '}}' },
    })

    this.locale = (() => {
      return LocalStorage.get('pref.lang', FALLBACK_LOCALE)
    })()


    let phrases = localePhrases[this.locale]
    if (!phrases) {
      phrases = localePhrases[FALLBACK_LOCALE]
    }
    this.polyglot.replace(phrases)

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
