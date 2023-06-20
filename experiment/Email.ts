import { ASTKinds, addr_spec, address, address_list, angle_addr_1, from, group, group_list, mailbox, mailbox_list, message, name_addr, obs_addr_list_$1, obs_addr_list_$1_$0, obs_angle_addr, obs_fields_$0, obs_from, obs_subject, obs_to, parse, subject, to } from './message.fields'
import { concat } from './util'
export class Email {
  to: AddressList | undefined
  subject: string | undefined
  from: NonemptyList<Mailbox> | undefined

  constructor(ast: message) {
    this.to = Email.to(ast)
    this.subject = Email.subject(ast)
    this.from = Email.from(ast)
  }

  static subject(ast: message): string | undefined {
    let fields = ast.fields
    if (fields.kind === ASTKinds.fields) {
      let subject = fields.L.find((field): field is subject => field.kind === ASTKinds.subject)
      return subject ? concat(subject._value).trim() : undefined
    } else {
      let subject = fields.A.find((field): field is obs_subject => field.kind === ASTKinds.obs_subject)
      return subject ? concat(subject._value).trim() : undefined
    }
  }

  static to(ast: message): AddressList | undefined {
    let fields = ast.fields
    switch (fields.kind) {
      case ASTKinds.fields: {
        let toField = fields.L.find((field): field is to => field.kind === ASTKinds.to)
        return toField ? new AddressList(toField.address_list) : undefined
      }
      case ASTKinds.obs_fields: {
        let toField = fields.A.find((el): el is obs_to => el.kind === ASTKinds.obs_to)
        return toField ? new AddressList(toField.address_list) : undefined
      }
      default: { const exhaustive: never = fields; throw new Error(exhaustive) }
    }
  }

  static from(ast: message) {
    let fields = ast.fields
    switch (fields.kind) {
      case ASTKinds.fields: {
        let fromField = fields.L.find((field): field is from => field.kind === ASTKinds.from)
        return fromField ? Util.fromMailboxList(fromField.mailbox_list) : undefined
      }
      case ASTKinds.obs_fields: {
        let fromField = fields.A.find((el): el is obs_from => el.kind === ASTKinds.obs_from)
        return fromField ? Util.fromMailboxList(fromField.mailbox_list) : undefined
      }
      default: { const exhaustive: never = fields; throw new Error(exhaustive) }
    }
  }
}

type Address = Mailbox

class AddressList {
  head: Address
  tail: Address[]
  constructor(address_list: address_list) {
    switch (address_list.kind) {
      case ASTKinds.address_list_1:
        return {
          head: AddressList.fromAddress(address_list.head),
          tail: address_list.tail.map(el => AddressList.fromAddress(el.address))
        }
      case ASTKinds.obs_addr_list:
        return {
          head: AddressList.fromAddress(address_list.head),
          tail: address_list.tail
            .map(el => el.address)
            .filter((el): el is address => el !== null && !('I' in el))
            .map(address => AddressList.fromAddress(address))
        }
      default: throw new Error("There should only be 2 types of address_list")
    }
  }

  static fromAddress(address: address): Address {
    switch (address.kind) {
      case ASTKinds.addr_spec: return new Mailbox(address)
      case ASTKinds.name_addr: return new Mailbox(address)
      case ASTKinds.group: throw new Error("not implemented")
      default: { const exhaustive: never = address; throw new Error(exhaustive) }
    }
  }
}

type NonemptyList<T> = [T, ...T[]]

class Util {
  static fromMailboxList(mailbox_list: mailbox_list): NonemptyList<Mailbox> {
    switch (mailbox_list.kind) {
      case ASTKinds.mailbox_list_1:
        return [new Mailbox(mailbox_list.head), ...mailbox_list.tail.map(el => new Mailbox(el.mailbox))]
      case ASTKinds.obs_mbox_list:
        let tail = mailbox_list.tail.map(el => el.mailbox)
          .filter((el): el is mailbox => el !== null)
          .map(mb => new Mailbox(mb))
        return [new Mailbox(mailbox_list.head), ...tail]
      default: { const exhaustive: never = mailbox_list; throw new Error(exhaustive) }
    }
  }
}

class Group {
  display_name: string
  group_list?: Mailbox[]
  constructor(group: group) {
    let gl = (() => {
      if (group.group_list !== null) {
        let group_list = group.group_list
        switch (group_list.kind) {
          // mailbox list, with head/tail
          case ASTKinds.mailbox_list_1:
            return this.group_list = [new Mailbox(group_list.head)]
              .concat(group_list.tail.map(el => new Mailbox(el.mailbox)))
          // obsolete mailbox list, with head/tail
          case ASTKinds.obs_mbox_list:
            return this.group_list = [new Mailbox(group_list.head)]
              .concat(group_list.tail.map(el => el.mailbox)
                .filter((el): el is mailbox => el !== null)
                .map(mb => new Mailbox(mb)))
          // obsolete group list is just CFWS
          case ASTKinds.obs_group_list: return undefined
          case ASTKinds.CFWS_1: return undefined
          case ASTKinds.CFWS_2: return undefined
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
      case ASTKinds.addr_spec: return Mailbox.from_address_spec(mb)
      case ASTKinds.name_addr: return Mailbox.from_name_addr(mb)
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