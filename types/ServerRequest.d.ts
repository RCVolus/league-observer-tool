import type { LPTEvent } from './LPTE'

export interface ServerRequest<T = any> extends LPTEvent {
  meta: {
    namespace: string,
    type: string,
    version: number,
    reply: string
  },
  request: {
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: T
  }
}