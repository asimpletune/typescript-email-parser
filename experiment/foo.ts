import { ATOM, MATCH, RULE, RULEDEF, parse } from './metagrammar.parser'
import { readFileSync, writeFileSync } from 'fs'

interface AugmentRule {
  skipFields: Set<string>
  mapFields: { [key: string]: string }
  computed: string[]
}

let inputGrammar = readFileSync('./grammar/rfc5322.peg', 'ascii')
let ast = parse(inputGrammar).ast!
let skipFields = new Map<string, Set<string>>()
skipFields.set('start', new Set('A'))
skipFields.set('CR', new Set('A'))
skipFields.set('CRLF', new Set('A'))
skipFields.set('DIGIT', new Set('A'))
skipFields.set('TWO_DIGIT', new Set('A'))
skipFields.set('FOUR_DIGIT', new Set('A'))
skipFields.set('DQUOTE', new Set('A'))
skipFields.set('HTAB', new Set('A'))
skipFields.set('LF', new Set('A'))
skipFields.set('SP', new Set('A'))
skipFields.set('VCHAR', new Set('A'))
skipFields.set('WSP', new Set(['A', 'B']))
skipFields.set('quoted_pair', new Set(['E']))
skipFields.set('FWS', new Set(['A', 'B', 'C', 'D', 'E', 'F']))
skipFields.set('comment', new Set(['C', 'E']))
skipFields.set('CFWS', new Set(['C', 'E', 'F']))
skipFields.set('atext', new Set(['A']))
skipFields.set('atom', new Set(['A', 'C']))
skipFields.set('specials', new Set('ABCDEFGHIJ'.split('')))
skipFields.set('qtext', new Set('ABCD'.split('')))
skipFields.set('qcontent', new Set('AB'.split('')))
skipFields.set('quoted_string', new Set('ADFH'.split('')))
skipFields.set('word', new Set('AB'.split('')))
skipFields.set('phrase', new Set('AB'.split('')))
skipFields.set('unstructured', new Set('CE'.split('')))
skipFields.set('date_time', new Set('F'.split('')))
skipFields.set('day_of_week', new Set('B'.split('')))
skipFields.set('day_name', new Set('ABCDEFG'.split('')))
skipFields.set('day', new Set('BE'.split('')))
skipFields.set('month', new Set('ABCDEFGHIJKL'.split('')))
skipFields.set('zone', new Set('B'.split('')))
skipFields.set('address', new Set('AB'.split('')))
skipFields.set('mailbox', new Set('AB'.split('')))
skipFields.set('angle_addr', new Set('AE'.split('')))
skipFields.set('group', new Set('E'.split('')))
skipFields.set('display_name', new Set('A'.split('')))
skipFields.set('group_list', new Set('ABC'.split('')))
skipFields.set('local_part', new Set('ABC'.split('')))
skipFields.set('domain', new Set('ABC'.split('')))
skipFields.set('domain_literal', new Set('ADFH'.split('')))
skipFields.set('dtext', new Set('ABC'.split('')))
skipFields.set('message', new Set('BCE'.split('')))
skipFields.set('body', new Set('D'.split('')))
skipFields.set('text', new Set('ABCD'.split('')))
skipFields.set('_998text', new Set('A'.split('')))
skipFields.set('fields', new Set('EFGHIJKMNOPQRSTUVWXYZ'.split('')))
skipFields.set('orig_date', new Set('D'.split('')))
skipFields.set('from', new Set('D'.split('')))
skipFields.set('sender', new Set('D'.split('')))
skipFields.set('reply_to', new Set('D'.split('')))
skipFields.set('to', new Set('D'.split('')))
skipFields.set('cc', new Set('D'.split('')))
skipFields.set('bcc', new Set('DEF'.split('')))
skipFields.set('message_id', new Set('D'.split('')))
skipFields.set('in_reply_to', new Set('D'.split('')))
skipFields.set('references', new Set('D'.split('')))
skipFields.set('msg_id', new Set('AF'.split('')))
skipFields.set('id_left', new Set('AB'.split('')))
skipFields.set('id_right', new Set('ABC'.split('')))
skipFields.set('subject', new Set('D'.split('')))
skipFields.set('comments', new Set('D'.split('')))
skipFields.set('keywords', new Set('G'.split('')))
skipFields.set('resent_date', new Set('D'.split('')))
skipFields.set('resent_from', new Set('D'.split('')))
skipFields.set('resent_sender', new Set('D'.split('')))
skipFields.set('resent_to', new Set('D'.split('')))
skipFields.set('resent_cc', new Set('D'.split('')))
skipFields.set('resent_bcc', new Set('EF'.split('')))
skipFields.set('resent_msg_id', new Set('D'.split('')))
skipFields.set('return_path', new Set('D'.split('')))
skipFields.set('path', new Set('ABCDEFG'.split('')))
skipFields.set('received', new Set('F'.split('')))
skipFields.set('received_token', new Set('ABCD'.split('')))
skipFields.set('optional_field', new Set('D'.split('')))
skipFields.set('field_name', new Set('A'.split('')))
skipFields.set('ftext', new Set('AB'.split('')))
skipFields.set('obs_NO_WS_CTL', new Set('AB'.split('')))
skipFields.set('obs_ctext', new Set('A'.split('')))
skipFields.set('obs_qtext', new Set('A'.split('')))
skipFields.set('obs_utext', new Set('ABC'.split('')))
skipFields.set('obs_qp', new Set('CDEF'.split('')))
skipFields.set('obs_body', new Set('CDIJK'.split('')))
skipFields.set('obs_unstruct', new Set('CDGHI'.split('')))
skipFields.set('obs_phrase', new Set('CDE'.split('')))
skipFields.set('obs_phrase_list', new Set('BCGH'.split('')))
skipFields.set('obs_FWS', new Set('BCD'.split('')))
skipFields.set('obs_day_of_week', new Set('AC'.split('')))
skipFields.set('obs_day', new Set('D'.split('')))
skipFields.set('obs_year', new Set('D'.split('')))
skipFields.set('obs_hour', new Set('AC'.split('')))
skipFields.set('obs_minute', new Set('AC'.split('')))
skipFields.set('obs_second', new Set('AC'.split('')))
skipFields.set('obs_zone', new Set('ABCDEFGHIJKLMN'.split('')))
skipFields.set('obs_angle_addr', new Set('AF'.split('')))
skipFields.set('obs_route', new Set('AF'.split('')))
skipFields.set('obs_domain_list', new Set('H'.split('')))
skipFields.set('obs_mbox_list', new Set('H'.split('')))
skipFields.set('obs_addr_list', new Set('H'.split('')))
skipFields.set('obs_group_list', new Set('D'.split('')))
skipFields.set('obs_dtext', new Set('A'.split('')))
skipFields.set('obs_fields', new Set('EFGHIJKMNOPQRSTUVWXY'.split('')))
skipFields.set('obs_orig_date', new Set('BE'.split('')))
skipFields.set('obs_from', new Set('BE'.split('')))
skipFields.set('obs_sender', new Set('BE'.split('')))
skipFields.set('obs_reply_to', new Set('BE'.split('')))
skipFields.set('obs_to', new Set('BE'.split('')))
skipFields.set('obs_cc', new Set('BE'.split('')))
skipFields.set('obs_bcc', new Set('BJK'.split('')))
skipFields.set('obs_message_id', new Set('BE'.split('')))
skipFields.set('obs_in_reply_to', new Set('BEFG'.split('')))
skipFields.set('obs_references', new Set('BEFG'.split('')))
skipFields.set('obs_id_left', new Set('A'.split('')))
skipFields.set('obs_id_right', new Set('A'.split('')))
skipFields.set('obs_subject', new Set('BE'.split('')))
skipFields.set('obs_comments', new Set('BE'.split('')))
skipFields.set('obs_keywords', new Set('BE'.split('')))
skipFields.set('obs_resent_from', new Set('BE'.split('')))
skipFields.set('obs_resent_send', new Set('BE'.split('')))
skipFields.set('obs_resent_date', new Set('BE'.split('')))
skipFields.set('obs_resent_to', new Set('Be'.split('')))
skipFields.set('obs_resent_cc', new Set('BE'.split('')))
skipFields.set('obs_resent_bcc', new Set('BJK'.split('')))
skipFields.set('obs_resent_mid', new Set('BE'.split('')))
skipFields.set('obs_resent_rply', new Set('BE'.split('')))
skipFields.set('obs_return', new Set('BE'.split('')))
skipFields.set('obs_received', new Set('Be'.split('')))
skipFields.set('obs_optional', new Set('BE'.split('')))

