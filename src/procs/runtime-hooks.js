
class RuntimeHook {
  // Manage runtime event hooks and attach/remove handlers as required.
  // Keeps track of hook states.
  constructor (hook, anchorEvent) {
    this.hook = hook
    this.anchor = anchorEvent
    this.attached = false
  }

  attach () {
    if (!this.attached) {
      this.anchor.addListener(this.hook)
      this.attached = true
    }
    return this
  }

  detach () {
    if (this.attached) {
      this.anchor.removeListener(this.hook)
      this.attached = false
    }
    return this
  }
}

const RuntimeEvents = {
  onInstall: runtime.onInstalled,
  onStartup: runtime.onStartup,
}


export { RuntimeHook, RuntimeEvents }
