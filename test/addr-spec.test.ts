import { describe, expect, test } from '@jest/globals';
import { ASTKinds, dot_atom, parse, quoted_string } from '../parsers/addr-spec.parser'

describe('addr-spec', () => {
  describe('local-part', () => {
    describe('dot-atom', () => {
      test('dot-atom-text', () => {
        let local_part = parse('abc.def@domain').ast!.local_part
        expect(local_part.token.kind).toBe(ASTKinds.dot_atom)
        let dot_atom = local_part.token as dot_atom
        expect(dot_atom.parts).toEqual(['abc', 'def'])
      })
      describe('CFWS', () => {
        test('a single space', () => {
          expect(parse(' abc.def@domain').ast?.local_part.token.kind).toBe(ASTKinds.dot_atom)
        })
        test('multiple tabs', () => {
          expect(parse('\t\tabc.def@domain').ast?.local_part.token.kind).toBe(ASTKinds.dot_atom)
        })
        test('CRLF followed by space', () => {
          expect(parse('\r\n abc.def@domain').ast?.local_part.token.kind).toBe(ASTKinds.dot_atom)
        })
        test('comment before FWS', () => {
          expect(parse('(comment)\r\n abc.def@domain').ast?.local_part.token.kind).toBe(ASTKinds.dot_atom)
        })
      })
    })
    describe('quoted-string', () => {
      test('qcontent', () => {
        let local_part = parse('"abc"@domain').ast!.local_part
        expect(local_part.token.kind).toBe(ASTKinds.quoted_string)
        let quoted_string = local_part.token as quoted_string
        expect(quoted_string.contents).toBe("abc")
      })
      describe('CFWS', () => {
        test('a single space', () => {
          expect(parse(' "abc.def"@domain').ast?.local_part.token.kind).toBe(ASTKinds.quoted_string)
        })
        test('multiple tabs', () => {
          expect(parse('"\t\tabc.def"@domain').ast?.local_part.token.kind).toBe(ASTKinds.quoted_string)
        })
        test('CRLF followed by space', () => {
          expect(parse('\r\n "abc"@domain').ast?.local_part.token.kind).toBe(ASTKinds.quoted_string)
        })
        test('Mixture of CFWS and FWS', () => {
          expect(parse('(comment)\r\n "\r\n abc "\r\n (comment)@domain').ast?.local_part.token.kind).toBe(ASTKinds.quoted_string)
        })
      })
    })
  })
  describe('domain', () => {
    describe('dot-atom', () => {
      test('dot-atom-text', () => {
        let domain = parse('a@def.ghi.jkl').ast!.domain
        expect(domain.token.kind).toBe(ASTKinds.dot_atom)
        let dot_atom = domain.token as dot_atom
        expect(dot_atom.parts).toEqual(['def', 'ghi', 'jkl'])
      })
    })
  })
})