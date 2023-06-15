import { describe, expect, test } from '@jest/globals';
import { ASTKinds, dot_atom, parse } from '../parsers/addr-spec.parser'

describe('addr-spec', () => {
  describe('local-part', () => {
    describe('dot-atom', () => {
      test("dot-atom-text", () => {
        let ast = parse('abc.def@domain').ast!
        expect(ast.local_part.token.kind).toBe(ASTKinds.dot_atom)
        let dot_atom = (ast.local_part.token as dot_atom)
        expect(dot_atom.head).toBe('abc')
        expect(dot_atom.tail).toEqual(['def'])
        expect(dot_atom.literal).toBe('abc.def')
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
      })
    })
  })
})