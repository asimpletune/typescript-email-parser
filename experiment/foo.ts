import { ATOM, MATCH, RULE, RULEDEF, parse } from './metagrammar.parser'
import { readFileSync, writeFileSync } from 'fs'

interface RuleAugmentation {
  skipFields: Set<string>
  mapFields: { [key: string]: string }
  computed: { [key: string]: string[] }
}

let inputGrammar = readFileSync('./grammar/rfc5322.peg', 'ascii')
let ast = parse(inputGrammar).ast!
let modifyRules = new Map<string, RuleAugmentation>()
modifyRules.set('start', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('CR', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('CRLF', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('DIGIT', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('TWO_DIGIT', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('FOUR_DIGIT', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('DQUOTE', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('HTAB', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('LF', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('SP', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('VCHAR', { skipFields: new Set('A'), mapFields: {}, computed: {} })
modifyRules.set('WSP', { skipFields: new Set(['A', 'B']), mapFields: {}, computed: {} })
modifyRules.set('quoted_pair', { skipFields: new Set([]), mapFields: {}, computed: {} })
modifyRules.set('FWS', { skipFields: new Set([]), mapFields: {}, computed: {} })
modifyRules.set('comment', { skipFields: new Set(['C', 'E']), mapFields: {}, computed: {} })
modifyRules.set('CFWS', { skipFields: new Set([]), mapFields: {}, computed: {} })
modifyRules.set('atext', { skipFields: new Set(['A']), mapFields: {}, computed: {} })
modifyRules.set('atom', { skipFields: new Set([]), mapFields: {}, computed: {} })
modifyRules.set('specials', { skipFields: new Set('ABCDEFGHIJ'.split('')), mapFields: {}, computed: {} })
modifyRules.set('qtext', { skipFields: new Set('ABCD'.split('')), mapFields: {}, computed: {} })
modifyRules.set('qcontent', { skipFields: new Set('AB'.split('')), mapFields: {}, computed: {} })
modifyRules.set('quoted_string', { skipFields: new Set('ADFH'.split('')), mapFields: {}, computed: {} })
modifyRules.set('word', { skipFields: new Set('AB'.split('')), mapFields: {}, computed: {} })
modifyRules.set('phrase', { skipFields: new Set('AB'.split('')), mapFields: {}, computed: {} })
modifyRules.set('unstructured', { skipFields: new Set(''.split('')), mapFields: {}, computed: {} })
modifyRules.set('date_time', { skipFields: new Set('F'.split('')), mapFields: {}, computed: {} })
modifyRules.set('day_of_week', { skipFields: new Set('A'.split('')), mapFields: {}, computed: {} })
modifyRules.set('day_name', { skipFields: new Set('ABCDEFG'.split('')), mapFields: {}, computed: {} })
modifyRules.set('day', { skipFields: new Set('AD'.split('')), mapFields: {}, computed: {} })
modifyRules.set('month', { skipFields: new Set('ABCDEFGHIJKL'.split('')), mapFields: {}, computed: {} })
modifyRules.set('year', { skipFields: new Set('AD'.split('')), mapFields: {}, computed: {} })
modifyRules.set('zone', { skipFields: new Set('ACD'.split('')), mapFields: {}, computed: {} })
modifyRules.set('address', { skipFields: new Set('AB'.split('')), mapFields: {}, computed: {} })
modifyRules.set('mailbox', { skipFields: new Set('AB'.split('')), mapFields: {}, computed: {} })
modifyRules.set('angle_addr', { skipFields: new Set('AE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('group', { skipFields: new Set('E'.split('')), mapFields: {}, computed: {} })
modifyRules.set('display_name', { skipFields: new Set('A'.split('')), mapFields: {}, computed: {} })
modifyRules.set('mailbox_list', { skipFields: new Set(''.split('')), mapFields: {}, computed: {} })
modifyRules.set('address_list', { skipFields: new Set(''.split('')), mapFields: {}, computed: {} })
modifyRules.set('addr_spec', { skipFields: new Set(), mapFields: {}, computed: {} })
modifyRules.set('group_list', { skipFields: new Set('ABC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('local_part', { skipFields: new Set('ABC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('domain', { skipFields: new Set('ABC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('domain_literal', { skipFields: new Set('ADFH'.split('')), mapFields: {}, computed: {} })
modifyRules.set('dtext', { skipFields: new Set('ABC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('message', { skipFields: new Set('BCE'.split('')), mapFields: { A: "fields" }, computed: {} })
modifyRules.set('body', { skipFields: new Set(''.split('')), mapFields: {}, computed: {} })
modifyRules.set('text', { skipFields: new Set('ABCD'.split('')), mapFields: {}, computed: {} })
modifyRules.set('_998text', { skipFields: new Set('A'.split('')), mapFields: {}, computed: {} })
modifyRules.set('fields', { skipFields: new Set('EFGHIJKMNOPQRSTUVWXYZ'.split('')), mapFields: {}, computed: {} })
modifyRules.set('orig_date', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('from', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('sender', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('reply_to', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('to', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('cc', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('bcc', { skipFields: new Set('DEF'.split('')), mapFields: {}, computed: {} })
modifyRules.set('message_id', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('in_reply_to', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('references', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('msg_id', { skipFields: new Set('AF'.split('')), mapFields: {}, computed: {} })
modifyRules.set('id_left', { skipFields: new Set('AB'.split('')), mapFields: {}, computed: {} })
modifyRules.set('id_right', { skipFields: new Set('ABC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('subject', { skipFields: new Set('D'.split('')), mapFields: { 'A': '_name', 'C': '_value' }, computed: {} })
modifyRules.set('comments', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('keywords', { skipFields: new Set('G'.split('')), mapFields: {}, computed: {} })
modifyRules.set('resent_date', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('resent_from', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('resent_sender', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('resent_to', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('resent_cc', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('resent_bcc', { skipFields: new Set('EF'.split('')), mapFields: {}, computed: {} })
modifyRules.set('resent_msg_id', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('return_path', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('path', { skipFields: new Set('BCDEFG'.split('')), mapFields: {}, computed: {} })
modifyRules.set('received', { skipFields: new Set('F'.split('')), mapFields: {}, computed: {} })
modifyRules.set('received_token', { skipFields: new Set('ABCD'.split('')), mapFields: {}, computed: {} })
modifyRules.set('optional_field', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('field_name', { skipFields: new Set('A'.split('')), mapFields: {}, computed: {} })
modifyRules.set('ftext', { skipFields: new Set('AB'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_NO_WS_CTL', { skipFields: new Set('AB'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_ctext', { skipFields: new Set('A'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_qtext', { skipFields: new Set('A'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_utext', { skipFields: new Set('ABC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_qp', { skipFields: new Set('CDEF'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_body', { skipFields: new Set('CDIJK'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_unstruct', { skipFields: new Set('CDGHI'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_phrase', { skipFields: new Set('CDE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_phrase_list', { skipFields: new Set('BCGH'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_FWS', { skipFields: new Set('BCD'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_day_of_week', { skipFields: new Set('AC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_day', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_year', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_hour', { skipFields: new Set('AC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_minute', { skipFields: new Set('AC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_second', { skipFields: new Set('AC'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_zone', { skipFields: new Set('ABCDEFGHIJKLMN'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_angle_addr', { skipFields: new Set('AF'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_route', { skipFields: new Set('AF'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_domain_list', { skipFields: new Set('H'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_mbox_list', { skipFields: new Set('H'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_addr_list', { skipFields: new Set('H'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_group_list', { skipFields: new Set('D'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_dtext', { skipFields: new Set('A'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_fields', { skipFields: new Set('EFGHIJKMNOPQRSTUVWXY'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_orig_date', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_from', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_sender', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_reply_to', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_to', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_cc', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_bcc', { skipFields: new Set('BFGHIJ'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_message_id', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_in_reply_to', { skipFields: new Set('BEFG'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_references', { skipFields: new Set('BEFG'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_id_left', { skipFields: new Set('A'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_id_right', { skipFields: new Set('A'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_subject', { skipFields: new Set('BE'.split('')), mapFields: { A: "_name", D: "_value" }, computed: {} })
modifyRules.set('obs_comments', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_keywords', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_resent_from', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_resent_send', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_resent_date', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_resent_to', { skipFields: new Set('Be'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_resent_cc', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_resent_bcc', { skipFields: new Set('BFGHIJ'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_resent_mid', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_resent_rply', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_return', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_received', { skipFields: new Set('Be'.split('')), mapFields: {}, computed: {} })
modifyRules.set('obs_optional', { skipFields: new Set('BE'.split('')), mapFields: {}, computed: {} })

let output = `---\nimport { concat } from './util'\n---\nstart := message\n` + addFieldsToRules(ast.rules, modifyRules)
writeFileSync('./experiment/message.fields.peg', output)

// output += '\t.literal = string { return makeLiteral(this) }\n'
// output += `\t.value = string { return makeLiteral(this, '_v') }\n`
function addFieldsToRules(ruleDefs: RULEDEF[], modifications: Map<string, RuleAugmentation>) {
  return ruleDefs.sort((r1, r2) => r1.name < r2.name ? -1 : 1).map(ruleDef => {
    return `${ruleDef.name} := ${enumerateFieldsOfAtoms(ruleDef.rule, modifications.get(ruleDef.name) || { skipFields: new Set(), mapFields: {}, computed: {} })}`
  }).join('\n')
}


function enumerateFieldsOfAtoms(rule: RULE, modify: RuleAugmentation): string {
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
            let field = modify.skipFields.has(name) ? '' : `${modify.mapFields[name] || name}=`
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
  if (modify.computed['root'] !== undefined) {
    return `root={ ${results} }` + modify.computed['root'].map(fn => `\n\t${fn}`).join('')
  }
  else return results
}
