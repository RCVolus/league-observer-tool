import { writable } from 'svelte/store'
import type { Module } from  '../../../types/Module'
import type Config from "../../../types/Config";

export const currentPage = writable("client")

export const availableModules = writable<Map<string, Module>>(new Map())

export const store = writable<Config>()