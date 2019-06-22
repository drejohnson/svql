import fromFetch from 'tallbag-from-fetch'
import pipe from 'callbag-pipe'
import map from 'tallbag-map'
import of from 'callbag-of'
import fnv1a from '@sindresorhus/fnv1a'
import { extractFiles } from 'extract-files'
import catchError from './utils/tallbags/tallbag-catch-error'

export class Client {
  constructor(opts) {
    // validate opts
    if (!opts.url) {
      throw new Error('Client: opts.url is required')
    }
    this.url = opts.url
    this.cache = opts.cache || new Map()
    this.headers = opts.headers || {}
    this.fetchOptions = opts.fetchOptions || {}
  }

  combineResult({ fetchError, httpError, graphQLErrors, data }) {
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

  getFetchOptions(operation) {
    const fetchOptions = {
      method: 'POST',
      headers: {
        ...this.headers
      },
      ...this.fetchOptions
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

  request(operation) {
    const cacheKey = fnv1a(
      '' + this.url + JSON.stringify(this.getFetchOptions(operation))
    )
    if (this.cache.has(cacheKey)) {
      return pipe(of(this.cache.get(cacheKey)))
    }
    return pipe(
      fromFetch(this.url, this.getFetchOptions(operation)),
      map(async response => {
        if (!response.ok) {
          const body = await response.text()
          const { status, statusText } = body
          return this.combineResult({
            httpError: {
              status,
              statusText,
              body
            }
          })
        } else {
          // OK return data
          const { errors, data } = await response.json()
          if (!this.cache.has(cacheKey)) {
            this.cache.set(
              cacheKey,
              this.combineResult({
                graphQLErrors: errors,
                data
              })
            )
          }
          return this.combineResult({
            graphQLErrors: errors,
            data
          })
        }
      }),
      catchError(error => {
        console.log(err.message)
        return this.combineResult({
          fetchError: error
        })
      })
    )
  }
}
