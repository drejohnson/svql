import { writable } from 'svelte/store'
import { transformRequest } from '../utils/tranformRequest'

export const setRequest = (query, variables) => {
  const prev = writable(undefined)

  let request

  prev.subscribe(current => {
    request = transformRequest(query, variables)

    // We manually ensure reference equality if the key hasn't changed
    if (current !== undefined && current.key === request.key) {
      return current
    } else {
      current = request
      return request
    }
  })

  return request
}
