export const alphacat = (obj: any, valSuffix, isVal = false, skip: string[] = ['kind', 'literal']): string => {
  if (obj instanceof Array) {
    return obj.map(el => alphacat(el, valSuffix, isVal, skip)).join('')
  } else if (typeof obj === "string") {
    return isVal ? obj : ''
  } else if (isObject(obj)) {
    if ('literal' in obj && isVal) {
      return obj.literal
    }
    return Object.keys(obj)
      .filter(k => !skip.includes(k))
      .sort()
      .map(k => {
        return alphacat(obj[k], valSuffix, k.endsWith(valSuffix), skip)
      }).join('')
  } else if (obj === null) {
    return ''
  } else {
    throw new Error(`Unexpected type passed to alphacat ${JSON.stringify(obj)}`)
  }
}

function isObject(val) {
  if (val === null) { return false; }
  return ((typeof val === 'function') || (typeof val === 'object'));
}