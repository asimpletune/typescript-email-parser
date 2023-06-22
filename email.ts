import { ASTNodeIntf, ASTKinds as K, Parser, addr_spec, address, address_list, address_list_1, date_time, day_of_week, fields_$0, fields_$1, group, hour, mailbox, mailbox_list, message, message_$1, minute, name_addr, obs_addr_list, obs_fields, parse, path, received, received_token, second, trace, year, zone } from './parser/email.parser'
export class Email {

  prepended?: PrependedFieldBlock[]

  to?: NonemptyList<Address>
  subject?: string
  from?: NonemptyList<Mailbox>
  cc?: NonemptyList<Address>
  bcc?: NonemptyList<Address>
  sender?: Mailbox
  reply_to?: NonemptyList<Address>
  orig_date?: DateTime
  message_id?: string
  in_reply_to?: NonemptyList<string>
  references?: NonemptyList<string>
  comments?: string[]
  keywords?: string[][]
  optional_fields?: OptionalField[]

  body?: string

  /* ... */
  constructor(ast: message) {
    let fields = ast.fields
    let body = ast.D ? ((m: message_$1) => {
      switch (ast.D.F.kind) {
        case K.body_1: return concat(ast.D.F)
        case K.body_2: return concat(ast.D.F)
        default: { const exhaustive: never = ast.D.F; throw new Error(exhaustive) }
      }
    })(ast.D) : undefined
    switch (fields.kind) {
      case K.fields: return {
        prepended: Util.prependedFields(fields.prepended),
        ...Util.nonprependedFields(fields.nonprepended),
        body: body
      }
      case K.obs_fields: return { prepended: Util.obsoletePrepended(fields), ...Util.obsoleteFields(fields), body: body }
      default: { const exhaustive: never = fields; throw new Error(exhaustive) }
    }
  }

  static parse(emailStr: string): Email | undefined {
    try { return new Email(parse(emailStr).ast!) }
    catch (error) { return undefined }
  }
  static parseHeaders(input: string): NonprependedFields | undefined {
    let parser = new Parser(input)
    let fields = parser.matchfields(0)
    return fields ? Util.nonprependedFields(fields.nonprepended) : undefined
  }
}

type Address = Mailbox | Group

type NonemptyList<T> = [T, ...T[]]
interface HasKind {
  kind: string
}

interface NonprependedFields {
  to: NonemptyList<Address> | undefined
  subject: string | undefined
  from: NonemptyList<Mailbox>
  cc: NonemptyList<Address> | undefined
  bcc: NonemptyList<Address> | undefined
  sender: Mailbox | undefined
  reply_to: NonemptyList<Address> | undefined
  orig_date: DateTime
  message_id: string | undefined
  in_reply_to: NonemptyList<string> | undefined
  references: NonemptyList<string> | undefined
  comments: string[] | undefined
  keywords: string[][] | undefined
  optional_fields: { name: string, body: string }[]
}

type resent_field_kind = 'resent_date' | 'resent_from' | 'resent_sender' | 'resent_to' | 'resent_cc' | 'resent_bcc' | 'resent_msg_id' | 'resent_reply_to'
interface ResentFieldKind { kind: resent_field_kind }
interface ResentDate extends ResentFieldKind { resent_date: DateTime, kind: 'resent_date' }
interface ResentFrom extends ResentFieldKind { resent_from: NonemptyList<Mailbox>, kind: 'resent_from' }
interface ResentSender extends ResentFieldKind { resent_sender: Mailbox, kind: 'resent_sender' }
interface ResentTo extends ResentFieldKind { resent_to: NonemptyList<Address>, kind: 'resent_to' }
interface ResentCc extends ResentFieldKind { resent_cc: NonemptyList<Address>, kind: 'resent_cc' }
interface ResentBcc extends ResentFieldKind { resent_bcc: NonemptyList<Address> | undefined, kind: 'resent_bcc' }
interface ResentMsgId extends ResentFieldKind { resent_msg_id: string, kind: 'resent_msg_id' }
interface ResentReplyTo extends ResentFieldKind { resent_reply_to: NonemptyList<Address>, kind: 'resent_reply_to' }
type ResentField = ResentDate | ResentFrom | ResentSender | ResentTo | ResentCc | ResentBcc | ResentMsgId | ResentReplyTo

