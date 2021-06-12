import type { ServerMsg } from './ServerMsg'

export interface ServerRequest extends ServerMsg {
  meta: {
    namespace: string,
    type: string,
    version: number,
    reply: string
  },
  request: {
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: any
  }
}