export interface ServerRequest {
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