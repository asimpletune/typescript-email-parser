export let concat = (obj: any, ignore: Set<string> = new Set()): string => {
  ignore.add('kind')
  if (obj === null) return ''
  else if (typeof obj === 'string') {
    return obj
  } else if (obj instanceof Array) {
    return obj.map(el => concat(el, ignore)).join('')
  } else if (isObject(obj)) {
    return Object.keys(obj).filter(k => !ignore.has(k)).sort().map(name => concat(obj[name], ignore)).join('')
  } else {
    throw new Error(`Unexpected type passed to 'concat': ${JSON.stringify(obj)}`)
  }
}

function isObject(val: any) {
  if (val === null) { return false; }
  return ((typeof val === 'function') || (typeof val === 'object'));
}