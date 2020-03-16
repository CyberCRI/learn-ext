import queryStrings from 'query-string'
import jwtDecode, { InvalidTokenError } from 'jwt-decode'
import { Storage } from './wrappers'

const LS_TOKEN_KEY = 'auth_token'

export const clearStoredToken = async () => {
  console.warn('[!TOKEN] Removing token in Local Storage.')
  return Storage.remove(LS_TOKEN_KEY)
}

export const ensureAuthTokens = async () => {
  // This method takes care of incoming or existing auth tokens. It validates
  // the token and saves/clears them in Extension Local Storage.
  //
  // Okay, it's not a "pure" function, but same is true for javascript, so deal
  // with it.

  // Check query string. It can have three states: { empty, valid, invalid }
  const tQuery = queryStrings.parse(window.location.search)

  if (typeof tQuery.token === 'string') {
    // Decode the token if it's valid, save it to local storage. If invalid,
    // clear local storage.
    try {
      jwtDecode(tQuery.token)
      // Nice! Token is valid. Save it. Return.
      await Storage.set(LS_TOKEN_KEY, tQuery.token)
      console.log('[!TOKEN] Saved a new token via query-string.')
      // Authorized. Also saved the new token.
      return true
    } catch (e) {
      console.warn('[!TOKEN] Invalid token in query string.')
      if (e instanceof InvalidTokenError) {
        // Whoopsie? While unlikely, we care. In this case either server is
        // having a bad enough day to generate wrong token or we're getting
        // a very nice edge case. Either way, clear the local storage.
        await clearStoredToken()
      }
      // Bail early here. Verifying local storage isn't required -- we just
      // cleared it!
      return false
    }
  }

  // Alright, assume query string is empty if we reach here. Next, get the
  // token from local storage.
  const tLocalStorage = await Storage.get(LS_TOKEN_KEY)

  if (typeof tLocalStorage === 'string') {
    // We have a token here. Confirm if it's valid and assume normal flow.
    try {
      jwtDecode(tLocalStorage)
      // Authorized.
      return true
    } catch (e) {
      if (e instanceof InvalidTokenError) {
        // We have a bad token in Local Storage. Clear it. Dont even ask how. It
        // can happen (even if it hasn't, yet!).
        console.warn('[!TOKEN] Invalid token in Local Storage.')
        await clearStoredToken()
      }
    }
  }

  // Normally, we reach here if user has reset the extension, or it's a new
  // installation. Whatever the case, welcome, user!
  return false
}

export const getStoredToken = async () => {
  const token = await Storage.get('auth_token')
  const decoded = jwtDecode(token)
  return {
    authToken: token,
    email: decoded.email,
    uid: decoded.uid,
    issuer: decoded.iss,
    validAfter: decoded.nbf,
  }
}
