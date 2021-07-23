export interface Module {
  id: string
  name: string,
  actions: [string, string][]
  status: 0 | 1 | 2
}