interface TraceField {
  return_path: Mailbox | undefined
  received: NonemptyList<ReceivedToken>
}

interface ObsoleteTraceField {
  return_path: Mailbox | undefined
  received: (string | Mailbox)[]
}

interface ReceivedToken {
  date_time: DateTime
  received_token: (string | Mailbox)[]
}

type OptionalField = { name: string, body: string }
type PrependedFieldBlock = { trace: TraceField, optional_fields: OptionalField[], kind: 'TraceFieldBlock' }
  | { trace: ObsoleteTraceField, optional_fields: OptionalField[], kind: 'ObsoleteTraceFieldBlock' }
  | { resent: ResentField[], kind: 'ResentFieldBlock' }

export let concat = (obj: any, ignore: Set<string> = new Set()): string => {
  ignore.add('kind')
  if (obj === null) return ''
  else if (typeof obj === 'string') {
    return obj
  } else if (obj instanceof Array) {
    return obj.map(el => concat(el, ignore)).join('')
  } else if (Util.isObject(obj)) {
    return Object.keys(obj).filter(k => !ignore.has(k)).sort().map(name => concat(obj[name], ignore)).join('')
  } else {
    throw new Error(`Unexpected type passed to 'concat': ${JSON.stringify(obj)}`)
  }
}

export class Util {



  static isObject(val: any) {
    if (val === null) { return false; }
    return ((typeof val === 'function') || (typeof val === 'object'));
  }

  static nonempty<T>(head: T, tail: T[] = []): NonemptyList<T> { return [head, ...tail] }

  // Note: call this before calling `obsoleteFields`
  static obsoletePrepended(fields: obs_fields): PrependedFieldBlock[] {
    let prepended = [] as PrependedFieldBlock[]
    let returnPaths: path[] = []
    let received: received_token[][] = []
    let prependedOpts: OptionalField[] = []
    fields.A.forEach(f => {
      switch (f.kind) {
        case K.obs_optional: {
          prependedOpts.push({ name: concat(f.A), body: concat(f.D).trim() })
          break
        }
        case K.obs_return: returnPaths.push(f.D); break
        case K.obs_received: received.push(f.D); break
        case K.obs_resent_date: {
          prepended.push({
            kind: 'ResentFieldBlock',
            resent: [{ resent_date: new DateTime(f.D), kind: "resent_date" }]
          })
          break
        }
        case K.obs_resent_from: {
          prepended.push({
            kind: 'ResentFieldBlock',
            resent: [{ resent_from: Util.fromMailboxList(f.D), kind: "resent_from" }]
          })
          break
        }
        case K.obs_resent_send: {
          prepended.push({
            kind: 'ResentFieldBlock',
            resent: [{ resent_sender: new Mailbox(f.D), kind: "resent_sender" }]
          })
          break
        }
        case K.obs_resent_rply: {
          prepended.push({
            kind: 'ResentFieldBlock',
            resent: [{ resent_reply_to: Util.fromAddressList(f.D), kind: 'resent_reply_to' }]
          })
          break
        }
        case K.obs_resent_to: {
          prepended.push({
            kind: 'ResentFieldBlock',
            resent: [{ resent_to: Util.fromAddressList(f.D), kind: 'resent_to' }]
          })
          break
        }
        case K.obs_resent_cc: {
          prepended.push({
            kind: 'ResentFieldBlock',
            resent: [{ resent_cc: Util.fromAddressList(f.D), kind: 'resent_cc' }]
          })
          break
        }
        case K.obs_resent_bcc: {
          prepended.push({
            kind: 'ResentFieldBlock',
            resent: [{ resent_bcc: Util.addressListOrUndefined(f), kind: 'resent_bcc' }]
          })
          break
        }
        case K.obs_resent_mid: {
          prepended.push({
            kind: 'ResentFieldBlock',
            resent: [{ resent_msg_id: concat(f.C).trim(), kind: 'resent_msg_id' }]
          })
          break
        }
        default: break
      }
    })
    received.forEach(r => {
      let returnPath = returnPaths.shift()
      prepended.push({
        trace: {
          return_path: returnPath ? ((path) => Mailbox.from_return_path(path))(returnPath) : undefined,
          received: Util.fromReceivedToken(r)
        },
        kind: 'ObsoleteTraceFieldBlock',
        optional_fields: prependedOpts,
      })
    })
    return prepended
  }

