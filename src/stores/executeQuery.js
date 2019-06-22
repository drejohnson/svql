// import { getContext } from 'svelte'
import { writable } from 'svelte/store'
import pipe from 'callbag-pipe'
import observe from 'callbag-observe'

export function executeQuery(client) {
  const { subscribe, set } = writable({ fetching: false })

  return {
    subscribe,
    query: operation => {
      // const client = getContext('client')
      set({ fetching: true })
      const source = client.request(operation)
      return pipe(
        source,
        observe(async response => {
          const { errors, data } = await response
          errors
            ? set({
                fetching: false,
                errors
              })
            : set({
                fetching: false,
                data
              })
        })
      )
    }
  }
}
