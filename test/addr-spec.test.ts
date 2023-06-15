import { describe, expect, test } from '@jest/globals';
import { ASTKinds, parse } from '../parsers/addr-spec'

describe('addr-spec', () => {
  describe('local-part', () => {
    describe('dot-atom', () => {
      test("dot-atom-text", () => {
        let act = parse("abc.def@domain")
        expect(act.ast?.local_part.text.kind).toBe(ASTKinds.dot_atom)
      })
    })
  })
})