  // Note: call `obsoletePrepended` before calling this
  static obsoleteFields(fields: obs_fields): NonprependedFields {
    let result = {} as NonprependedFields
    fields.A.forEach(f => {
      switch (f.kind) {
        case K.obs_orig_date: result.orig_date = new DateTime(f.date_time); break;
        case K.obs_from: result.from = Util.fromMailboxList(f.mailbox_list); break;
        case K.obs_sender: result.sender = new Mailbox(f.mailbox); break;
        case K.obs_reply_to: result.reply_to = Util.fromAddressList(f.address_list); break;
        case K.obs_to: result.to = Util.fromAddressList(f.address_list); break;
        case K.obs_cc: result.cc = Util.fromAddressList(f.address_list); break;
        case K.obs_bcc: result.bcc = Util.addressListOrUndefined(f.address_list); break;
        case K.obs_message_id: result.message_id = concat(f.msg_id).trim(); break;
        case K.obs_in_reply_to: result.in_reply_to = f.D.map(m => concat(m).trim()) as NonemptyList<string>; break;
        case K.obs_references: result.in_reply_to = f.D.map(m => concat(m).trim()) as NonemptyList<string>; break;
        case K.obs_subject: result.subject = concat(f.body).trim(); break;
        case K.obs_comments: result.comments = [...result.comments || [], concat(f.D).trim()]; break;
        case K.obs_keywords: {
          result.keywords = [...result.keywords || [], [concat(f.keywords.head).trim(),
          ...f.keywords.tail.map(el => concat(el.F).trim())].filter(keyword => keyword !== '')]
          break
        }
        case K.obs_optional: {
          result.optional_fields = [...result.optional_fields || []
            , { name: concat(f.A), body: concat(f.D).trim() }]
          break
        }
        default: break
        // default: break; // TODO, finish all the exhaustive fields, and then make the default do exhaustive check
      }
    })
    return result
  }

  static nonprependedFields(nontrace: fields_$1[]): NonprependedFields {
    let result = {} as NonprependedFields
    nontrace.forEach(f => {
      switch (f.kind) {
        case K.orig_date: result.orig_date = new DateTime(f.date_time); break;
        case K.from: result.from = Util.fromMailboxList(f.mailbox_list); break;
        case K.sender: result.sender = new Mailbox(f.mailbox); break;
        case K.reply_to: result.reply_to = Util.fromAddressList(f.address_list); break;
        case K.to: result.to = Util.fromAddressList(f.address_list); break;
        case K.cc: result.cc = Util.fromAddressList(f.address_list); break;
        case K.bcc: result.bcc = Util.addressListOrUndefined(f.address_list); break;
        case K.message_id: result.message_id = concat(f.msg_id).trim(); break;
        case K.in_reply_to: result.in_reply_to = f.msg_id.map(m => concat(m).trim()) as NonemptyList<string>; break;
        case K.references: result.references = f.msg_id.map(m => concat(m).trim()) as NonemptyList<string>; break;
        case K.subject: result.subject = concat(f.body).trim(); break;
        case K.comments: result.comments = [...result.comments || [], concat(f.C).trim()]; break;
        case K.keywords: result.keywords = [...result.keywords || [], [concat(f.head).trim(), ...f.tail.map(k => concat(k.keyword).trim())]]; break;
        case K.optional_field: {
          result.optional_fields = [...result.optional_fields || []
            , { name: concat(f.name), body: concat(f.body).trim() }]
          break
        }
        default: { const exhaustive: never = f; throw new Error(exhaustive) }
      }
    })
    return result
  }

