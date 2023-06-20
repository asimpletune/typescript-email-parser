import { describe, expect, test } from '@jest/globals';
import { Parser, parse, dot_atom as dot_atom2, fields, subject, local_part, addr_spec, ASTKinds } from './message.fields';
import { readFileSync } from 'fs'
import { Email } from './Email';

let input = readFileSync('../test/resources/hello_world.eml', 'ascii')
let ast = parse(input).ast!
let email = new Email(ast)

describe('fields', () => {
  test('to', () => {
    expect(email.to?.[0]).toEqual({ "email": "bob@example.com", "name": undefined })
    expect(email.to?.slice(1)).toEqual([{ "email": "alice@example.com", "name": "Alice" }])
  })
  test('from', () => {
    expect(email.from).toEqual([{ "email": "test@example.com", "name": undefined }])
  })
  test('cc', () => {
    expect(email.cc).toEqual([{ "email": "carol@example.com", "name": "carol" }])
  })
  test('subject', () => { expect(email.subject).toBe("This is a test email") })
})