import { describe, expect, test } from '@jest/globals';
import { Parser, parse, dot_atom as dot_atom2, fields, subject, local_part, addr_spec } from './message.fields';
import { readFileSync } from 'fs'
import { Email } from './Email';

let input = readFileSync('../test/resources/hello.eml', 'ascii')
let ast = parse(input).ast!
let email = new Email(ast)

describe('fields', () => {

  test('to', () => {
    // TODO
  })
  test('subject', () => { expect(email.subject()).toBe("Re: ASDASDAS") })
})