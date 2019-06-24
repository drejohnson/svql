// import { getContext } from 'svelte'
import { writable } from 'svelte/store'
import pipe from 'callbag-pipe'
import observe from 'callbag-observe'
import setRequest from './request'

export default function executeQuery() {
  const { subscribe, set } = writable({
    fetching: false
  })

  return {
    subscribe,
    query: async (client, query, opts = {}) => {
      // const client = getContext('client')
      const requestOperation = setRequest(query, opts)
      set({ fetching: true })
      const source = client.executeQuery(requestOperation)
      pipe(
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
