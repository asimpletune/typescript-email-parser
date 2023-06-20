import { ASTKinds, address_list, message, obs_subject, parse, subject, to } from './message.fields'
import { concat } from './util'
export class Email {
  private ast: message
  constructor(ast: message) { this.ast = ast }
  subject = (): string | undefined => {
    let fields = this.ast.fields
    if (fields.kind === ASTKinds.fields) {
      let subject = fields.L.find((field): field is subject => field.kind === ASTKinds.subject)
      return subject ? concat(subject._value).trim() : undefined
    } else {
      let subject = fields.A.find((field): field is obs_subject => field.kind === ASTKinds.obs_subject)
      return subject ? concat(subject._value).trim() : undefined
    }
  }
  to = () => {
    let fields = this.ast.fields
    if (fields.kind === ASTKinds.fields) {
      let toField = fields.L.find((field): field is to => field.kind === ASTKinds.to)
      if (toField !== undefined) {
        // toField._address_list
      }
    } else {

    }
  }

  static addressList(list: address_list) {
    if (list.kind === ASTKinds.address_list_1) {
      // list.
    }
  }
}