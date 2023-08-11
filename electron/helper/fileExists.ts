import { stat } from 'fs/promises'

export default async function fileExists (path: string) {
  return !!(await stat(path).catch(() => false))
}