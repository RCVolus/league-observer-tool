/**
 * Trim slashes in front of a string
 * @param s
 */
export function trim(s: string): string {
  let r = s
  while (r.startsWith('/')) {
    r = r.substr(1)
  }
  return r
}