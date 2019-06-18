import { getContext } from 'svelte'
import { writable } from 'svelte/store'
import pipe from 'callbag-pipe'
import observe from 'callbag-observe'
import { setRequest } from './request'

import { parse as gql } from 'graphql'

export function executeQuery() {
  const { subscribe, set } = writable({
    fetching: false
  })

  return {
    subscribe,
    query: async operation => {
      const client = getContext('client$')
      const query = gql(operation.query)
      const requestOperation = setRequest(query, operation.variables)
      set({ fetching: true })
      const source = client.executeQuery(requestOperation)
      pipe(
        source,
        observe(async response => {
          const { errors, data } = await response
          const cache = client.cacheQuery(
            requestOperation.query,
            requestOperation.variables,
            data
          )
          console.log(cache)
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
