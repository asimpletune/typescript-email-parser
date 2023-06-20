import { ASTNodeIntf, ASTKinds as K, addr_spec, address, address_list, address_list_1, angle_addr_1, bcc_$0, cc, fields, fields_$1, from, group, group_list, mailbox, mailbox_list, message, name_addr, obs_addr_list, obs_addr_list_$1, obs_addr_list_$1_$0, obs_angle_addr, obs_cc, obs_fields_$0, obs_from, obs_subject, obs_to, parse, subject, to } from './message.fields'
import { ASTKinds } from './metagrammar.parser'
import { concat } from './util'
export class Email {
  to: NonemptyList<Address> | undefined
  subject: string | undefined
  from: NonemptyList<Mailbox> | undefined
  cc: NonemptyList<Address> | undefined
  bcc: NonemptyList<Address> | undefined

  constructor(ast: message) {
    let fields = ast.fields
    switch (fields.kind) {
      case K.fields: {
        fields.L.forEach(f => {
          switch (f.kind) {
            case K.to: this.to = Util.fromAddressList(f.address_list); break;
            case K.from: this.from = Util.fromMailboxList(f.mailbox_list); break;
            case K.cc: this.cc = Util.fromAddressList(f.address_list); break;
            case K.bcc: this.bcc = Util.addressListOrUndefined(f.address_list); break;
            case K.subject: this.subject = concat(f._value).trim(); break;
            default: break; // TODO
          }
        })
        break;
      }
      case K.obs_fields: {
        fields.A.forEach(f => {
          switch (f.kind) {
            case K.obs_to: this.to = Util.fromAddressList(f.address_list); break;
            case K.obs_from: this.from = Util.fromMailboxList(f.mailbox_list); break;
            case K.obs_cc: this.cc = Util.fromAddressList(f.address_list); break;
            case K.obs_bcc: this.bcc = Util.addressListOrUndefined(f.address_list); break;
            case K.obs_subject: this.subject = concat(f._value).trim(); break;
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