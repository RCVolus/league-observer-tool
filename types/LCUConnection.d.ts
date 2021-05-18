import { Credentials } from './Credentials'

export interface LCUConnection {
  status: "pending" | "done"
  type: "connecting" | "disconnecting"
  credentials?: Credentials
}