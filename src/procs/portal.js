// High order communication using ports.
// Coordinates messages to, and from the runtime <-> background processes.
import _ from 'lodash'
import { context, Runtime } from '~mixins/utils'


export class Port {
  constructor (name) {
    this.portName = name
    // Stores all the callbacks attached to this port.
    this.callbacks = {}

    this.didRecieveMessage = this.didRecieveMessage.bind(this)
    this.addAction = this.addAction.bind(this)
    this.connect = this.connect.bind(this)
    this.dispatch = this.dispatch.bind(this)
    this.invokeReaction = this.invokeReaction.bind(this)
  }

  connect () {
    // Connect to the message callback on this port.
    // We'll fall back with a fake "port" in case the components are inside
    // a web environment. This is to ease development outside the extension.
    if (context() !== Runtime.extension) {
      // Fallback. Provide a stub port object, with `postMessage` function.
      this.port = {
        portStub: true,
        postMessage: (msg) => {
          console.info(`[PortStub ${this.portName}] postMessage`, msg)
        },
      }
      return this
    }
    this.port = browser.runtime.connect({ name: this.portName })
    this.port.onMessage.addListener(this.didRecieveMessage)
    return this
  }

  addAction (name, callback) {
    console.log(`<Port ${this.portName}> Attached Action: ${name}`)
    this.callbacks[name] = callback
    return this
  }

  didRecieveMessage (msg) {
    // Do something with message, maybe check the recepient etc.
    // Push the message to appropriate callback.
    console.log(`Message for ${this.portName}: `, msg)
    _.forOwn(this.callbacks, (fn, action) => {
      if (msg.action === action) {
        fn(msg)
      }
    })
  }

  addCallback (name, fn) {
    this.callbacks[name] = fn
    return this
  }

  dispatch (msg) {
    // Send a message using this port.
    this.port.postMessage({
      _source: this.portName,
      ...msg,
    })
    return this
  }

  invokeReaction (name) {
    this.port.postMessage({
      context: 'reactor',
      payload: { action: name },
    })
  }
}



class Portal {
  constructor () {
    this.ports = {}
  }

  connect () {
  }
}