let output = `---\nimport { makeLiteral } from './foo'\n---\n` + addFieldsToRules(ast.rules, skipFields)
writeFileSync('./experiment/message.fields.peg', output)

// output += '\t.literal = string { return makeLiteral(this) }\n'
// output += `\t.value = string { return makeLiteral(this, '_v') }\n`
function addFieldsToRules(ruleDefs: RULEDEF[], skip: Map<string, Set<string>>) {
  return ruleDefs.map(ruleDef => {
    return `${ruleDef.name} := ${enumerateFieldsOfAtoms(ruleDef.rule, skip.get(ruleDef.name) || new Set())}`
  }).join('\n')
}


function enumerateFieldsOfAtoms(rule: RULE, skip: Set<string>): string {
  let fieldNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let nextFieldName = fieldNames.split('');
  let assignNamesToAtoms = (rule: RULE) => {
    let altList: string = rule.list.map(alt => {
      let matches: string = alt.matches.map(matchSpec => {
        let match = matchSpec.rule
        if (match.kind === 'POSTOP') {
          let postopSymbol = match.op
          let preop = match.pre
          let atom = preop.at
          let preopSymbol = preop.op
          let operand = (() => {
            let name = nextFieldName.shift()!
            let field = skip.has(name) ? '' : `${name}=`
            // Named atom
            if (atom.kind === 'ATOM_1') {
              return `${field}${atom.name}`
            }
            // Literal atom
            else if (atom.kind === 'ATOM_2') {
              return `${field}'${atom.match.val}'`
            }
            // Sub rule atom
            else if (atom.kind === 'ATOM_3') {
              return `${field}{ ${assignNamesToAtoms(atom.sub)} }`
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
      return matches
    }).join(' | ')
    return altList
  }
  let results = assignNamesToAtoms(rule)
  return results
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
