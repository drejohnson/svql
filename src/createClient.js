import pipe from 'callbag-pipe'
import map from 'tallbag-map'
import fromFetch from 'tallbag-from-fetch'
import share from 'tallbag-share'
import filter from 'tallbag-filter'
import mergeMap from 'callbag-merge-map'
import of from 'callbag-of'
import take from 'tallbag-take'
import catchError from './utils/tallbags/tallbag-catch-error'
import { extractFiles } from 'extract-files'
import fnv1a from '@sindresorhus/fnv1a'

export default function createClient(opts) {
  const { url } = opts
  const cache = new Map()

  function handleResult({ fetchError, httpError, graphQLErrors, data }) {
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

  function getFetchOptions(operation) {
    const fetchOptions = {
      method: 'POST',
      headers: {
        ...opts.headers
      },
      ...opts.fetchOptions
    }

    const { clone, files } = extractFiles(operation)
    const operationJSON = JSON.stringify(clone)

    if (files.size) {
      // See the GraphQL multipart request spec:
      // https://github.com/jaydenseric/graphql-multipart-request-spec

      const form = new FormData()

      form.append('operations', operationJSON)

      const map = {}
      let i = 0
      files.forEach(paths => {
        map[++i] = paths
      })
      form.append('map', JSON.stringify(map))

      i = 0
      files.forEach((paths, file) => {
        form.append(`${++i}`, file, file.name)
      })

      fetchOptions.body = form
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json'
      fetchOptions.body = operationJSON
    }

    return fetchOptions
  }

  function executeQuery(operation) {
    return executeRequest(operation)
  }

  function executeFetch(operation) {
    const cacheKey = fnv1a(
      '' + url + JSON.stringify(getFetchOptions(operation))
    )
    if (cache.has(cacheKey)) {
      return pipe(of(cache.get(cacheKey)))
    }
    return pipe(
      fromFetch(opts.url, getFetchOptions(operation)),
      map(async response => {
        if (!response.ok) {
          const body = await response.text()
          const { status, statusText } = body
          return handleResult({
            httpError: {
              status,
              statusText,
              body
            }
          })
        } else {
          // OK return data
          const result = await response.json()
          const { errors, data } = result
          if (!cache.has(cacheKey)) {
            cache.set(
              cacheKey,
              handleResult({
                graphQLErrors: errors,
                data
              })
            )
          }
          return handleResult({
            graphQLErrors: errors,
            data
          })
        }
      }),
      catchError(error => {
        console.log(err.message)
        return handleResult({
          fetchError: error
        })
      })
    )
  }

  function executeRequest(operation) {
    const { key } = operation
    const operations$ = share(of(operation))
    const operationResults = pipe(
      operations$,
      filter(operation => {
        return operation.key === key
      }),
      take(1)
    )
    return pipe(
      operationResults,
      mergeMap(operation => {
        return executeFetch(operation)
      })
    )
  }

  function hydrate() {
    return {}
  }

  return { executeQuery, hydrate }
}
