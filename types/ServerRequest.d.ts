import type { RequestOptions } from 'league-connect'

export interface ServerRequest {
  meta: {
    namespace: string
    type: string
  }
  request: RequestOptions
}