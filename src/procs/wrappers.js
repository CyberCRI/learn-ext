// Utility toolbelt for webext APIs.
import { browser } from '~procs/stubs'
import { context, Runtime } from '~mixins/utils'
import _ from 'lodash'


export const i18n = (key, subs) => {
  // Return localised string from locale file.
  // Note that this only works in context of the extension. Hence it should not
  // be used elsewhere outside extension process.
  //
  // We'll use template strings in lodash for substitutions.
  //
  // [NOTES]
  // Additionally, this function transforms the key so "dot syntax" is valid.
  // Essentially, by using yaml locale files, we are able to group messages
  // together (check Readme in assets/locales).
  if (context() === Runtime.extension) {
    const msg = browser.i18n.getMessage(key.replace(/\./g, '_'))
    return _.template(msg)(subs)
  } else {
    return key.split('.').slice(-1)
  }
}
