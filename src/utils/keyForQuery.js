import fnv1a from '@sindresorhus/fnv1a'

function generateKey(keyObj) {
  return fnv1a(JSON.stringify(keyObj)).toString(36)
}

function getRequestKey(query, vars) {
  const queryKey = generateKey(query)
  if (vars === undefined || vars === null) {
    return queryKey
  }
  return hash('' + queryKey + JSON.stringify(vars))
}

export default getRequestKey
