import pipe from 'callbag-pipe'
import map from 'tallbag-map'
import fromFetch from 'tallbag-from-fetch'
import catchError from './utils/catchError'

// import { normalize, denormalize, mergeEntityCache as merge } from 'gql-cache'
import { print } from 'graphql'

export default function createClient(opts, initialOpts = {}) {
  function generateResult({ fetchError, httpError, graphQLErrors, data }) {
    const error = !!(
      (graphQLErrors && graphQLErrors.length > 0) ||
      fetchError ||
      httpError
    )

    return {
      error,
      fetchError,
      httpError,
      graphQLErrors,
      data
    }
  }

  let cache = {}
  let cacheMap = new Map()
  // use operation.key for cacheMap.set

  function executeQuery(operation) {
    function transport(operation) {
      const query = print(operation.query)
      return pipe(
        fromFetch(opts.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...opts.headers
          },
          body: JSON.stringify({
            operationName: operation.operationName,
            query: query,
            variables: operation.variables
          }),
          ...opts.fetchOptions
        }),
        map(async response => {
          if (response.ok) {
            // OK return data
            const { errors, data } = await response.json()
            return generateResult({
              graphQLErrors: errors,
              data
            })
          } else {
            const body = await response.text()
            const { status, statusText } = body
            return generateResult({
              httpError: {
                status,
                statusText,
                body
              }
            })
          }
        }),
        catchError(err => {
          console.log(err.message)
          return generateResult({
            fetchError: error
          })
        })
      )
    }
    return transport(operation)
  }

  function cacheQuery(query, variables, data) {
    if (!data) {
      data = variables
      variables = undefined
    }

    // const normalizedResponse = normalize(query, { ...variables }, { data })

    // // rename to merge
    // cache = merge(cache, normalizedResponse)

    // console.log(cache)

    // const { stale, response } = denormalize(query, { ...variables }, cache)

    return data
  }

  function hydrate() {
    return {}
  }

  return { executeQuery, cacheQuery, hydrate }
}
