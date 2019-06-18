import makeShadow from 'shadow-callbag'

const catchError = fn => source => (start, sink) => {
  if (start !== 0) return

  const shadow = makeShadow('catchError')

  function talkback(t, data) {
    t === 2 && typeof data !== 'undefined'
      ? fn(data)
      : (shadow(t, data), sink(t, data))
  }

  source(0, talkback, shadow)
}

export default catchError
