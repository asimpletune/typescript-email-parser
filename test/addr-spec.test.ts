import { describe, expect, test } from '@jest/globals';
import { parse } from '../parsers/addr-spec'

describe('addr-spec', () => {
  test('abc@def', () => { expect(parse('abc@def').errs).toHaveLength(0) })
  test('.abc@def', () => { expect(parse('.abc@def').errs.length).toBeGreaterThan(0) })
})