import { Email as _Email } from './email'
import { Parser as _Parser, ASTKinds as _ASTKinds } from './parser/email.parser'

export class Email extends _Email { }
export class Parser extends _Parser { }
export let ASTKinds = _ASTKinds