// Utility toolbelt for webext APIs.
export const i18n = (key, ...subs) => {
  // Return localised string from locale file.
  // Note that this only works in context of the extension. Hence it should not
  // be used elsewhere outside extension process.
  //
  // [NOTES]
  // Additionally, this function transforms the key so "dot syntax" is valid.
  // Essentially, by using yaml locale files, we are able to group messages
  // together (check Readme in assets/locales).

  return browser.i18n.getMessage(key.replace(/\./g, '_'), subs)
}
