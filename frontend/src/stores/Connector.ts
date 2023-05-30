import { writable, type Writable, derived, get } from "svelte/store";

class Connector {
  public lcuConnected : Writable<boolean> = writable(false)
  public lcuPending : Writable<boolean> = writable(false)
  public serverConnected : Writable<boolean> = writable(false)
  public severPending : Writable<boolean> = writable(false)

  constructor () {
    window.sender.on('lcu-connection', (_e: any, state : boolean) => {
      this.lcuPending.set(false)
      this.lcuConnected.set(state[0])
    })
    window.sender.on('server-connection', (_e: any, state : boolean) => {
      this.severPending.set(false)
      this.serverConnected.set(state[0])
    })
  }

  get isConnected() {
    // Use derived to access writable values and export as readonly
    return derived(
        [this.lcuConnected, this.serverConnected],
        ([$lcuConnected, $serverConnected]) => {
            return $lcuConnected && $serverConnected
        }
    )
  }

  get isPending() {
    // Use derived to access writable values and export as readonly
    return derived(
        [this.lcuPending, this.severPending],
        ([$lcuPending, $severPending]) => {
            return $lcuPending || $severPending
        }
    )
  }

  public connect () {
    if (!get(this.lcuConnected)) {
      this.lcuPending.set(true)
      window.connector.lcu.start()
    }
    if (!get(this.serverConnected)) {
      this.severPending.set(true)
      window.connector.server.start()
    }
  }

  public disconnect () {
    window.connector.stop()
  }
}

export const ConnectionStore = new Connector();