  static prependedFields(prepended: fields_$0[]): PrependedFieldBlock[] {
    let result: PrependedFieldBlock[] = prepended.map(block => {
      switch (block.kind) {
        // i.e. trace field + optional
        case K.fields_$0_1: return {
          kind: 'TraceFieldBlock',
          trace: Util.fromTrace(block.trace),
          optional_fields: block.optional_fields
            .map(optField => { return { name: concat(optField.name), body: concat(optField.body).trim() } })
        }
        // i.e. resent field block
        case K.fields_$0_2:
          let resentFields: ResentField[] = block.resent_field_block.map(resentField => {
            switch (resentField.kind) {
              case K.resent_date: return { resent_date: new DateTime(resentField.C), kind: "resent_date" }
              case K.resent_from: return { resent_from: Util.fromMailboxList(resentField.C), kind: "resent_from" }
              case K.resent_sender: return { resent_sender: new Mailbox(resentField.C), kind: "resent_sender" }
              case K.resent_to: return { resent_to: Util.fromAddressList(resentField.C), kind: "resent_to" }
              case K.resent_cc: return { resent_cc: Util.fromAddressList(resentField.C), kind: "resent_cc" }
              case K.resent_bcc: return { resent_bcc: Util.addressListOrUndefined(resentField.C), kind: "resent_bcc" }
              case K.resent_msg_id: return { resent_msg_id: concat(resentField.C).trim(), kind: "resent_msg_id" }
              default: { const exhaustive: never = resentField; throw new Error(exhaustive) }
            }
          })
          return { kind: 'ResentFieldBlock', resent: resentFields }
        default: { const exhaustive: never = block; throw new Error(exhaustive) }
      }
    })
    return result
  }

  static fromTrace(traceField: trace): TraceField {
    return {
      return_path: traceField.return_path ? ((path) => {
        return Mailbox.from_return_path(path)
      })(traceField.return_path.path) : undefined,

      received: ((received) => {
        let head = Util.fromReceived(received.shift()!)
        let tail = received.map(el => Util.fromReceived(el))
        return this.nonempty(head, tail)
      })(traceField.received)
    }
  }

  static fromReceived(received: received) {
    return {
      date_time: new DateTime(received.date_time),
      received_token: Util.fromReceivedToken(received.received_token)
    }
  }

  static fromReceivedToken(received_tokens: received_token[]): (string | Mailbox)[] {
    return received_tokens.map(received_token => {
      switch (received_token.kind) {
        case K.addr_spec: return new Mailbox(received_token)
        case K.angle_addr_1: return new Mailbox(received_token.addr_spec)
        case K.obs_angle_addr: return new Mailbox(received_token.addr_spec)
        case K.obs_angle_addr: return new Mailbox(received_token.addr_spec)
        default: return concat(received_token)
      }
    })
  }

  // TODO: just take this out, it's awful
  static addressListOrUndefined(mbAddressList: address_list | ASTNodeIntf | null) {
    switch (mbAddressList?.kind) {
      case K.address_list_1: return this.fromAddressList(mbAddressList as address_list_1)
      case K.obs_addr_list: return this.fromAddressList(mbAddressList as obs_addr_list)
      default: return undefined
    }
  }

  static fromMailboxList(mailbox_list: mailbox_list): NonemptyList<Mailbox> {
    switch (mailbox_list.kind) {
      case K.mailbox_list_1:
        return [new Mailbox(mailbox_list.head), ...mailbox_list.tail.map(el => new Mailbox(el.mailbox))]
      case K.obs_mbox_list:
        let tail = mailbox_list.tail.map(el => el.mailbox)
          .filter((el): el is mailbox => el !== null)
          .map(mb => new Mailbox(mb))
        return [new Mailbox(mailbox_list.head), ...tail]
      default: { const exhaustive: never = mailbox_list; throw new Error(exhaustive) }
    }
  }

  static fromAddressList(address_list: address_list): NonemptyList<Address> {
    switch (address_list.kind) {
      case K.address_list_1:
        return [Util.fromAddress(address_list.head),
        ...address_list.tail.map(el => Util.fromAddress(el.address))]
      case K.obs_addr_list:
        return [Util.fromAddress(address_list.head),
        ...address_list.tail
          .map(el => el.address)
          .filter((el): el is address => el !== null && !('I' in el))
          .map(address => Util.fromAddress(address))]
      default: throw new Error("There should only be 2 types of address_list")
    }
  }

  static fromAddress(address: address): Address {
    switch (address.kind) {
      case K.addr_spec: return new Mailbox(address)
      case K.name_addr: return new Mailbox(address)
      case K.group: return new Group(address)
      default: { const exhaustive: never = address; throw new Error(exhaustive) }
    }
  }
}

