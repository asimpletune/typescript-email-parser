import { describe, expect, test } from '@jest/globals';
import { Parser, parse, dot_atom as dot_atom2, fields, subject, local_part, addr_spec, ASTKinds } from './message.fields';
import { readFileSync } from 'fs'
import { Email, Util } from './Email';

let email = new Email(parse(readFileSync('../test/resources/hello_world.eml', 'ascii')).ast!)
let reply = new Email(parse(readFileSync('../test/resources/hello_world_reply.eml', 'ascii')).ast!)

describe('fields', () => {
  test('orig_date', () => {
    expect(email.orig_date).toEqual({ "day": "20", "dayOfWeek": "Tue", "hour": "20", "minute": "28", "month": "Jun", "second": "11", "year": "2023", "zone": "+0200" })
  })
  test('from', () => {
    expect(email.from).toEqual([{ "email": "test@example.com", "name": undefined }])
  })
  test('sender', () => {
    expect(email.sender).toEqual({ "email": "savannah@example.com", "name": "Savannah Secretary" })
  })
  test('reply_to', () => {
    expect(email.reply_to).toEqual([{ "email": "olivia@example.com", "name": "olivia" }])
  })
  test('to', () => {
    expect(email.to?.[0]).toEqual({ "email": "bob@example.com", "name": undefined })
    expect(email.to?.slice(1)).toEqual([{ "email": "alice@example.com", "name": "Alice" }])
  })
  test('cc', () => {
    expect(email.cc).toEqual([{ "email": "carol@example.com", "name": "carol" }])
  })
  test('bcc', () => {
    expect(email.bcc).toEqual([{ "email": "eve@example.com", "name": "Eve" }])
  })
  test('message_id', () => {
    expect(email.message_id).toEqual("FE97A840-9401-4B26-902E-61EB5D6CD285@example.com")
  })
  test('in_reply_to', () => {
    expect(email.in_reply_to).toBeUndefined
    expect(reply.in_reply_to).toEqual(["FE97A840-9401-4B26-902E-61EB5D6CD285@example.com"])
  })
  test('references', () => {
    expect(email.references).toBeUndefined
    expect(reply.references).toEqual(["FE97A840-9401-4B26-902E-61EB5D6CD285@example.com"])
  })
  test('subject', () => { expect(email.subject).toBe("This is a test email") })
  test('comments', () => { expect(email.comments).toBe("This features is not used a whole lot") })
  test('keywords', () => { expect(email.keywords).toEqual(["tests", "emails", "open source", "example"]) })
})

describe('obsolete fields', () => {
  let obs_bcc = new Parser('Bcc: foo@example.com\r\n').matchobs_bcc(0)!
  expect(Util.addressListOrUndefined(obs_bcc.address_list)).toEqual([{ "email": "foo@example.com", "name": undefined }])
})