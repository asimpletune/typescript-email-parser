import { ASTNodeIntf, ASTKinds as K, addr_spec, address, address_list, address_list_1, date_time, day_of_week, group, hour, mailbox, mailbox_list, message, minute, name_addr, obs_addr_list, second, year, zone } from './message.fields'
import { concat } from './util'
export class Email {
  to: NonemptyList<Address> | undefined
  subject: string | undefined
  from: NonemptyList<Mailbox>
  cc: NonemptyList<Address> | undefined
  bcc: NonemptyList<Address> | undefined
  sender: Mailbox
  reply_to: NonemptyList<Address>
  orig_date: DateTime
  message_id: string | undefined
  in_reply_to: NonemptyList<string> | undefined
  references: NonemptyList<string> | undefined
  comments: string | undefined
  keywords: string[] | undefined

  constructor(ast: message) {
    let fields = ast.fields
    switch (fields.kind) {
      case K.fields: {
        fields.L.forEach(f => {
          switch (f.kind) {
            case K.orig_date: this.orig_date = new DateTime(f.date_time); break;
            case K.from: this.from = Util.fromMailboxList(f.mailbox_list); break;
            case K.sender: this.sender = new Mailbox(f.mailbox); break;
            case K.reply_to: this.reply_to = Util.fromAddressList(f.address_list); break;
            case K.to: this.to = Util.fromAddressList(f.address_list); break;
            case K.cc: this.cc = Util.fromAddressList(f.address_list); break;
            case K.bcc: this.bcc = Util.addressListOrUndefined(f.address_list); break;
            case K.message_id: this.message_id = concat(f.msg_id).trim(); break;
            case K.in_reply_to: this.in_reply_to = f.msg_id.map(m => concat(m).trim()) as NonemptyList<string>; break;
            case K.references: this.references = f.msg_id.map(m => concat(m).trim()) as NonemptyList<string>; break;
            case K.subject: this.subject = concat(f._value).trim(); break;
            case K.comments: this.comments = concat(f.C).trim(); break;
            case K.keywords: this.keywords = [concat(f.head).trim(), ...f.tail.map(k => concat(k.keyword).trim())]
            default: break; // TODO
          }
        })
        break;
      }
      case K.obs_fields: {
        fields.A.forEach(f => {
          switch (f.kind) {
            case K.obs_orig_date: this.orig_date = new DateTime(f.date_time); break;
            case K.obs_from: this.from = Util.fromMailboxList(f.mailbox_list); break;
            case K.obs_sender: this.sender = new Mailbox(f.mailbox); break;
            case K.obs_reply_to: this.reply_to = Util.fromAddressList(f.address_list); break;
            case K.obs_to: this.to = Util.fromAddressList(f.address_list); break;
            case K.obs_cc: this.cc = Util.fromAddressList(f.address_list); break;
            case K.obs_bcc: this.bcc = Util.addressListOrUndefined(f.address_list); break;
            case K.obs_message_id: this.message_id = concat(f.msg_id).trim(); break;
            case K.obs_in_reply_to: this.in_reply_to = f.D.map(m => concat(m).trim()) as NonemptyList<string>; break;
            case K.obs_references: this.in_reply_to = f.D.map(m => concat(m).trim()) as NonemptyList<string>; break;
            case K.obs_subject: this.subject = concat(f._value).trim(); break;
            case K.obs_comments: this.comments = concat(f.D).trim(); break;
            case K.obs_keywords: this.keywords = [concat(f.keywords.head).trim(), ...f.keywords.tail.map(el => concat(el.F).trim())].filter(keyword => keyword !== '')
            default: break; // TODO
          }
        })
        break;
      }
      default: { const exhaustive: never = fields; throw new Error(exhaustive) }
    }
  }
}

type Address = Mailbox | Group

type NonemptyList<T> = [T, ...T[]]
interface HasKind {
  kind: string
}


export class Util {
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
  display_name: string
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
  email: string

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