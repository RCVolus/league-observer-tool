import Store, { Schema } from 'electron-store'
import Config from '../types/Config'
import { ipcMain } from 'electron'

const schema: Schema<Config> = {
  'server-ip': {
    type: 'string',
    default: '127.0.0.1'
  },
  'server-port': {
    type: 'number',
    maximum: 65535,
    minimum: 1025,
    default: 3003
  },
  'server-api-key': {
    type: 'string',
    default: ''
  },
  'live-events-port': {
    type: 'number',
    maximum: 65535,
    minimum: 1025,
    default: 34243
  },
  'replay-send-information': {
    type: 'boolean',
    default: true
  },
  'window-bounds': {
    type: 'object'
  },
  'league-install-path': {
    type: 'string'
  }
}

export default function createStore (): Store<Config> {
  const store = new Store({
    schema,
    clearInvalidConfig: true,
    watch: true
  })

  ipcMain.handle('getStore', () => {
    return store.store
  })

  ipcMain.handle('saveStore', (_e, newStore: Config) => {
    store.set(newStore)
    return store.store
  })

  return store
}
