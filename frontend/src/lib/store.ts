import { writable } from "svelte/store";
import type { DisplayError } from "../../types/DisplayError";

export const firstSetup = writable(false)
export const alert = writable<DisplayError>()