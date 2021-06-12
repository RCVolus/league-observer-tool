export interface ServerMsg {
  meta: {
    namespace: string,
    type: string,
    version?: number
    [n: string]: any
  },
  [n: string]: any
}