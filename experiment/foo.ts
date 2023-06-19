import { RULE, parse } from './metagrammar.parser'
import { readFileSync, writeFileSync } from 'fs'

let inputGrammar = readFileSync('./grammar/rfc5322.peg', 'ascii')

let ast = parse(inputGrammar).ast!
let output = `---\nimport { makeLiteral } from './foo'\n---\n`

for (const ruleDef of ast.rules) {
  output += ruleDef.name + ' := '
  output += addFields(ruleDef.rule) + '\n\t' + '.literal = string { return makeLiteral(this) }\n'
}

writeFileSync('./experiment/message.fields.peg', output)

function addFields(rule: RULE): string {
  let autoFieldNames = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return rule.list.map(alt => {
    let foo = alt.matches.map(matchSpec => {
      let match = matchSpec.rule
      if (match.kind === 'POSTOP') {
        let postopSymbol = match.op
        let preop = match.pre
        let atom = preop.at
        let preopSymbol = preop.op
        let operand = (() => {
          // Named atom
          if (atom.kind === 'ATOM_1') {
            return `${autoFieldNames.shift()}=${atom.name}`
          }
          // Literal atom
          else if (atom.kind === 'ATOM_2') {
            return `${autoFieldNames.shift()}='${atom.match.val}'`
          }
          // Sub rule atom
          else if (atom.kind === 'ATOM_3') {
            return `${autoFieldNames.shift()}={ ${addFields(atom.sub)} }`
          }
          // EOF
          else {
            return atom.symb
          }
        })()
        return `${preopSymbol || ''}${operand}${postopSymbol || ''}`
      } else {
        return match.op
      }
    }).join(' ')
    return foo
  }).join(' | ')
}

export let makeLiteral = (obj: any, valSuffix = '', isVal = false, skip: string[] = ['kind', 'literal']): string => {
  if (obj instanceof Array) {
    return obj.map(el => makeLiteral(el, valSuffix, isVal, skip)).join('')
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
        return makeLiteral(obj[k], valSuffix, k.endsWith(valSuffix), skip)
      }).join('')
  } else if (obj === null) {
    return ''
  } else {
    throw new Error(`Unexpected type passed to makeLiteral ${JSON.stringify(obj)}`)
  }
}

function isObject(val: any) {
  if (val === null) { return false; }
  return ((typeof val === 'function') || (typeof val === 'object'));
}
