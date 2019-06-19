import getRequestKey from './keyForQuery'

function transformRequest(q, v) {
  return {
    key: getRequestKey(q, v),
    query: q,
    variables: v || {}
  }
}

export default transformRequest