class Group {
  display_name!: string
  group_list?: NonemptyList<Mailbox>
  constructor(group: group) {
    let gl = ((): NonemptyList<Mailbox> | undefined => {
      if (group.group_list !== null) {
        let group_list = group.group_list
        switch (group_list.kind) {
          // mailbox list, with head/tail
          case K.mailbox_list_1:
            return [new Mailbox(group_list.head), ...group_list.tail.map(el => new Mailbox(el.mailbox))]
          // obsolete mailbox list, with head/tail
          case K.obs_mbox_list:
            let head = new Mailbox(group_list.head)
            let tail = group_list.tail.map(el => el.mailbox)
              .filter((el): el is mailbox => el !== null)
              .map(mb => new Mailbox(mb))
            return [head, ...tail]
          // obsolete group list is just CFWS
          case K.obs_group_list: return undefined
          case K.CFWS_1: return undefined
          case K.CFWS_2: return undefined
          default: { const exhaustive: never = group_list; throw new Error(exhaustive) }
        }
      }
    })()
    return {
      display_name: concat(group.display_name),
      group_list: gl
    }
  }
}

class Mailbox {
  name?: string
  email!: string

  constructor(mb: mailbox) {
    switch (mb.kind) {
      case K.addr_spec: return Mailbox.from_address_spec(mb)
      case K.name_addr: return Mailbox.from_name_addr(mb)
      default: { const exhaustive: never = mb; throw Error(exhaustive) }
    }
  }

  static from_address_spec(mb: addr_spec, name: string | undefined = undefined) {
    return { name: name, email: `${concat(mb.local)}@${concat(mb.domain)}`.trim() }
  }
  static from_name_addr(mb: name_addr) {
    let name = mb.name ? concat(mb.name).trim() : undefined
    // name_addr can be either angle_addr_1 or obs_angle_addr, but both have addr_spec
    return Mailbox.from_address_spec(mb.angle_addr.addr_spec, name)
  }

  static from_return_path(path: path): Mailbox | undefined {
    switch (path.kind) {
      case K.angle_addr_1: return new Mailbox(path.addr_spec)
      case K.obs_angle_addr: return new Mailbox(path.addr_spec)
      case K.path_2: return undefined
      default: { const exhaustive: never = path; throw new Error(exhaustive) }
    }
  }
}

type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
type DayOfMonth = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30' | '31'
type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec'

class DateTime {
  year: string
  month: Month
  day: DayOfMonth
  dayOfWeek?: DayOfWeek
  hour: string
  minute: string
  second: string | undefined
  zone: string

  constructor(dt: date_time) {
    this.dayOfWeek = dt.A?.B ? DateTime.dayOfWeek(dt.A?.B) as DayOfWeek : undefined
    this.day = dt.D.day.B + (dt.D.day.C || '') as DayOfMonth
    this.month = dt.D.month as Month
    this.year = DateTime.year(dt.D.year)
    this.hour = DateTime.hour(dt.E.time_of_day.hour)
    this.minute = DateTime.minute(dt.E.time_of_day.minute)
    this.second = DateTime.second(dt.E.time_of_day.D?.second)
    this.zone = DateTime.zone(dt.E.zone)
  }
  static dayOfWeek(d: day_of_week) {
    switch (d.kind) {
      case K.day_of_week_1: return d.B
      case K.day_of_week_2: return d.C.B
      default: { const exhaustive: never = d; throw new Error(exhaustive) }
    }
  }

  static year(y: year) {
    switch (y.kind) {
      case K.year_1: return y.B + y.C
      case K.obs_year: return y.B + y.C
      default: { const exhaustive: never = y; throw new Error(exhaustive) }
    }
  }
  static hour(h: hour): string {
    return typeof h === 'string' ? h : h.B
  }
  static minute(m: minute): string {
    return typeof m === 'string' ? m : m.B
  }
  static second(s: second | undefined): string | undefined {
    return s ? (typeof s === 'string' ? s : s.B) : undefined
  }
  static zone(z: zone) {
    switch (z.kind) {
      case K.zone_1: return z.B + z.E
      case K.zone_2: {
        switch (z.F) {
          case 'UT': return '+0000'
          case 'GMT': return '+0000'
          case 'EDT': return '+0400'
          case 'EST': return '+0500'
          case 'CDT': return '+0500'
          case 'CST': return '+0600'
          case 'MDT': return '+0600'
          case 'MST': return '+0700'
          case 'PDT': return '+0700'
          case 'PST': return '+0800'
          default: return '-0000'
        }
      }
    }
  }
}