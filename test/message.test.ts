import { describe, expect, test } from '@jest/globals';
import { Parser, parse, dot_atom as dot_atom2 } from '../message.parser';

let msg = `Subject: Hello
Mime-Version: 1.0 (Mac OS X Mail 16.0 \(3731.500.231\))
Content-Type: multipart/alternative;
	boundary="Apple-Mail=_7B18F409-7DD5-4592-9AFB-A648138D421F"
X-Apple-Base-Url: x-msg://254/
X-Universally-Unique-Identifier: 363BEBB4-82A4-40C4-B5A5-E93DF2E2564F
X-Apple-Mail-Remote-Attachments: YES
From: spencerscorcelletti@gmail.com
X-Apple-Windows-Friendly: 1
Date: Fri, 16 Jun 2023 15:25:54 +0200
X-Apple-Mail-Signature:
Message-Id: <BCAD2945-C02D-4D1F-9D46-8BE520F81CD0@gmail.com>
X-Uniform-Type-Identifier: com.apple.mail-draft
To: foo@bar.com


--Apple-Mail=_7B18F409-7DD5-4592-9AFB-A648138D421F
Content-Transfer-Encoding: 7bit
Content-Type: text/plain;
	charset=us-ascii


--Apple-Mail=_7B18F409-7DD5-4592-9AFB-A648138D421F
Content-Transfer-Encoding: 7bit
Content-Type: text/html;
	charset=us-ascii

<html><head></head><body dir="auto" style="overflow-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-space;">This is the body</body></html>
--Apple-Mail=_7B18F409-7DD5-4592-9AFB-A648138D421F--
`

describe('message', () => {
  test('parser', () => {
    expect(parse(msg).errs).toEqual([])
  })
})