import { getRequestKey } from './keyForQuery'

export function transformRequest(q, v) {
  return {
    key: getRequestKey(q, v),
    query: q,
    variables: v || {}
  }
}
