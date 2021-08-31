export interface Response <T = any> {
  status: "pending" | "done"
  type: string
  data?: T
}