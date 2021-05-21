import type { Color } from "sveltestrap/src/shared";

export type DisplayError = {
  color: Color
  text: string
  timeout?: number
}