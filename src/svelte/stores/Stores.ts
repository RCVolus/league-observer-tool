import { writable } from 'svelte/store'

export const currentPage = writable<string>("client")

export const activeModules = writable<{[n: string]: boolean}>({})
export const availableModules = writable<Array<{
  id: string
  name: string,
  actions: [string, string][]
}>>([])