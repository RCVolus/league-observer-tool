import type { Color } from "sveltestrap/src/shared";

export type DisplayError = {
  show: boolean
  color: Color
  text: string
  timeout?: number
}