import type { Color } from "sveltestrap/src/shared";

export type DisplayError = {
  show: boolean
  color: Color
  heading: string
  text: string
  timeout?: number
}