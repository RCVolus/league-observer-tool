enum ModuleType {
  STANDALONE = 'STANDALONE',
  PLUGIN = 'PLUGIN',
}

enum EventType {
  BROADCAST = 'BROADCAST',
  REQUEST = 'REQUEST',
  REPLY = 'REPLY'
}

export interface LPTEvent {
  meta: {
    type: string
    namespace: string
    version?: number

    sender?: {
      name: string
      version: string
      mode: ModuleType
      path?: string
    }
    channelType?: EventType
    reply?: string

    [name: string]: any
  },
  [n: string]: any
}