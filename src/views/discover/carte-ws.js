/**
 * Let's build a protocol.
 *
 * [!todo] Notes for socket RPCs refactor.
 *
 * Sharing a single websocket connection callback to each component will quickly
 * become difficult to manage, and it makes writing imperative event handlers
 * even more difficult. Consider:
 *
 *    node.on('click', (event) => {
 *      // if clicking on a concept, fetch for its portal and make portal label
 *      // red.
 *
 *      // start with registering a callback to global websocket object. It
 *      // tries to extract the portal id by some magic, and finds the portal
 *      // label which needs to turn red.
 *
 *      websocket.on('message', (data) => {
 *        // see if this message contains the information we asked for.
 *        if (this_message_is_for_me_and_contains_the_portal_id) {
 *          const node_id = magic_gimme_id_from_(data)
 *          d3.select(node_id)
 *            .attr('fill', 'red')
 *        }
 *      })
 *
 *      // now we can send a message to server and hope it gets back before
 *      // user clicked on another node.
 *      websocket.send('please make red: {event.node.id}')
 *    })
 *
 * So far so good. Now add more click, touch, zoom, update, search, event
 * handlers. We'll need to write the magical incantation to find out if the
 * message is intended for us, or for that code which turns the sea into lava?
 *
 * Obviously we can "just" break the api somehow and do more magic.
 * However, we're simple people and we just want to `await` a rpc without
 * breaking the flow. This is slightly tricky because we do not want to open
 * 15 websocket connections either.
 *
 * To keep things simple, lets work on the tricky part.
 * Consider this alternative for the event handler above:
 *
 *    import sock from 'carte-ws'
 *
 *    node.on('click', (event) => {
 *      const node_id = await sock.request({
 *        q: 'concept-to-portal',
 *        wikidata_id: event.node.id
 *      })
 *      d3.select(node_id)
 *        .attr('fill', 'red')
 *    })
 */
// import io from 'socket.io-client'
import { WebSocketURI } from './consts'

const BACKOFF_MAX_LIMIT = 500

function expectedBackoff (c) {
  // If a connection is unsuccessful, we will retry connection after a while.
  // This uses exponential backoff strategy for the delays, using standard
  // uniform backoff.
  const e = (Math.pow(2, c) - 1) / 2
  return Math.min(e, BACKOFF_MAX_LIMIT)
}


class CarteSocket {
  constructor () {
    // [!todo]: gotta make this work. Checked out fastapi-socketio discussion and its possible
    // with added benefit of long-polling fallback (we need that.)
    // this.iosock = io('/carte/sio', { path: '/carte/sio', transports: ['websocket'] })
    this._retry_count = 0
    this._callbacks = {}
    this._makeSocket()
  }

  get isConnected () {
    return this._sock && this._sock.readyState === WebSocket.OPEN
  }

  _makeSocket = () => {
    if (this._sock) {
      return
    }

    const sock = new WebSocket(WebSocketURI)
    sock.addEventListener('open', (e) => {
      console.log('[sock] Connected!')
      this._retry_count = 0
    })
    sock.addEventListener('message', (m) => this._didGetMessage(m))
    sock.addEventListener('error', (e) => {
      console.warn('[sock] Connection closed with error', e)
      console.log('[sock] Reconnecting...')
      delete this._sock
      this._makeSocket()
    })
    sock.addEventListener('close', (e) => {
      console.warn('[sock] closed. Reconnecting.', e)
      delete this._sock
      this._makeSocket()
    })
    this._sock = sock
  }

  get sock () {
    return this._sock
  }

  _didGetMessage (msg) {
    let resp
    try {
      resp = JSON.parse(msg.data)
    } catch {
      // silently eat parse errors.
      return
    }
    if (resp.q && resp.q.act) {
      const { act, ..._ } = resp.q
      this._callbacks[act](resp.r, resp.q)
    }
  }

  on = (action, callback) => {
    /**
     * Register a `callback` for an `action`.
     * There can only be one callback per action.
     */
    this._callbacks[action] = callback
    return this
  }

  emit = (act, args) => {
    /**
     * Emits an `action` with `args`.
     */
    if (!this.isConnected) {
      this._retry_count += 1
      const backoff = expectedBackoff(this._retry_count)
      console.log(`[sock] NOT connected. Retrying in ${backoff}ms.`)
      setTimeout(() => this.emit(act, args), backoff)
    } else if (typeof this._callbacks[act] === 'function') {
      const payload = { act, ...args }
      this.sock.send(JSON.stringify(payload))
      console.log('[sock] ↑', payload)
    }
    return this
  }
}

export { CarteSocket }
