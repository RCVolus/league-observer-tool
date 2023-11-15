export type DisplayError = {
  color: 'error' | 'info' | 'warning' | 'success'
  title: string
  message: string
  timeout?: number
}