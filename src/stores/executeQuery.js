// import { getContext } from 'svelte'
import { writable } from 'svelte/store'
import pipe from 'callbag-pipe'
import observe from 'callbag-observe'
import setRequest from './request'

import { parse as gql } from 'graphql'

function executeQuery() {
  const { subscribe, set } = writable({
    fetching: false
  })

  return {
    subscribe,
    // Must pass client to query function, yuck!
    query: async (client, operation) => {
      // TODO: must be a way to set context without error
      // const client = getContext('client$')
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

export default executeQuery
