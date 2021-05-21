export interface Response <D = any> {
  status: "pending" | "done"
  type: string
  data?: D
}