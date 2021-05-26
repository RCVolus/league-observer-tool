export interface ServerResponse {
  meta: {
    namespace: "reply",
    type: string,
    version: number
  },
  data: any
}