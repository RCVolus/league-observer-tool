import { writable } from 'svelte/store'
import type { Module } from  '../../../types/Module'

export const currentPage = writable<string>("client")

export const availableModules = writable<Map<string, Module>>(new Map())