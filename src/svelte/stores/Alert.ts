import { writable } from 'svelte/store'
import type { DisplayError } from '../../../types/DisplayError';

export const Alert = function () {
  const { subscribe, set, update } = writable<DisplayError>({
    show: false,
    color: "danger",
    text: "Error",
    timeout: 3000
  });
  return {
    subscribe,
    set,
    show: () => { update(state => {
      state.show = true
      return state
    })},
    hide: () => { update(state => {
      state.show = false
      return state
    })}
  }
}()