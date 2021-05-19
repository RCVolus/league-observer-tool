export interface LCUResponse <D = any> {
  status: "pending" | "done"
  type: string
  data?: D
}